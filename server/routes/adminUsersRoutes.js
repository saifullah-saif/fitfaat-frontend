const express = require('express');
const cors = require('cors');
const db = require('../db'); // Adjust path to your database connection file
const router = express.Router(); // Create a router instance

// Middleware
router.use(cors()); // Allow requests from frontend
router.use(express.json()); // Parse JSON bodies

// GET all users (with necessary fields)
router.get('/', (req, res) => {
  db.query('SELECT user_id, username, email, gender, quiz_status, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// UPDATE user role by user_id
router.put('/:id', (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: 'Role is required' });

  db.query(
    'UPDATE users SET role = ? WHERE user_id = ?',
    [role, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User role updated successfully' });
    }
  );
});


// DELETE user by user_id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE user_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Export the router to be used in other parts of the app
module.exports = router;
