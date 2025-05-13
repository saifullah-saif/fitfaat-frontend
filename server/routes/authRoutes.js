const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db.js");
const { verifyToken, generateToken } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = results[0];

      // Check password match
      let passwordMatch = false;

      // Check if password_hash exists
      if (user.password_hash) {
        // Try to match with bcrypt
        passwordMatch = await bcrypt.compare(password, user.password_hash).catch(() => false);
      }
      // Fallback for legacy plain text passwords
      else if (user.password === password) {
        passwordMatch = true;

        // Optionally update to hashed password for security
        // const hashedPassword = await bcrypt.hash(password, 10);
        // db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, user.id]);
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Ensure user object has consistent field names
      user.id = user.user_id; // Add id field for compatibility

      // Generate JWT token with role included
      const token = generateToken(user);

      // Remove password and password_hash from user object before sending response
      const { password: _, password_hash: __, ...userWithoutPassword } = user;

      console.log("User data for token:", {
        user_id: user.user_id,
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      // Set token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict"
      });

      // Determine redirect URL based on user role
      const redirectUrl = user.role === 'Admin' ? '/admin' : '/dashboard';

      res.json({
        user: userWithoutPassword,
        redirectUrl: redirectUrl
      });
    }
  );
});


router.post("/signup", async (req, res) => {
  const { username, email, password, first_name, last_name, date_of_birth, gender, location} = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: "Email already exists" });
        }

        db.query(
          "INSERT INTO users (username, email, password_hash, first_name, last_name, date_of_birth, gender, location, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [username, email, hashedPassword, first_name, last_name, date_of_birth, gender, location, "User"],
          (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Internal server error" });
            }

            const user = {
              user_id: results.insertId,
              id: results.insertId, // Include both for compatibility
              email,
              username,
              first_name,
              last_name
            };

            // Generate JWT token
            const token = generateToken(user);

            // Set token in HTTP-only cookie
            res.cookie("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production", // Use secure in production
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              sameSite: "strict"
            });

            res.json({ user });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error hashing password" });
  }
});

// Logout route
router.post("/logout", (_, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Get current user route (verify token)
router.get("/me", verifyToken, (req, res) => {
  // req.user is already set by the verifyToken middleware
  // We can optionally fetch additional user data from the database

  const query = `SELECT user_id, username, email, first_name, last_name, profile_picture, role FROM users WHERE user_id = ?`;
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error("Database error in /me route:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      // User not found in database but token is valid
      // This is unusual but can happen if user was deleted from DB but token is still valid
      console.warn(`User with ID ${req.user.id} has valid token but not found in database`);
      return res.json({ user: req.user }); // Return the basic user info from token
    }

    // Merge the database user data with token data
    const userData = results[0];
    userData.id = userData.user_id; // Ensure id field exists for compatibility

    // Return the enhanced user data
    return res.json({ user: userData });
  });
});

module.exports = router;
