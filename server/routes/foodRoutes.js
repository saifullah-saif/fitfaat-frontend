const express = require("express");
const db = require("../db.js");
const router = express.Router();

// Define the GET route to fetch foods
router.get('/', (req, res) => {
  // Query the foods table
  db.query('SELECT * FROM foods', (err, results) => {
    if (err) {
      console.error('Error fetching foods:', err);
      return res.status(500).json({ message: 'Error fetching foods', error: err });
    }

    // Send the food items as a JSON response
    res.json(results);
  });
});

// Export the router
module.exports = router;
