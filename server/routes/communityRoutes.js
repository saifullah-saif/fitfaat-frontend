const express = require("express");
const db = require("../db.js");
const { verifyToken } = require("../middleware/authMiddleware.js");
const { saveBase64Image, deleteImage } = require("../utils/imageUpload.js");

const router = express.Router();

// Get all posts with user and group information
router.get("/fetchAllPosts", (req, res) => {
  const query = `
    SELECT
      p.post_id AS id,
      JSON_OBJECT(
        'name', CONCAT(u.first_name, ' ', u.last_name),
        'avatar', u.profile_picture,
        'username', u.username
      ) AS user,
      p.content,
      p.image_url AS image,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS likes,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id AND (c.admin_mod IS NULL OR c.admin_mod = 'Approved')) AS comments,
      CASE
        WHEN TIMESTAMPDIFF(MINUTE, p.created_at, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, p.created_at, NOW()), ' minutes ago')
        WHEN TIMESTAMPDIFF(HOUR, p.created_at, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, p.created_at, NOW()), ' hours ago')
        ELSE CONCAT(TIMESTAMPDIFF(DAY, p.created_at, NOW()), ' days ago')
      END AS time,
      JSON_OBJECT(
        'id', g.group_id,
        'name', g.name
      ) AS \`group\`,
      p.admin_mod
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    JOIN fitness_groups g ON p.group_id = g.group_id
    WHERE p.admin_mod IS NULL OR p.admin_mod = 'Approved'
    ORDER BY p.created_at DESC
    LIMIT 20
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // JSON strings in the results
    const formattedResults = results.map(post => {
      return {
        ...post,
        user: typeof post.user === 'string' ? JSON.parse(post.user) : post.user,
        group: typeof post.group === 'string' ? JSON.parse(post.group) : post.group
      };
    });

    res.json(formattedResults);
  });
});

// Get all groups with member count
router.get("/fetchAllGroups", (req, res) => {
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
      (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) AS members
    FROM fitness_groups g
    WHERE g.admin_mod = 'Active' OR g.admin_mod IS NULL
    ORDER BY members DESC, g.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(results);
  });
});

// Create a new post
router.post("/createPost", verifyToken, (req, res) => {
  const { content, groupId, imageUrl } = req.body;


  const userId = req.user.id;
  console.log("User ID from token:", userId);

  if (!content || !groupId) {
    return res.status(400).json({ error: "Content and group ID are required" });
  }

  // Process image if provided
  let imagePath = null;
  if (imageUrl) {
    try {
      // Save image to the system and get the path
      imagePath = saveBase64Image(imageUrl);
      if (!imagePath) {
        console.warn("Failed to process image, continuing without image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }

  const query = `
    INSERT INTO posts (user_id, group_id, content, image_url, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [userId, groupId, content, imagePath], (err, result) => {
    if (err) {
      console.error("Error creating post:", err, "User ID:", userId, "Group ID:", groupId);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      postId: result.insertId,
      imageUrl: imagePath
    });
  });
});

// Like or unlike a post
router.post("/likePost", verifyToken, (req, res) => {
  const { postId } = req.body;

  // Check if user ID exists in the token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated properly" });
  }

  const userId = req.user.id;
  console.log("User ID from token:", userId);

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  // alredy liked?
  const checkQuery = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";

  db.query(checkQuery, [userId, postId], (err, results) => {
    if (err) {
      console.error("Error checking like:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      //unlike
      const unlikeQuery = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";

      db.query(unlikeQuery, [userId, postId], (err) => {
        if (err) {
          console.error("Error unliking post:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.json({
          success: true,
          liked: false,
          message: "Post unliked successfully"
        });
      });
    } else {
      // like
      const likeQuery = "INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())";

      db.query(likeQuery, [userId, postId], (err) => {
        if (err) {
          console.error("Error liking post:", err, "User ID:", userId, "Post ID:", postId);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.json({
          success: true,
          liked: true,
          message: "Post liked successfully"
        });
      });
    }
  });
});

// Join or leave a group
router.post("/joinGroup", verifyToken, (req, res) => {
  const { groupId } = req.body;

  // Check if user ID exists in the token


  const userId = req.user.id;
  console.log("User ID from token:", userId);

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  // Check if user is already a member
  const checkQuery = "SELECT * FROM group_members WHERE user_id = ? AND group_id = ?";

  db.query(checkQuery, [userId, groupId], (err, results) => {
    if (err) {
      console.error("Error checking group membership:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {

      const leaveQuery = "DELETE FROM group_members WHERE user_id = ? AND group_id = ?";

      db.query(leaveQuery, [userId, groupId], (err) => {
        if (err) {
          console.error("Error leaving group:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.json({
          success: true,
          joined: false,
          message: "Left group successfully"
        });
      });
    } else {
      // User is not a member yet, so join the group
      const joinQuery = "INSERT INTO group_members (user_id, group_id, join_date) VALUES (?, ?, NOW())";

      db.query(joinQuery, [userId, groupId], (err) => {
        if (err) {
          console.error("Error joining group:", err, "User ID:", userId, "Group ID:", groupId);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.json({
          success: true,
          joined: true,
          message: "Joined group successfully"
        });
      });
    }
  });
});

// Get user's joined groups
router.get("/userGroups", verifyToken, (req, res) => {

  const userId = req.user.id;

  const query = `
    SELECT g.group_id AS id
    FROM fitness_groups g
    JOIN group_members gm ON g.group_id = gm.group_id
    WHERE gm.user_id = ? AND (g.admin_mod = 'Active' OR g.admin_mod IS NULL)
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user groups:", err, "User ID:", userId);
      return res.status(500).json({ error: "Internal server error" });
    }

    const groupIds = results.map(group => group.id);
    res.json(groupIds);
  });
});


router.get("/userLikes", verifyToken, (req, res) => {


  const userId = req.user.id;
  console.log("User ID from token (userLikes):", userId);

  const query = `
    SELECT p.post_id AS id
    FROM posts p
    JOIN likes l ON p.post_id = l.post_id
    WHERE l.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user likes:", err, "User ID:", userId);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Extract just the post IDs
    const postIds = results.map(post => post.id);

    res.json(postIds);
  });
});

// Get a specific group by ID
router.get("/group/:id", (req, res) => {
  const groupId = req.params.id;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }
  const groupQuery = `
    SELECT
      g.group_id AS id,
      g.name,
      g.description,
      g.image_url AS image,
      g.location,
      g.creator_user_id,
      g.created_at,
      g.admin_mod,
      (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) AS members
    FROM fitness_groups g
    WHERE g.group_id = ? AND (g.admin_mod = 'Active' OR g.admin_mod IS NULL)
  `;

  db.query(groupQuery, [groupId], (err, groupResults) => {
    if (err) {
      console.error("Error fetching group:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (groupResults.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const group = {
      ...groupResults[0],

    };

    // Get posts for this group
    const postsQuery = `
      SELECT
        p.post_id AS id,
        JSON_OBJECT(
          'name', CONCAT(u.first_name, ' ', u.last_name),
          'avatar', u.profile_picture,
          'username', u.username
        ) AS user,
        p.content,
        p.image_url AS image,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS likes,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id AND (c.admin_mod IS NULL OR c.admin_mod = 'Approved')) AS comments,
        CASE
          WHEN TIMESTAMPDIFF(MINUTE, p.created_at, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, p.created_at, NOW()), ' minutes ago')
          WHEN TIMESTAMPDIFF(HOUR, p.created_at, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, p.created_at, NOW()), ' hours ago')
          ELSE CONCAT(TIMESTAMPDIFF(DAY, p.created_at, NOW()), ' days ago')
        END AS time,
        JSON_OBJECT(
          'id', g.group_id,
          'name', g.name
        ) AS \`group\`,
        p.admin_mod
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      JOIN fitness_groups g ON p.group_id = g.group_id
      WHERE p.group_id = ? AND (p.admin_mod IS NULL OR p.admin_mod = 'Approved')
      ORDER BY p.created_at DESC
    `;

    db.query(postsQuery, [groupId], (err, postsResults) => {
      if (err) {
        console.error("Error fetching group posts:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Parse the JSON strings in the results
      const posts = postsResults.map(post => {
        return {
          ...post,
          user: typeof post.user === 'string' ? JSON.parse(post.user) : post.user,
          group: typeof post.group === 'string' ? JSON.parse(post.group) : post.group
        };
      });

      // Check if user is a member of this group
      let isMember = false;
      if (req.cookies.token) {
        try {
          const jwt = require('jsonwebtoken');
          const { JWT_SECRET_KEY } = require('../middleware/authMiddleware.js');
          const decoded = jwt.verify(req.cookies.token, JWT_SECRET_KEY);

          if (!decoded) {
            console.error("Invalid token structure: token is null or undefined");
            return res.json({ group, posts, isMember: false });
          }

          // Ensure we have a user ID from the token
          const userId = decoded.user_id || decoded.id;

          if (!userId) {
            console.error("Invalid token structure: no user_id or id field", decoded);
            return res.json({ group, posts, isMember: false });
          }

          console.log("User ID from token (group/:id):", userId);

          const membershipQuery = "SELECT * FROM group_members WHERE user_id = ? AND group_id = ?";
          db.query(membershipQuery, [userId, groupId], (err, membershipResults) => {
            if (err) {
              console.error("Error checking group membership:", err, "User ID:", userId, "Group ID:", groupId);
              // Continue without membership info
              return res.json({ group, posts, isMember: false });
            }

            isMember = membershipResults.length > 0;
            res.json({ group, posts, isMember });
          });
        } catch (error) {
          console.error("Token verification error:", error);
          // Token invalid or expired
          res.json({ group, posts, isMember: false });
        }
      } else {
        // No token
        res.json({ group, posts, isMember: false });
      }
    });
  });
});


// all fitness partners with filtering options
router.get("/fetchPartners", verifyToken, (req, res) => {
  // filter parameters from query string
  const maxDistance = req.query.distance || 20;
  const interest = req.query.interest || 'all';


  const userId = req.user.id;

  // Get user's location from the database
  const userLocationQuery = `
    SELECT location
    FROM users
    WHERE user_id = ?
  `;

  db.query(userLocationQuery, [userId], (err, userResults) => {
    if (err) {
      console.error("Error fetching user location:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse user location from "(latitude, longitude)" format
    let userLat = 23.8103; // Default to Dhaka if not set
    let userLng = 90.4125;

    if (userResults[0].location) {
      try {
        // Extract latitude and longitude from the string format "(latitude, longitude)"
        const locationMatch = userResults[0].location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
        if (locationMatch && locationMatch.length === 3) {
          userLat = parseFloat(locationMatch[1]);
          userLng = parseFloat(locationMatch[2]);
        }
      } catch (error) {
        console.error("Error parsing user location:", error);
        // Continue with default coordinates
      }
    }

    // Build the query to find partners
    // Using Haversine formula to calculate distance between two points on Earth
    let query = `
      SELECT
        u.user_id AS id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.username,
        u.profile_picture AS avatar,
        u.bio,
        ur.rank_title AS level,
        u.location,
        u.interests,
        (
          6371 * acos(
            cos(radians(?)) *
            cos(radians(SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(REPLACE(u.location, '(', ''), ')', ''), ',', 1), ' ', -1))) *
            cos(radians(SUBSTRING_INDEX(REPLACE(REPLACE(u.location, '(', ''), ')', ''), ',', -1)) - radians(?)) +
            sin(radians(?)) *
            sin(radians(SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(REPLACE(u.location, '(', ''), ')', ''), ',', 1), ' ', -1)))
          )
        )  AS distance_miles, /* Convert km to miles */

        FLOOR(5 + RAND() * 20) AS reviews /* Mock number of reviews */
      FROM users u
      LEFT JOIN user_rankings ur ON u.user_id = ur.user_id AND ur.is_current = TRUE
      WHERE u.user_id != ? /* Exclude the current user */
    `;

    const queryParams = [userLat, userLng, userLat, userId];


    if (interest !== 'all') {
      query += `
        AND u.interests LIKE ?
      `;
      queryParams.push(`%${interest}%`);
    }

    // Add distance filter
    query += `
      HAVING distance_miles <= ?
      ORDER BY distance_miles ASC
    `;
    queryParams.push(maxDistance);

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error fetching partners:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Format
      const partners = results.map(partner => {

        let interests = [];
        try {
          if (partner.interests) {
            interests = partner.interests.split(/[,;|]+/).map(item => item.trim());
            interests = interests.filter(item => item.length > 0);
          }
        } catch (e) {
          console.error("Error parsing interests:", e);
        }


        const distanceStr = partner.distance_miles < 1
          ? `${Math.round(partner.distance_miles * 5280)} feet away`
          : `${partner.distance_miles.toFixed(1)} miles away`;

        let partnerLat = 23.8103; // Default to Dhaka if not set
        let partnerLng = 90.4125;

        if (partner.location) {
          try {
            const locationMatch = partner.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
            if (locationMatch && locationMatch.length === 3) {
              partnerLat = parseFloat(locationMatch[1]);
              partnerLng = parseFloat(locationMatch[2]);
            }
          } catch (error) {
            console.error("Error parsing partner location:", error);
          }
        }

        return {
          id: partner.id,
          name: partner.name,
          username: partner.username,
          avatar: partner.avatar,
          bio: partner.bio || "Fitness enthusiast looking for workout partners.",
          level: partner.level || "Intermediate",
          location: {
            lat: partnerLat,
            lng: partnerLng
          },
          distance: distanceStr,
          interests: interests.length > 0 ? interests : ["Running", "Fitness"],
          rating: partner.rating,
          reviews: partner.reviews
        };
      });

      res.json(partners);
    });
  });
});

// Update users current location
router.post("/updateLocation", verifyToken, (req, res) => {
  const { latitude, longitude } = req.body;

  // Check if user ID exists in the token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated properly" });
  }

  const userId = req.user.id;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  // Format the location as "(latitude, longitude)"
  const locationString = `(${latitude}, ${longitude})`;

  const query = `
    UPDATE users
    SET location = ?
    WHERE user_id = ?
  `;

  db.query(query, [locationString, userId], (err) => {
    if (err) {
      console.error("Error updating user location:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json({
      success: true,
      message: "Location updated successfully"
    });
  });
});

// Get user interests
router.get("/userInterests", verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT interests
    FROM users
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user interests:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    let interests = [];

    if (results.length > 0 && results[0].interests) {
      try {

        interests = results[0].interests.split(/[,;|]+/).map(item => item.trim());
        interests = interests.filter(item => item.length > 0);
      } catch (e) {
        console.error("Error parsing interests:", e);
      }
    }

    res.json(interests);
  });
});


// Send connection request
router.post("/sendConnectionRequest", verifyToken, (req, res) => {
  const { receiverId } = req.body;

  const senderId = req.user.id;

  if (!receiverId) {
    return res.status(400).json({ error: "Receiver ID is required" });
  }

  // Check if users are already connected
  const checkConnectionQuery = `
    SELECT * FROM user_connections
    WHERE (user_id = ? AND connected_user_id = ?)
    AND status = 'Accepted'
  `;

  db.query(checkConnectionQuery, [senderId, receiverId, receiverId, senderId], (err, connections) => {
    if (err) {
      console.error("Error checking existing connections:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (connections.length > 0) {
      return res.status(400).json({ error: "Users are already connected" });
    }

    // Check if there's already a pending request
    const checkRequestQuery = `
      SELECT * FROM user_connections
      WHERE ((user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?))
      AND status = 'Pending'
    `;

    db.query(checkRequestQuery, [senderId, receiverId, receiverId, senderId], (err, requests) => {
      if (err) {
        console.error("Error checking existing requests:", err);
        return res.status(500).json({ error: "Internal server error" });
      }


      const incomingRequest = requests.find(req => req.user_id === receiverId && req.connected_user_id === senderId);

      if (incomingRequest) {

        const acceptQuery = `
          UPDATE user_connections
          SET status = 'Accepted', updated_at = NOW()
          WHERE connection_id = ?
        `;

        db.query(acceptQuery, [incomingRequest.connection_id], (err) => {
          if (err) {
            console.error("Error accepting request:", err);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Also create a reciprocal connection record
          const createReciprocalQuery = `
            INSERT INTO user_connections (user_id, connected_user_id, user_a, user_b, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'Accepted', NOW(), NOW())
          `;

          // Use the smaller ID as user_a and the larger as user_b for consistency
          const userA = Math.min(senderId, receiverId);
          const userB = Math.max(senderId, receiverId);

          db.query(createReciprocalQuery, [senderId, receiverId, userA, userB], (err) => {
            if (err) {
              console.error("Error creating reciprocal connection:", err);
              // Continue even if this fails, as the main connection is already updated
            }

            res.json({
              success: true,
              message: "Connection request accepted",
              status: "connected",
              connection_id: incomingRequest.connection_id
            });
          });
        });

        return;
      }

      // Check if there's already an outgoing request
      const outgoingRequest = requests.find(req => req.user_id === senderId && req.connected_user_id === receiverId);

      if (outgoingRequest) {
        return res.json({
          success: true,
          message: "Connection request already sent",
          status: "pending-outgoing",
          request_id: outgoingRequest.connection_id
        });
      }

      // Create a new connection request
      // Use the smaller ID as user_a and the larger as user_b for consistency
      const userA = Math.min(senderId, receiverId);
      const userB = Math.max(senderId, receiverId);

      const createRequestQuery = `
        INSERT INTO user_connections (user_id, connected_user_id, user_a, user_b, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'Pending', NOW(), NOW())
      `;

      db.query(createRequestQuery, [senderId, receiverId, userA, userB], (err, result) => {
        if (err) {
          console.error("Error creating connection request:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Get sender information to return
        const getSenderQuery = `
          SELECT user_id, first_name, last_name, username, profile_picture
          FROM users
          WHERE user_id = ?
        `;

        db.query(getSenderQuery, [senderId], (err, senders) => {
          if (err) {
            console.error("Error fetching sender info:", err);
            return res.status(500).json({ error: "Internal server error" });
          }

          const sender = senders[0] || {};

          res.json({
            success: true,
            message: "Connection request sent",
            status: "pending-outgoing",
            request_id: result.insertId,
            sender: {
              id: sender.user_id,
              name: `${sender.first_name} ${sender.last_name}`,
              username: sender.username,
              avatar: sender.profile_picture
            }
          });
        });
      });
    });
  });
});

// Get connection requests
router.get("/connectionRequests", verifyToken, (req, res) => {

  const userId = req.user.id;

  // Get all connection requests for the user
  const query = `
    SELECT
      uc.connection_id,
      uc.user_id AS sender_id,
      uc.connected_user_id AS receiver_id,
      uc.status,
      uc.created_at,
      uc.updated_at,
      u.first_name,
      u.last_name,
      u.username,
      u.profile_picture
    FROM user_connections uc
    JOIN users u ON uc.user_id = u.user_id
    WHERE uc.connected_user_id = ? AND uc.status = 'Pending'
    ORDER BY uc.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching connection requests:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const requests = results.map(req => ({
      id: req.connection_id,
      sender: {
        id: req.sender_id,
        name: `${req.first_name} ${req.last_name}`,
        username: req.username,
        avatar: req.profile_picture
      },
      status: req.status,
      timestamp: new Date(req.created_at).toISOString()
    }));

    res.json(requests);
  });
});

// Get connections
router.get("/connections", verifyToken, (req, res) => {
  // Check if user ID exists in the token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated properly" });
  }

  const userId = req.user.id;

  // Get all connections for the user
  const query = `
    SELECT
      uc.connection_id,
      uc.user_id,
      uc.connected_user_id,
      uc.created_at,
      u.user_id,
      u.first_name,
      u.last_name,
      u.username,
      u.profile_picture
    FROM user_connections uc
    JOIN users u ON uc.connected_user_id = u.user_id
    WHERE uc.user_id = ? AND uc.status = 'Accepted'
    ORDER BY uc.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching connections:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const connections = results.map(conn => ({
      id: conn.connection_id,
      user: {
        id: conn.user_id,
        name: `${conn.first_name} ${conn.last_name}`,
        username: conn.username,
        avatar: conn.profile_picture
      },
      timestamp: new Date(conn.created_at).toISOString()
    }));

    res.json(connections);
  });
});

// Respond to connection request (accept or reject)
router.post("/respondToConnectionRequest", verifyToken, (req, res) => {
  const { requestId, action } = req.body;

  // Check if user ID exists in the token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated properly" });
  }

  const userId = req.user.id;

  if (!requestId) {
    return res.status(400).json({ error: "Request ID is required" });
  }

  if (!action || (action !== 'accept' && action !== 'reject')) {
    return res.status(400).json({ error: "Valid action (accept or reject) is required" });
  }

  // Verify the request belongs to the user
  const checkRequestQuery = `
    SELECT * FROM user_connections
    WHERE connection_id = ? AND connected_user_id = ? AND status = 'Pending'
  `;

  db.query(checkRequestQuery, [requestId, userId], (err, requests) => {
    if (err) {
      console.error("Error checking request:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (requests.length === 0) {
      return res.status(404).json({ error: "Connection request not found or already processed" });
    }

    const request = requests[0];

    if (action === 'accept') {
      // Accept the request
      const acceptQuery = `
        UPDATE user_connections
        SET status = 'Accepted', updated_at = NOW()
        WHERE connection_id = ?
      `;

      db.query(acceptQuery, [requestId], (err) => {
        if (err) {
          console.error("Error accepting request:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Create a reciprocal connection
        const createReciprocalQuery = `
          INSERT INTO user_connections (user_id, connected_user_id, user_a, user_b, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'Accepted', NOW(), NOW())
        `;

        // Use the smaller ID as user_a and the larger as user_b for consistency
        const userA = Math.min(userId, request.user_id);
        const userB = Math.max(userId, request.user_id);

        db.query(createReciprocalQuery, [userId, request.user_id, userA, userB], (err) => {
          if (err) {
            console.error("Error creating reciprocal connection:", err);
            // Continue even if this fails, as the main connection is already updated
          }

          res.json({
            success: true,
            message: "Connection request accepted",
            status: "connected"
          });
        });
      });
    } else {
      // Reject the request
      const rejectQuery = `
        UPDATE user_connections
        SET status = 'Rejected', updated_at = NOW()
        WHERE connection_id = ?
      `;

      db.query(rejectQuery, [requestId], (err) => {
        if (err) {
          console.error("Error rejecting request:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.json({
          success: true,
          message: "Connection request rejected",
          status: "rejected"
        });
      });
    }
  });
});

// Get connection status with another user
router.get("/connectionStatus/:partnerId", verifyToken, (req, res) => {
  const partnerId = req.params.partnerId;
  const userId = req.user.id;

  if (!partnerId) {
    return res.status(400).json({ error: "Partner ID is required" });
  }

  // Check if users are already connected
  const checkConnectionQuery = `
    SELECT * FROM user_connections
    WHERE user_id = ? AND connected_user_id = ? AND status = 'Accepted'
  `;

  db.query(checkConnectionQuery, [userId, partnerId], (err, connections) => {
    if (err) {
      console.error("Error checking connections:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (connections.length > 0) {
      return res.json({
        status: "connected",
        connection: {
          id: connections[0].connection_id,
          timestamp: new Date(connections[0].created_at).toISOString()
        }
      });
    }

    // Check for reciprocal connection (if partner has connected to user)
    const checkReciprocalQuery = `
      SELECT * FROM user_connections
      WHERE user_id = ? AND connected_user_id = ? AND status = 'Accepted'
    `;

    db.query(checkReciprocalQuery, [partnerId, userId], (err, reciprocalConnections) => {
      if (err) {
        console.error("Error checking reciprocal connections:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (reciprocalConnections.length > 0) {
        return res.json({
          status: "connected",
          connection: {
            id: reciprocalConnections[0].connection_id,
            timestamp: new Date(reciprocalConnections[0].created_at).toISOString()
          }
        });
      }

      // Check for pending outgoing request
      const checkOutgoingQuery = `
        SELECT * FROM user_connections
        WHERE user_id = ? AND connected_user_id = ? AND status = 'Pending'
      `;

      db.query(checkOutgoingQuery, [userId, partnerId], (err, outgoingRequests) => {
        if (err) {
          console.error("Error checking outgoing requests:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (outgoingRequests.length > 0) {
          return res.json({
            status: "pending-outgoing",
            request: {
              id: outgoingRequests[0].connection_id,
              timestamp: new Date(outgoingRequests[0].created_at).toISOString()
            }
          });
        }

        // Check for pending incoming request
        const checkIncomingQuery = `
          SELECT * FROM user_connections
          WHERE user_id = ? AND connected_user_id = ? AND status = 'Pending'
        `;

        db.query(checkIncomingQuery, [partnerId, userId], (err, incomingRequests) => {
          if (err) {
            console.error("Error checking incoming requests:", err);
            return res.status(500).json({ error: "Internal server error" });
          }

          if (incomingRequests.length > 0) {
            return res.json({
              status: "pending-incoming",
              request: {
                id: incomingRequests[0].connection_id,
                timestamp: new Date(incomingRequests[0].created_at).toISOString()
              }
            });
          }

          // No connection or request found
          res.json({
            status: "none"
          });
        });
      });
    });
  });
});

// Disconnect from a partner
router.post("/disconnectPartner", verifyToken, (req, res) => {
  const { partnerId } = req.body;

  // Check if user ID exists in the token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated properly" });
  }

  const userId = req.user.id;

  if (!partnerId) {
    return res.status(400).json({ error: "Partner ID is required" });
  }

  // Delete the connection records in both directions
  const deleteConnectionQuery = `
    DELETE FROM user_connections
    WHERE ((user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?))
    AND status = 'Accepted'
  `;

  db.query(deleteConnectionQuery, [userId, partnerId, partnerId, userId], (err, result) => {
    if (err) {
      console.error("Error disconnecting partner:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Connection not found" });
    }

    res.json({
      success: true,
      message: "Successfully disconnected from partner"
    });
  });
});

// Get chat messages between two users
router.get("/messages/:partnerId", verifyToken, (req, res) => {
  const partnerId = req.params.partnerId;
  const userId = req.user.id;

  if (!partnerId) {
    return res.status(400).json({ error: "Partner ID is required" });
  }

  // Get messages between the two users (in both directions)
  const query = `
    SELECT
      m.message_id,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.sent_at,
      u_sender.first_name AS sender_first_name,
      u_sender.last_name AS sender_last_name,
      u_sender.username AS sender_username,
      u_sender.profile_picture AS sender_profile_picture
    FROM messages m
    JOIN users u_sender ON m.sender_id = u_sender.user_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.sent_at ASC
  `;

  db.query(query, [userId, partnerId, partnerId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const messages = results.map(msg => ({
      id: msg.message_id,
      sender: msg.sender_id === parseInt(userId) ? "me" : {
        id: msg.sender_id,
        name: `${msg.sender_first_name} ${msg.sender_last_name}`,
        username: msg.sender_username,
        avatar: msg.sender_profile_picture
      },
      content: msg.content,
      timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sent_at: msg.sent_at
    }));

    res.json(messages);
  });
});

// Send a message to another user
router.post("/sendMessage", verifyToken, (req, res) => {
  const { receiverId, content } = req.body;

  // Check if user ID exists in the token
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated properly" });
  }

  const senderId = req.user.id;

  if (!receiverId) {
    return res.status(400).json({ error: "Receiver ID is required" });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Message content is required" });
  }

  // Insert the message into the database
  const query = `
    INSERT INTO messages (sender_id, receiver_id, content, sent_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(query, [senderId, receiverId, content], (err, result) => {
    if (err) {
      console.error("Error sending message:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Get sender information
    const getSenderQuery = `
      SELECT user_id, first_name, last_name, username, profile_picture
      FROM users
      WHERE user_id = ?
    `;

    db.query(getSenderQuery, [senderId], (err, senders) => {
      if (err) {
        console.error("Error fetching sender info:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      const sender = senders[0] || {};

      res.json({
        success: true,
        message: {
          id: result.insertId,
          sender: "me",
          content: content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sent_at: new Date()
        }
      });
    });
  });
});

// Get all chat conversations for the current user
router.get("/conversations", verifyToken, (req, res) => {
  const userId = req.user.id;

  // Get all users the current user has exchanged messages with
  const query = `
    SELECT DISTINCT
      IF(m.sender_id = ?, m.receiver_id, m.sender_id) AS partner_id,
      u.first_name,
      u.last_name,
      u.username,
      u.profile_picture,
      (
        SELECT content
        FROM messages
        WHERE (sender_id = ? AND receiver_id = partner_id) OR (sender_id = partner_id AND receiver_id = ?)
        ORDER BY sent_at DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT sent_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = partner_id) OR (sender_id = partner_id AND receiver_id = ?)
        ORDER BY sent_at DESC
        LIMIT 1
      ) AS last_message_time
    FROM messages m
    JOIN users u ON IF(m.sender_id = ?, m.receiver_id, m.sender_id) = u.user_id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY last_message_time DESC
  `;

  db.query(query, [userId, userId, userId, userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching conversations:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const conversations = results.map(conv => ({
      partner: {
        id: conv.partner_id,
        name: `${conv.first_name} ${conv.last_name}`,
        username: conv.username,
        avatar: conv.profile_picture
      },
      lastMessage: {
        content: conv.last_message,
        timestamp: new Date(conv.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sent_at: conv.last_message_time
      }
    }));

    res.json(conversations);
  });
});

// Delete a post
router.delete("/post/:postId", verifyToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  // First check if the post belongs to the user and get image_url if exists
  const checkOwnershipQuery = "SELECT user_id, image_url FROM posts WHERE post_id = ?";

  db.query(checkOwnershipQuery, [postId], (err, results) => {
    if (err) {
      console.error("Error checking post ownership:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (results[0].user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    // Check if post has an image and delete it
    const imageUrl = results[0].image_url;
    if (imageUrl) {
      deleteImage(imageUrl);
    }

    // Delete associated comments first
    const deleteCommentsQuery = "DELETE FROM comments WHERE post_id = ?";
    db.query(deleteCommentsQuery, [postId], (err) => {
      if (err) {
        console.error("Error deleting associated comments:", err);
        // Continue with post deletion even if comment deletion fails
      }

      // Delete associated likes
      const deleteLikesQuery = "DELETE FROM likes WHERE post_id = ?";
      db.query(deleteLikesQuery, [postId], (err) => {
        if (err) {
          console.error("Error deleting associated likes:", err);
          // Continue with post deletion even if likes deletion fails
        }

        // Now delete the post
        const deletePostQuery = "DELETE FROM posts WHERE post_id = ?";
        db.query(deletePostQuery, [postId], (err, result) => {
          if (err) {
            console.error("Error deleting post:", err);
            return res.status(500).json({ error: "Internal server error" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Post not found" });
          }

          res.json({
            success: true,
            message: "Post deleted successfully"
          });
        });
      });
    });
  });
});

// Update a post
router.put("/post/:postId", verifyToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const { content } = req.body;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Post content is required" });
  }

  // First check if the post belongs to the user
  const checkOwnershipQuery = "SELECT user_id FROM posts WHERE post_id = ?";

  db.query(checkOwnershipQuery, [postId], (err, results) => {
    if (err) {
      console.error("Error checking post ownership:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (results[0].user_id !== userId) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    // If the user owns the post, update it
    const updatePostQuery = "UPDATE posts SET content = ?, updated_at = NOW() WHERE post_id = ?";

    db.query(updatePostQuery, [content, postId], (err, result) => {
      if (err) {
        console.error("Error updating post:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Get the updated post
      const getUpdatedPostQuery = `
        SELECT
          p.post_id,
          p.content,
          p.image_url,
          p.created_at,
          p.updated_at,
          p.likes_count,
          p.comments_count,
          u.user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.profile_picture
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.post_id = ?
      `;

      db.query(getUpdatedPostQuery, [postId], (err, posts) => {
        if (err) {
          console.error("Error fetching updated post:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (posts.length === 0) {
          return res.status(404).json({ error: "Post not found" });
        }

        const post = posts[0];

        res.json({
          success: true,
          message: "Post updated successfully",
          post: {
            id: post.post_id,
            content: post.content,
            image: post.image_url,
            time: formatDate(post.updated_at || post.created_at),
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            user: {
              id: post.user_id,
              name: `${post.first_name} ${post.last_name}`,
              username: post.username,
              avatar: post.profile_picture
            },
            group: {
              id: 1, // Default group
              name: "General Fitness"
            },
            edited: post.updated_at ? true : false
          }
        });
      });
    });
  });
});

// Get comments for a post
router.get("/comments/:postId", (req, res) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  const query = `
    SELECT
      c.comment_id,
      c.post_id,
      c.user_id,
      c.content,
      c.created_at,
      c.updated_at,
      c.admin_mod,
      u.first_name,
      u.last_name,
      u.username,
      u.profile_picture
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = ? AND (c.admin_mod IS NULL OR c.admin_mod = 'Approved')
    ORDER BY c.created_at ASC
  `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const comments = results.map(comment => ({
      id: comment.comment_id,
      postId: comment.post_id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      adminMod: comment.admin_mod,
      user: {
        id: comment.user_id,
        name: `${comment.first_name} ${comment.last_name}`,
        username: comment.username,
        avatar: comment.profile_picture
      },
      isEdited: comment.created_at.getTime() !== comment.updated_at.getTime()
    }));

    res.json(comments);
  });
});

// Add a comment to a post
router.post("/comments", verifyToken, (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user.id;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  // First check if the post exists
  const checkPostQuery = "SELECT post_id FROM posts WHERE post_id = ?";

  db.query(checkPostQuery, [postId], (err, results) => {
    if (err) {
      console.error("Error checking post existence:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Insert the comment
    const insertCommentQuery = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES (?, ?, ?)
    `;

    db.query(insertCommentQuery, [postId, userId, content], (err, result) => {
      if (err) {
        console.error("Error adding comment:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Update the comments count in the posts table
      const updatePostQuery = `
        UPDATE posts
        SET comments_count = IFNULL(comments_count, 0) + 1
        WHERE post_id = ?
      `;

      db.query(updatePostQuery, [postId], (err) => {
        if (err) {
          console.error("Error updating post comments count:", err);
          // Continue anyway since the comment was added successfully
        }
      });

      // Get the user information
      const getUserQuery = `
        SELECT user_id, first_name, last_name, username, profile_picture
        FROM users
        WHERE user_id = ?
      `;

      db.query(getUserQuery, [userId], (err, users) => {
        if (err) {
          console.error("Error fetching user info:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        const user = users[0] || {};
        const now = new Date();

        res.json({
          success: true,
          comment: {
            id: result.insertId,
            postId: postId,
            content: content,
            createdAt: now,
            updatedAt: now,
            user: {
              id: user.user_id,
              name: `${user.first_name} ${user.last_name}`,
              username: user.username,
              avatar: user.profile_picture
            },
            isEdited: false
          }
        });
      });
    });
  });
});

// Update a comment
router.put("/comments/:commentId", verifyToken, (req, res) => {
  const commentId = req.params.commentId;
  const { content } = req.body;
  const userId = req.user.id;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  // First check if the comment exists and belongs to the user
  const checkCommentQuery = "SELECT * FROM comments WHERE comment_id = ?";

  db.query(checkCommentQuery, [commentId], (err, results) => {
    if (err) {
      console.error("Error checking comment:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = results[0];

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    // Update the comment
    const updateCommentQuery = `
      UPDATE comments
      SET content = ?, updated_at = NOW()
      WHERE comment_id = ?
    `;

    db.query(updateCommentQuery, [content, commentId], (err, result) => {
      if (err) {
        console.error("Error updating comment:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Get the updated comment with user info
      const getUpdatedCommentQuery = `
        SELECT
          c.comment_id,
          c.post_id,
          c.user_id,
          c.content,
          c.created_at,
          c.updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.comment_id = ?
      `;

      db.query(getUpdatedCommentQuery, [commentId], (err, comments) => {
        if (err) {
          console.error("Error fetching updated comment:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (comments.length === 0) {
          return res.status(404).json({ error: "Comment not found" });
        }

        const updatedComment = comments[0];

        res.json({
          success: true,
          comment: {
            id: updatedComment.comment_id,
            postId: updatedComment.post_id,
            content: updatedComment.content,
            createdAt: updatedComment.created_at,
            updatedAt: updatedComment.updated_at,
            user: {
              id: updatedComment.user_id,
              name: `${updatedComment.first_name} ${updatedComment.last_name}`,
              username: updatedComment.username,
              avatar: updatedComment.profile_picture
            },
            isEdited: updatedComment.created_at.getTime() !== updatedComment.updated_at.getTime()
          }
        });
      });
    });
  });
});

// Delete a comment
router.delete("/comments/:commentId", verifyToken, (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  // First check if the comment exists and belongs to the user
  const checkCommentQuery = "SELECT * FROM comments WHERE comment_id = ?";

  db.query(checkCommentQuery, [commentId], (err, results) => {
    if (err) {
      console.error("Error checking comment:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = results[0];

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }


    const postId = comment.post_id;

    const deleteCommentQuery = "DELETE FROM comments WHERE comment_id = ?";

    db.query(deleteCommentQuery, [commentId], (err, result) => {
      if (err) {
        console.error("Error deleting comment:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Update the comments count
      const updatePostQuery = `
        UPDATE posts
        SET comments_count = GREATEST(IFNULL(comments_count, 0) - 1, 0)
        WHERE post_id = ?
      `;

      db.query(updatePostQuery, [postId], (err) => {
        if (err) {
          console.error("Error updating post comments count:", err);
        }
      });

      res.json({
        success: true,
        message: "Comment deleted successfully"
      });
    });
  });
});

// Create a new group
router.post("/createGroup", verifyToken, (req, res) => {
  const { name, description, location, imageUrl } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  // Process image if provided
  let imagePath = null;
  if (imageUrl) {
    try {
      // Save image to the system and get the path
      imagePath = saveBase64Image(imageUrl);
      if (!imagePath) {
        console.warn("Failed to process image, continuing without image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }

  // Insert the new group into the database
  const insertGroupQuery = `
    INSERT INTO fitness_groups (name, description, location, image_url, creator_user_id, created_at, updated_at, admin_mod)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 'Pending')
  `;

  db.query(insertGroupQuery, [name, description, location, imagePath, userId], (err, result) => {
    if (err) {
      console.error("Error creating group:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const groupId = result.insertId;

    // Add the creator as a member of the group with Admin role
    const addMemberQuery = `
      INSERT INTO group_members (group_id, user_id, role, join_date, status)
      VALUES (?, ?, 'Admin', NOW(), 'Approved')
    `;

    db.query(addMemberQuery, [groupId, userId], (err) => {
      if (err) {
        console.error("Error adding creator as member:", err);
        // Continue anyway since the group was created successfully
      }

      // Get the created group details
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
          1 AS members
        FROM fitness_groups g
        WHERE g.group_id = ?
      `;

      db.query(getGroupQuery, [groupId], (err, groups) => {
        if (err) {
          console.error("Error fetching created group:", err);
          return res.status(201).json({
            success: true,
            message: "Group created successfully",
            groupId: groupId
          });
        }

        if (groups.length === 0) {
          return res.status(201).json({
            success: true,
            message: "Group created successfully",
            groupId: groupId
          });
        }

        res.status(201).json({
          success: true,
          message: "Group created successfully",
          group: groups[0]
        });
      });
    });
  });
});

module.exports = router;