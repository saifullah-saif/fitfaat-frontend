const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// Fetch logged-in user's full profile including the 'bio' field
router.get("/", verifyToken, (req, res) => {
  console.log("Decoded user from token:", req.user);
  const userId = req.user.id || req.user.user_id;


  db.query(
    "SELECT first_name, email, phone_number, location, date_of_birth, gender, bio FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];

      res.json({
        first_name: user.first_name,
        email: user.email,
        phone_number: user.phone_number,
        location: user.location,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        bio: user.bio,  // Returning the bio field
      });
    }
  );
});

// Update logged-in user's profile
router.put("/", verifyToken, (req, res) => {
  // Extract user_id from token, ensuring compatibility with different token formats
  const userId = req.user.id || req.user.user_id;

  if (!userId) {
    return res.status(400).json({ error: "User ID not found in token" });
  }

  const { first_name, email, phone_number, location, date_of_birth, gender, bio } = req.body;

  // Validate required fields
  if (!first_name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  // First get the current user data to merge with updates
  db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentUser = results[0];

      // Merge current data with updates, using current values as defaults
      const updatedData = {
        first_name: first_name || currentUser.first_name,
        email: email || currentUser.email,
        phone_number: phone_number || currentUser.phone_number || "",
        location: location || currentUser.location || "",
        date_of_birth: date_of_birth || currentUser.date_of_birth || null,
        gender: gender || currentUser.gender || "",
        bio: bio || currentUser.bio || ""
      };

      // Update the user profile
      db.query(
        "UPDATE users SET first_name = ?, email = ?, phone_number = ?, location = ?, date_of_birth = ?, gender = ?, bio = ? WHERE user_id = ?",
        [
          updatedData.first_name,
          updatedData.email,
          updatedData.phone_number,
          updatedData.location,
          updatedData.date_of_birth,
          updatedData.gender,
          updatedData.bio,
          userId
        ],
        (updateErr, updateResults) => {
          if (updateErr) {
            console.error("DB update error:", updateErr);
            return res.status(500).json({ error: "Failed to update profile" });
          }

          if (updateResults.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
          }

          res.json({
            message: "Profile updated successfully",
            user: {
              first_name: updatedData.first_name,
              email: updatedData.email,
              phone_number: updatedData.phone_number,
              location: updatedData.location,
              date_of_birth: updatedData.date_of_birth,
              gender: updatedData.gender,
              bio: updatedData.bio
            }
          });
        }
      );
    }
  );
});

module.exports = router;
