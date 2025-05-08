


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

      // Generate JWT token
      const token = generateToken(user);

      // Remove password from user object before sending response
      const { password: _, ...userWithoutPassword } = user;

      // Set token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict"
      });

      res.json({ user: userWithoutPassword });
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

            const user = { id: results.insertId, email, username };

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
  // req.user is set by the verifyToken middleware
  res.json({ user: req.user });
});

module.exports = router;
