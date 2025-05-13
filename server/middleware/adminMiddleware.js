// Middleware to verify admin access
const db = require("../db");

// Middleware to check if the user is an admin
const verifyAdmin = (req, res, next) => {
  // Get user ID from the token verification middleware
  const userId = req.user?.id || req.user?.user_id;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: User ID not found" });
  }
  
  // Query the database to check if the user is an admin
  db.query(
    "SELECT is_admin FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Database error in admin verification:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const user = results[0];
      
      // Check if the user is an admin
      if (!user.is_admin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      
      // User is an admin, proceed to the next middleware or route handler
      next();
    }
  );
};

module.exports = { verifyAdmin };
