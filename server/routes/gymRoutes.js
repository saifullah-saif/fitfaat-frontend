const express = require("express");
const db = require("../db.js");

const router = express.Router();

// Fetch all gyms
router.get("/fetch_gyms", (_, res) => {
  console.log("Fetching all gyms");
  const query = `
    SELECT * FROM gyms
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching gyms:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log(`Returning ${results.length} gyms`);
    res.json(results);
  });
});

// Fetch a specific gym by ID
router.get("/fetch_gym/:gymId", (req, res) => {
  const gymId = req.params.gymId;
  console.log(`Fetching gym with ID: ${gymId}`);

  const query = `
    SELECT * FROM gyms
    WHERE gym_id = ?
  `;

  db.query(query, [gymId], (err, results) => {
    if (err) {
      console.log(`Error fetching gym ${gymId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      console.log(`Gym with ID ${gymId} not found`);
      return res.status(404).json({ error: "Gym not found" });
    }

    console.log(`Returning gym with ID ${gymId}`);
    res.json(results[0]);
  });
});

module.exports = router;
