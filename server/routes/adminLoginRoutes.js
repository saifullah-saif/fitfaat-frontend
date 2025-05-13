const express = require("express");
const db = require("../db.js");
const router = express.Router();
///const { verifyToken, generateToken } = require("../middleware/authMiddleware.js");

// Admin login route
router.post('/', (req, res) => {
  const { admin_id, password } = req.body;

  const query = 'SELECT * FROM admin WHERE admin_id = ? AND password = ?';
  db.query(query, [admin_id, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', admin_id });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Export the router
module.exports = router;
