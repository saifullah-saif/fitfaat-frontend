const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// POST: Submit feedback
router.post("/", verifyToken, (req, res) => {
  const { message } = req.body;

  // Extract user_id from token, ensuring compatibility with different token formats
  const userId = req.user.id || req.user.user_id;

  if (!userId) {
    return res.status(400).json({ error: "User ID not found in token" });
  }

  if (!message) {
    return res.status(400).json({ error: "Feedback message is required." });
  }

  try {
    db.query(
      "INSERT INTO feedback (user_id, message) VALUES (?, ?)",
      [userId, message],
      (err, result) => {
        if (err) {
          console.error("Insert error:", err);
          return res.status(500).json({ error: "Database error." });
        }

        res.status(201).json({
          message: "Feedback submitted successfully.",
          feedback_id: result.insertId
        });
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// GET: Get all feedback
router.get("/", (req, res) => {
  try {
    db.query(
      `SELECT f.message, f.time_stamp, u.username, u.first_name, u.last_name
       FROM feedback f
       JOIN users u ON f.user_id = u.user_id
       ORDER BY f.time_stamp DESC`,
      (err, results) => {
        if (err) {
          console.error("Fetch error:", err);
          return res.status(500).json({ error: "Database fetch error." });
        }

        // Format the results to include a display name
        const formattedResults = results.map(row => ({
          ...row,
          display_name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : row.username
        }));

        res.json(formattedResults);
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
