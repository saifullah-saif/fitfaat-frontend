const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const { deleteImage } = require("../utils/imageUpload");

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
  next();
};

// Get all groups for admin management with pagination
router.get("/allGroups", verifyToken, verifyAdmin, (req, res) => {
  // Get pagination parameters from query string
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status || 'all';
  const search = req.query.search || '';

  // Build the WHERE clause based on filters
  let whereClause = "g.admin_mod != 'Pending'";
  if (status !== 'all') {
    whereClause += ` AND g.admin_mod = '${status.charAt(0).toUpperCase() + status.slice(1)}'`;
  }

  if (search) {
    whereClause += ` AND (g.name LIKE '%${search}%' OR g.description LIKE '%${search}%')`;
  }

  // Query to get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM fitness_groups g
    WHERE ${whereClause}
  `;

  // Query to get paginated results
  const dataQuery = `
    SELECT
      g.group_id AS id,
      g.name,
      g.description,
      g.image_url AS image,
      g.location,
      g.creator_user_id,
      g.created_at,
      g.admin_mod,
      (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) AS members,
      (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE u.user_id = g.creator_user_id) AS creator_name,
      (SELECT u.profile_picture FROM users u WHERE u.user_id = g.creator_user_id) AS creator_avatar
    FROM fitness_groups g
    WHERE ${whereClause}
    ORDER BY g.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // Execute count query first
  db.query(countQuery, (err, countResults) => {
    if (err) {
      console.error("Error counting groups:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const totalGroups = countResults[0].total;
    const totalPages = Math.ceil(totalGroups / limit);

    // Then execute data query
    db.query(dataQuery, [limit, offset], (err, results) => {
      if (err) {
        console.error("Error fetching groups:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Format the results to match the expected structure in the frontend
      const formattedResults = results.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image || "/placeholder.svg",
        location: group.location || "Online",
        members: group.members,
        createdAt: new Date(group.created_at).toISOString().split('T')[0],
        status: group.admin_mod.toLowerCase(),
        creator: {
          id: group.creator_user_id,
          name: group.creator_name || "Unknown User",
          avatar: group.creator_avatar || "/placeholder.svg"
        }
      }));

      // Return with pagination metadata
      res.json({
        groups: formattedResults,
        pagination: {
          total: totalGroups,
          page,
          limit,
          totalPages
        }
      });
    });
  });
});

// Get pending group requests with pagination
router.get("/pendingGroups", verifyToken, verifyAdmin, (req, res) => {
  // Get pagination parameters from query string
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  // Build the WHERE clause based on filters
  let whereClause = "g.admin_mod = 'Pending'";
  if (search) {
    whereClause += ` AND (g.name LIKE '%${search}%' OR g.description LIKE '%${search}%')`;
  }

  // Query to get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM fitness_groups g
    WHERE ${whereClause}
  `;

  // Query to get paginated results
  const dataQuery = `
    SELECT
      g.group_id AS id,
      g.name,
      g.description,
      g.image_url AS image,
      g.location,
      g.creator_user_id,
      g.created_at,
      g.admin_mod,
      (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) AS members,
      (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE u.user_id = g.creator_user_id) AS creator_name,
      (SELECT u.profile_picture FROM users u WHERE u.user_id = g.creator_user_id) AS creator_avatar
    FROM fitness_groups g
    WHERE ${whereClause}
    ORDER BY g.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // Execute count query first
  db.query(countQuery, (err, countResults) => {
    if (err) {
      console.error("Error counting pending groups:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const totalGroups = countResults[0].total;
    const totalPages = Math.ceil(totalGroups / limit);

    // Then execute data query
    db.query(dataQuery, [limit, offset], (err, results) => {
      if (err) {
        console.error("Error fetching pending groups:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Format the results to match the expected structure in the frontend
      const formattedResults = results.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image || "/placeholder.svg",
        location: group.location || "Online",
        members: group.members,
        requestDate: new Date(group.created_at).toISOString().split('T')[0],
        status: "pending",
        creator: {
          id: group.creator_user_id,
          name: group.creator_name || "Unknown User",
          avatar: group.creator_avatar || "/placeholder.svg"
        }
      }));

      // Return with pagination metadata
      res.json({
        groups: formattedResults,
        pagination: {
          total: totalGroups,
          page,
          limit,
          totalPages
        }
      });
    });
  });
});

// Get specific group details
router.get("/group/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  const query = `
    SELECT
      g.group_id AS id,
      g.name,
      g.description,
      g.image_url AS image,
      g.location,
      g.creator_user_id,
      g.created_at,
      g.admin_mod,
      (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) AS members,
      (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE u.user_id = g.creator_user_id) AS creator_name,
      (SELECT u.profile_picture FROM users u WHERE u.user_id = g.creator_user_id) AS creator_avatar
    FROM fitness_groups g
    WHERE g.group_id = ?
  `;

  db.query(query, [groupId], (err, results) => {
    if (err) {
      console.error("Error fetching group details:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const group = results[0];
    const formattedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.image || "/placeholder.svg",
      location: group.location || "Online",
      members: group.members,
      createdAt: new Date(group.created_at).toISOString().split('T')[0],
      status: group.admin_mod.toLowerCase(),
      creator: {
        id: group.creator_user_id,
        name: group.creator_name || "Unknown User",
        avatar: group.creator_avatar || "/placeholder.svg"
      }
    };

    res.json(formattedGroup);
  });
});

// Approve a pending group
router.put("/approveGroup/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  // First check if the group exists and is pending
  const checkQuery = "SELECT * FROM fitness_groups WHERE group_id = ? AND admin_mod = 'Pending'";

  db.query(checkQuery, [groupId], (err, results) => {
    if (err) {
      console.error("Error checking group:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Pending group not found" });
    }

    // Update the group status to Active
    const updateQuery = "UPDATE fitness_groups SET admin_mod = 'Active', updated_at = NOW() WHERE group_id = ?";

    db.query(updateQuery, [groupId], (err, updateResult) => {
      if (err) {
        console.error("Error approving group:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        success: true,
        message: "Group approved successfully",
        groupId: groupId
      });
    });
  });
});

// Reject a pending group
router.put("/rejectGroup/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  // First check if the group exists and is pending
  const checkQuery = "SELECT * FROM fitness_groups WHERE group_id = ? AND admin_mod = 'Pending'";

  db.query(checkQuery, [groupId], (err, results) => {
    if (err) {
      console.error("Error checking group:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Pending group not found" });
    }

    // Delete the group and its related data
    const deleteQuery = "DELETE FROM fitness_groups WHERE group_id = ?";

    db.query(deleteQuery, [groupId], (err, deleteResult) => {
      if (err) {
        console.error("Error rejecting group:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        success: true,
        message: "Group rejected and removed successfully",
        groupId: groupId
      });
    });
  });
});

// Toggle group status (activate/deactivate)
router.put("/toggleStatus/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  // First get the current status
  const checkQuery = "SELECT admin_mod FROM fitness_groups WHERE group_id = ?";

  db.query(checkQuery, [groupId], (err, results) => {
    if (err) {
      console.error("Error checking group status:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const currentStatus = results[0].admin_mod;
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    // Update the group status
    const updateQuery = "UPDATE fitness_groups SET admin_mod = ?, updated_at = NOW() WHERE group_id = ?";

    db.query(updateQuery, [newStatus, groupId], (err, updateResult) => {
      if (err) {
        console.error("Error toggling group status:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        success: true,
        message: `Group ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`,
        groupId: groupId,
        newStatus: newStatus.toLowerCase()
      });
    });
  });
});

// Get group members
router.get("/groupMembers/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  const query = `
    SELECT
      gm.group_member_id,
      gm.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.profile_picture AS avatar,
      gm.role,
      gm.join_date,
      gm.status
    FROM group_members gm
    JOIN users u ON gm.user_id = u.user_id
    WHERE gm.group_id = ?
    ORDER BY
      CASE gm.role
        WHEN 'Admin' THEN 1
        WHEN 'Moderator' THEN 2
        ELSE 3
      END,
      gm.join_date
  `;

  db.query(query, [groupId], (err, results) => {
    if (err) {
      console.error("Error fetching group members:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Format the results
    const formattedResults = results.map(member => ({
      id: member.group_member_id,
      userId: member.user_id,
      name: member.name,
      avatar: member.avatar || "/placeholder.svg",
      role: member.role,
      joinDate: new Date(member.join_date).toISOString().split('T')[0],
      status: member.status
    }));

    res.json(formattedResults);
  });
});

// Update group details
router.put("/updateGroup/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;
  const { name, description, location } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  // First check if the group exists
  const checkQuery = "SELECT * FROM fitness_groups WHERE group_id = ?";

  db.query(checkQuery, [groupId], (err, results) => {
    if (err) {
      console.error("Error checking group:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Update the group details
    const updateQuery = `
      UPDATE fitness_groups
      SET name = ?, description = ?, location = ?, updated_at = NOW()
      WHERE group_id = ?
    `;

    db.query(updateQuery, [name, description, location, groupId], (err) => {
      if (err) {
        console.error("Error updating group:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Get the updated group details
      const getGroupQuery = `
        SELECT
          g.group_id AS id,
          g.name,
          g.description,
          g.image_url AS image,
          g.location,
          g.creator_user_id,
          g.created_at,
          g.admin_mod,
          (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) AS members,
          (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE u.user_id = g.creator_user_id) AS creator_name,
          (SELECT u.profile_picture FROM users u WHERE u.user_id = g.creator_user_id) AS creator_avatar
        FROM fitness_groups g
        WHERE g.group_id = ?
      `;

      db.query(getGroupQuery, [groupId], (err, results) => {
        if (err) {
          console.error("Error fetching updated group:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Group not found after update" });
        }

        const group = results[0];
        const formattedGroup = {
          id: group.id,
          name: group.name,
          description: group.description,
          image: group.image || "/placeholder.svg",
          location: group.location || "Online",
          members: group.members,
          createdAt: new Date(group.created_at).toISOString().split('T')[0],
          status: group.admin_mod.toLowerCase(),
          creator: {
            id: group.creator_user_id,
            name: group.creator_name || "Unknown User",
            avatar: group.creator_avatar || "/placeholder.svg"
          }
        };

        res.json({
          success: true,
          message: "Group updated successfully",
          group: formattedGroup
        });
      });
    });
  });
});

// Update group image
router.put("/updateGroupImage/:id", verifyToken, verifyAdmin, (req, res) => {
  const groupId = req.params.id;
  const { imageUrl } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  // First check if the group exists
  const checkQuery = "SELECT * FROM fitness_groups WHERE group_id = ?";

  db.query(checkQuery, [groupId], (err, results) => {
    if (err) {
      console.error("Error checking group:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Process the image (base64 to file)
    let imagePath = null;
    try {
      // Save image to the system and get the path
      imagePath = saveBase64Image(imageUrl);
      if (!imagePath) {
        return res.status(400).json({ error: "Failed to process image" });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      return res.status(500).json({ error: "Failed to process image" });
    }

    // Delete the old image if it exists
    const oldImage = results[0].image_url;
    if (oldImage) {
      try {
        deleteImage(oldImage);
      } catch (error) {
        console.warn("Error deleting old image:", error);
        // Continue anyway
      }
    }

    // Update the group image
    const updateQuery = "UPDATE fitness_groups SET image_url = ?, updated_at = NOW() WHERE group_id = ?";

    db.query(updateQuery, [imagePath, groupId], (err) => {
      if (err) {
        console.error("Error updating group image:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        success: true,
        message: "Group image updated successfully",
        image: imagePath
      });
    });
  });
});

module.exports = router;