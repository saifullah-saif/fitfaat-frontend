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

// Get all content (posts and comments) with proper status
router.get("/allContent", verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT
      p.post_id AS id,
      'post' AS type,
      p.content AS title,
      p.content AS content,
      u.user_id AS author_id,
      CONCAT(u.first_name, ' ', u.last_name) AS author_name,
      u.profile_picture AS author_avatar,
      g.name AS group_name,
      p.created_at AS created_at,
      p.updated_at AS updated_at,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS likes,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) AS comments,
      CASE
        WHEN p.admin_mod IS NULL THEN 'approved'
        ELSE p.admin_mod
      END AS status
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    JOIN fitness_groups g ON p.group_id = g.group_id
    UNION
    SELECT
      c.comment_id AS id,
      'comment' AS type,
      NULL AS title,
      c.content AS content,
      u.user_id AS author_id,
      CONCAT(u.first_name, ' ', u.last_name) AS author_name,
      u.profile_picture AS author_avatar,
      (SELECT g.name FROM fitness_groups g
       JOIN posts p ON g.group_id = p.group_id
       WHERE p.post_id = c.post_id LIMIT 1) AS group_name,
      c.created_at AS created_at,
      c.updated_at AS updated_at,
      0 AS likes,
      0 AS comments,
      CASE
        WHEN c.admin_mod IS NULL THEN 'approved'
        ELSE c.admin_mod
      END AS status
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all content:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Format the results to match the expected structure in the frontend
    const formattedResults = results.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      author: {
        id: item.author_id,
        name: item.author_name,
        avatar: item.author_avatar || "/placeholder.svg"
      },
      group: item.group_name,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      likes: item.likes,
      comments: item.comments,
      status: typeof item.status === 'string' ? item.status.toLowerCase() : item.status
    }));

    res.json(formattedResults);
  });
});

// Update content status (approve/reject)
router.put("/content/:contentType/:contentId/status", verifyToken, verifyAdmin, (req, res) => {
  const { contentType, contentId } = req.params;
  const { status } = req.body;

  if (!contentId || !contentType || !status) {
    return res.status(400).json({ error: "Content ID, type, and status are required" });
  }

  if (!['approved', 'rejected'].includes(status.toLowerCase())) {
    return res.status(400).json({ error: "Status must be either 'approved' or 'rejected'" });
  }

  let table, idField;
  if (contentType.toLowerCase() === 'post') {
    table = 'posts';
    idField = 'post_id';
  } else if (contentType.toLowerCase() === 'comment') {
    table = 'comments';
    idField = 'comment_id';
  } else {
    return res.status(400).json({ error: "Content type must be either 'post' or 'comment'" });
  }

  const query = `
    UPDATE ${table}
    SET admin_mod = ?
    WHERE ${idField} = ?
  `;

  db.query(query, [status.charAt(0).toUpperCase() + status.slice(1), contentId], (err, result) => {
    if (err) {
      console.error(`Error updating ${contentType} status:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} not found` });
    }

    res.json({
      success: true,
      message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} status updated to ${status}`,
      contentId,
      contentType,
      status
    });
  });
});

// Edit content
router.put("/content/:contentType/:contentId", verifyToken, verifyAdmin, (req, res) => {
  const { contentType, contentId } = req.params;
  const { content, title } = req.body;

  if (!contentId || !contentType) {
    return res.status(400).json({ error: "Content ID and type are required" });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Content is required" });
  }

  let table, idField, updateFields, updateValues;
  if (contentType.toLowerCase() === 'post') {
    table = 'posts';
    idField = 'post_id';
    // Use title if provided for posts
    if (title && title.trim() !== "") {
      updateFields = 'content = ?, title = ?, updated_at = NOW()';
      updateValues = [content, title];
    } else {
      updateFields = 'content = ?, updated_at = NOW()';
      updateValues = [content];
    }
  } else if (contentType.toLowerCase() === 'comment') {
    table = 'comments';
    idField = 'comment_id';
    updateFields = 'content = ?, updated_at = NOW()';
    updateValues = [content];
  } else {
    return res.status(400).json({ error: "Content type must be either 'post' or 'comment'" });
  }

  const query = `
    UPDATE ${table}
    SET ${updateFields}
    WHERE ${idField} = ?
  `;

  db.query(query, [...updateValues, contentId], (err, result) => {
    if (err) {
      console.error(`Error updating ${contentType}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} not found` });
    }

    // Get the updated content
    const getUpdatedContentQuery = `
      SELECT
        ${idField} AS id,
        content,
        created_at,
        updated_at
      FROM ${table}
      WHERE ${idField} = ?
    `;

    db.query(getUpdatedContentQuery, [contentId], (err, results) => {
      if (err) {
        console.error(`Error fetching updated ${contentType}:`, err);
        return res.status(500).json({
          success: true,
          message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} updated successfully`,
          contentId,
          contentType
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} not found` });
      }

      const updatedContent = results[0];

      res.json({
        success: true,
        message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} updated successfully`,
        content: {
          id: updatedContent.id,
          content: updatedContent.content,
          createdAt: updatedContent.created_at,
          updatedAt: updatedContent.updated_at,
          isEdited: true
        }
      });
    });
  });
});

// Delete content
router.delete("/content/:contentType/:contentId", verifyToken, verifyAdmin, (req, res) => {
  const { contentType, contentId } = req.params;

  if (!contentId || !contentType) {
    return res.status(400).json({ error: "Content ID and type are required" });
  }

  let table, idField;
  if (contentType.toLowerCase() === 'post') {
    table = 'posts';
    idField = 'post_id';
  } else if (contentType.toLowerCase() === 'comment') {
    table = 'comments';
    idField = 'comment_id';
  } else {
    return res.status(400).json({ error: "Content type must be either 'post' or 'comment'" });
  }

  // If deleting a post, we need to delete all associated comments and likes first
  if (contentType.toLowerCase() === 'post') {
    // First check if the post has an image that needs to be deleted
    const getPostImageQuery = `SELECT image_url FROM posts WHERE post_id = ?`;
    db.query(getPostImageQuery, [contentId], (err, results) => {
      if (err) {
        console.error("Error fetching post image:", err);
        // Continue with post deletion even if image fetch fails
      } else if (results.length > 0 && results[0].image_url) {
        // Delete the image from the filesystem
        deleteImage(results[0].image_url);
      }

      // Delete associated comments
      const deleteCommentsQuery = `DELETE FROM comments WHERE post_id = ?`;
      db.query(deleteCommentsQuery, [contentId], (err) => {
        if (err) {
          console.error("Error deleting associated comments:", err);
          // Continue with post deletion even if comment deletion fails
        }

        // Delete associated likes
        const deleteLikesQuery = `DELETE FROM likes WHERE post_id = ?`;
        db.query(deleteLikesQuery, [contentId], (err) => {
          if (err) {
            console.error("Error deleting associated likes:", err);
            // Continue with post deletion even if likes deletion fails
          }

          // Now delete the post
          deleteContent();
        });
      });
    });
  } else {
    // For comments, just delete the comment directly
    deleteContent();
  }

  function deleteContent() {
    const query = `DELETE FROM ${table} WHERE ${idField} = ?`;

    db.query(query, [contentId], (err, result) => {
      if (err) {
        console.error(`Error deleting ${contentType}:`, err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} not found` });
      }

      // If deleting a comment, update the post's comment count
      if (contentType.toLowerCase() === 'comment') {
        const getPostIdQuery = `SELECT post_id FROM comments WHERE comment_id = ?`;
        db.query(getPostIdQuery, [contentId], (err, results) => {
          if (!err && results.length > 0) {
            const postId = results[0].post_id;
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
          }
        });
      }

      res.json({
        success: true,
        message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} deleted successfully`,
        contentId,
        contentType
      });
    });
  }
});

module.exports = router;