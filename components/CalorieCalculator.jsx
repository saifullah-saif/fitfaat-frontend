"use client";
import { useState } from "react";
//import CalorieCalculator.css
//import CalorieCalculator from "@/components/CalorieCalculator";

export default function CalorieCalculator() {
  const [calorieResult, setCalorieResult] = useState(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [height, setHeight] = useState("");

  const parseRange = (range) => {
    const parts = range.replace(/,/g, "").split("–");
    if (parts.length === 1) return parseInt(parts[0]);
    return Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2);
  };

  const calculateCalories = () => {
    if (!age || !gender || !activity || !height) {
      setCalorieResult("⚠️ Please fill in all fields correctly.");
      return;
    }

    let result = "";

    const a = parseInt(age);
    const g = gender;
    const act = activity;

    if (a >= 2 && a <= 3) result = act === "Sedentary" ? "1000" : act === "Moderately Active" ? "1100–1300" : "1200–1400";
    else if (a >= 4 && a <= 8) result = act === "Sedentary" ? "1200–1400" : act === "Moderately Active" ? "1400–1600" : "1600–2000";
    else if (a >= 9 && a <= 13)
      result = g === "Male"
        ? act === "Sedentary" ? "1600–1800" : act === "Moderately Active" ? "1800–2200" : "2000–2600"
        : act === "Sedentary" ? "1400–1600" : act === "Moderately Active" ? "1600–2000" : "1800–2200";
    else if (a >= 14 && a <= 16)
      result = g === "Male"
        ? act === "Sedentary" ? "2000–2200" : act === "Moderately Active" ? "2400–2600" : "2600–2800"
        : act === "Sedentary" ? "1800–2000" : act === "Moderately Active" ? "2000–2200" : "2200–2400";
    else if (a >= 17 && a <= 19)
      result = g === "Male"
        ? act === "Sedentary" ? "2200–2400" : act === "Moderately Active" ? "2600–2800" : "2800–3000"
        : act === "Sedentary" ? "1800–2000" : act === "Moderately Active" ? "2200–2400" : "2400–2600";
    else if (a >= 20 && a <= 30)
      result = g === "Male"
        ? act === "Sedentary" ? "2200–2400" : act === "Moderately Active" ? "2400–2600" : "2600–2800"
        : act === "Sedentary" ? "1800–2000" : act === "Moderately Active" ? "2000–2200" : "2200–2400";
    else if (a >= 31 && a <= 50)
      result = g === "Male"
        ? act === "Sedentary" ? "2000–2200" : act === "Moderately Active" ? "2200–2400" : "2400–2600"
        : act === "Sedentary" ? "1600–1800" : act === "Moderately Active" ? "1800–2000" : "2000–2200";
    else if (a >= 51)
      result = g === "Male"
        ? act === "Sedentary" ? "1800–2000" : act === "Moderately Active" ? "2000–2200" : "2200–2400"
        : act === "Sedentary" ? "1600" : act === "Moderately Active" ? "1800" : "2000";
    else result = "Please enter a valid age.";

    if (result.includes("–")) {
      const avg = parseRange(result);
      const mildLoss = Math.round(avg * 0.89);
      const regularLoss = Math.round(avg * 0.78);
      const extremeLoss = Math.round(avg * 0.57);

      setCalorieResult(
        `🟢 Maintenance: ${result} Calories/day\n` +
        `🟡 Mild Loss (~0.25kg/week): ${mildLoss} Calories/day\n` +
        `🟠 Regular Loss (~0.5kg/week): ${regularLoss} Calories/day\n` +
        `🔴 Extreme Loss (~1kg/week): ${extremeLoss} Calories/day`
      );
    } else if (!isNaN(parseInt(result))) {
      const base = parseInt(result);
      const mildLoss = Math.round(base * 0.89);
      const regularLoss = Math.round(base * 0.78);
      const extremeLoss = Math.round(base * 0.57);

      setCalorieResult(
        `🟢 Maintenance: ${result} Calories/day\n` +
        `🟡 Mild Loss (~0.25kg/week): ${mildLoss} Calories/day\n` +
        `🟠 Regular Loss (~0.5kg/week): ${regularLoss} Calories/day\n` +
        `🔴 Extreme Loss (~1kg/week): ${extremeLoss} Calories/day`
      );
    } else {
      setCalorieResult(result);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 bg-white shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">🧮 Calorie Calculator</h1>

      <div className="flex flex-col gap-4">
        <input
          type="number"
          placeholder="Enter Age (years)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          type="text"
          placeholder="Enter Height (e.g., 5'6\)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Activity Level</option>
          <option>Sedentary</option>
          <option>Moderately Active</option>
          <option>Active</option>
        </select>

        <button
          onClick={calculateCalories}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Calculate Calories
        </button>
      </div>

      {calorieResult && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg whitespace-pre-wrap text-sm">
          <h3 className="font-semibold mb-2">Calorie Recommendations:</h3>
          {calorieResult}
        </div>
      )}
    </div>
  );
}
