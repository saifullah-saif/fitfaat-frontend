// routes/onboardingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure to require your db connection here
const { verifyToken } = require('../middleware/authMiddleware'); // Import the auth middleware

// Define the /api/onboarding POST route with authentication middleware
router.post('/', verifyToken, (req, res) => {
  try {
    console.log("Received onboarding data:", req.body);
    console.log("Token user:", req.user);

    // Extract user_id from token, ensuring compatibility with different token formats
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
      console.error("User ID not found in token:", req.user);
      return res.status(400).json({ error: "User ID not found in token" });
    }

    const {
      height,
      weight,
      target_weight,
      activity_level,
      goal_type,
      daily_calorie_target,
      dietary_preferences,
      allergies,
      medical_conditions
    } = req.body;

    console.log("Processing health profile for user:", userId);

    // First check if user already has a health profile
    db.query(
      "SELECT * FROM health_profiles WHERE user_id = ?",
      [userId],
      (err, results) => {
        if (err) {
          console.error("Error checking existing profile:", err);
          return res.status(500).json({ error: "Database query failed" });
        }

        // If user already has a profile, update it
        if (results && results.length > 0) {
          console.log("Updating existing health profile for user:", userId);

          db.query(
            `UPDATE health_profiles SET
             height = ?,
             weight = ?,
             target_weight = ?,
             activity_level = ?,
             goal_type = ?,
             daily_calorie_target = ?,
             dietary_preferences = ?,
             allergies = ?,
             medical_conditions = ?
             WHERE user_id = ?`,
            [
              height,
              weight,
              target_weight,
              activity_level,
              goal_type,
              daily_calorie_target,
              dietary_preferences || "",
              allergies || "",
              medical_conditions || "",
              userId
            ],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error updating health profile:", updateErr);
                return res.status(500).json({ error: "Database update failed" });
              }

              console.log("Health profile updated successfully for user:", userId);
              res.status(200).json({
                message: "Health profile updated successfully",
                user_id: userId
              });
            }
          );
        } else {
          // If user doesn't have a profile, create a new one
          console.log("Creating new health profile for user:", userId);

          db.query(
            `INSERT INTO health_profiles
             (user_id, height, weight, target_weight, activity_level, goal_type, daily_calorie_target, dietary_preferences, allergies, medical_conditions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              height,
              weight,
              target_weight,
              activity_level,
              goal_type,
              daily_calorie_target,
              dietary_preferences || "",
              allergies || "",
              medical_conditions || ""
            ],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Error inserting health profile:", insertErr);
                return res.status(500).json({ error: "Database insertion failed" });
              }

              console.log("Health profile created successfully for user:", userId);
              res.status(201).json({
                message: "Health profile created successfully",
                user_id: userId
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Unexpected error in onboarding route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
