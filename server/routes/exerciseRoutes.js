const express = require("express");
const db = require("../db.js");

const router = express.Router();

// Fetch all exercises with their category information
router.get("/fetch_exercises", (_, res) => {
  console.log("Fetching all exercises");
  const query = `
    SELECT e.*, ec.name as category_name, ec.description as category_description
    FROM exercises e
    JOIN exercise_categories ec ON e.category_id = ec.category_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching exercises:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log(`Returning ${results.length} exercises`);
    console.log(results);
    res.json(results);
  });
});

// Fetch all exercise categories
router.get("/fetch_exercise_categories", (_, res) => {
  console.log("Fetching exercise categories");
  db.query("SELECT * FROM exercise_categories", (err, results) => {
    if (err) {
      console.log("Error fetching exercise categories:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log(`Returning ${results.length} exercise categories`);
    console.log(results);
    res.json(results);
  });
});

// Fetch exercises by category ID
router.get("/fetch_exercises_by_category/:categoryId", (req, res) => {
  const categoryId = req.params.categoryId;
  console.log(`Fetching exercises for category ID: ${categoryId}`);

  const query = `
    SELECT e.*, ec.name as category_name, ec.description as category_description
    FROM exercises e
    JOIN exercise_categories ec ON e.category_id = ec.category_id
    WHERE e.category_id = ?
  `;

  db.query(query, [categoryId], (err, results) => {
    if (err) {
      console.log(`Error fetching exercises for category ${categoryId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log(`Returning ${results.length} exercises for category ${categoryId}`);
    res.json(results);
  });
});

// Fetch a specific exercise by ID
router.get("/fetch_exercise/:exerciseId", (req, res) => {
  const exerciseId = req.params.exerciseId;
  console.log(`Fetching exercise with ID: ${exerciseId}`);

  const query = `
    SELECT e.*, ec.name as category_name, ec.description as category_description
    FROM exercises e
    JOIN exercise_categories ec ON e.category_id = ec.category_id
    WHERE e.exercise_id = ?
  `;

  db.query(query, [exerciseId], (err, results) => {
    if (err) {
      console.log(`Error fetching exercise ${exerciseId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      console.log(`Exercise with ID ${exerciseId} not found`);
      return res.status(404).json({ error: "Exercise not found" });
    }

    console.log(`Returning exercise with ID ${exerciseId}`);
    res.json(results[0]);
  });
});

module.exports = router;
