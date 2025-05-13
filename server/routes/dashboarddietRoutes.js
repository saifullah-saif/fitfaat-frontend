// routes/dashboarddietRoutes.js
const express = require("express");
const router = express.Router();

// Mock database function (replace this with your actual database fetch/save logic)
const savedFoods = [];

// Function to save selected foods to the mock database
async function saveSelectedFoodsToDB(selectedFoods) {
  savedFoods.length = 0; // Clear existing saved foods
  savedFoods.push(...selectedFoods); // Save the new foods
  console.log("Saved foods:", savedFoods);
  return Promise.resolve();
}

// ✅ Route to save selected foods
router.post("/", async (req, res) => {
  const { selectedFoods } = req.body;

  if (!Array.isArray(selectedFoods)) {
    return res.status(400).json({ message: "Selected foods must be an array." });
  }

  try {
    await saveSelectedFoodsToDB(selectedFoods);
    res.status(200).json({ message: "Selected foods saved successfully" });
  } catch (error) {
    console.error("Failed to save selected foods:", error);
    res.status(500).json({ message: "Failed to save selected foods", error: error.message });
  }
});

// ✅ Route to get saved foods (for dashboard)
router.get("/", async (req, res) => {
  res.status(200).json({ selectedFoods: savedFoods });
});

module.exports = router;
