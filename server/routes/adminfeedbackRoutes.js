const express = require('express');
const cors = require('cors');
const db = require('../db'); // Adjust path to your DB connection
const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json());

// GET all feedbacks (admin view)
router.get('/', (req, res) => {
  console.log("Admin feedback GET request received");

  const query = `
    SELECT f.feedback_id, f.user_id, f.message as feedback_message,
    f.time_stamp, u.username
    FROM feedback f
    JOIN users u ON f.user_id = u.user_id
    ORDER BY f.time_stamp DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Admin feedback fetch error:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`Found ${results.length} feedback entries`);
    res.json(results);
  });
});

// DELETE feedback by feedback_id
router.delete('/:id', (req, res) => {
  const feedbackId = req.params.id;
  console.log("Admin feedback DELETE request received for ID:", feedbackId);

  if (!feedbackId) {
    return res.status(400).json({ error: "Feedback ID is required" });
  }

  db.query(
    "DELETE FROM feedback WHERE feedback_id = ?",
    [feedbackId],
    (err, result) => {
      if (err) {
        console.error("Admin feedback delete error:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("Delete result:", result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Feedback not found" });
      }

      res.json({ message: "Feedback deleted successfully" });
    }
  );
});

// Export router
module.exports = router;
