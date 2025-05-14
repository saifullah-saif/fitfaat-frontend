"use client";
import { useState } from "react";

export default function CalorieCalculator() {
  const [calorieResult, setCalorieResult] = useState(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);

  // Convert height from format like 5'6" to cm
  const convertHeightToCm = (heightStr) => {
    // Check if height is already in cm format
    if (!isNaN(heightStr) && heightStr.trim() !== "") {
      return parseFloat(heightStr);
    }

    // Parse feet and inches format (e.g., 5'6)
    const regex = /(\d+)'(\d+)/;
    const match = heightStr.match(regex);

    if (match) {
      const feet = parseInt(match[1]);
      const inches = parseInt(match[2]);
      // Convert to cm (1 foot = 30.48 cm, 1 inch = 2.54 cm)
      return Math.round((feet * 30.48) + (inches * 2.54));
    }

    return null;
  };

  const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return null;
    // BMI formula: weight (kg) / (height (m))^2
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const calculateCalories = () => {
    if (!age || !gender || !activity || !height || !weight) {
      setCalorieResult("⚠️ Please fill in all fields correctly.");
      return;
    }

    const ageValue = parseInt(age);
    const weightKg = parseFloat(weight);
    const heightCm = convertHeightToCm(height);

    if (!heightCm) {
      setCalorieResult("⚠️ Please enter a valid height (e.g., 5'6 or 168).");
      return;
    }

    // Calculate BMI
    const bmiValue = calculateBMI(weightKg, heightCm);
    setBmi(bmiValue);
    const bmiCategory = getBmiCategory(bmiValue);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === "Male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageValue + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageValue - 161;
    }

    // Apply activity multiplier
    let tdee; // Total Daily Energy Expenditure
    switch (activity) {
      case "Sedentary":
        tdee = bmr * 1.2;
        break;
      case "Moderately Active":
        tdee = bmr * 1.55;
        break;
      case "Active":
        tdee = bmr * 1.725;
        break;
      default:
        tdee = bmr * 1.2;
    }

    // Round to nearest 50 calories
    tdee = Math.round(tdee / 50) * 50;

    // Calculate different calorie targets
    const mildLoss = Math.round(tdee - 250);
    const regularLoss = Math.round(tdee - 500);
    const extremeLoss = Math.round(tdee - 1000);

    // Calculate weight gain targets
    const mildGain = Math.round(tdee + 250);
    const regularGain = Math.round(tdee + 500);

    setCalorieResult(
      `📊 BMI: ${bmiValue} (${bmiCategory})\n\n` +
      `🟢 Maintenance: ${tdee} Calories/day\n\n` +
      `Weight Loss Goals:\n` +
      `🟡 Mild Loss (~0.25kg/week): ${mildLoss} Calories/day\n` +
      `🟠 Regular Loss (~0.5kg/week): ${regularLoss} Calories/day\n` +
      `🔴 Extreme Loss (~1kg/week): ${extremeLoss} Calories/day\n\n` +
      `Weight Gain Goals:\n` +
      `🟣 Mild Gain (~0.25kg/week): ${mildGain} Calories/day\n` +
      `🔵 Regular Gain (~0.5kg/week): ${regularGain} Calories/day`
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 bg-white dark:bg-gray-900 shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">🧮 Calorie Calculator</h1>

      <div className="flex flex-col gap-4">
        <input
          type="number"
          placeholder="Enter Age (years)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          type="text"
          placeholder="Enter Height (e.g., 5'6 or cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <input
          type="number"
          placeholder="Enter Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select Activity Level</option>
          <option>Sedentary</option>
          <option>Moderately Active</option>
          <option>Active</option>
        </select>

        <button
          onClick={calculateCalories}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Calculate Calories
        </button>
      </div>

      {calorieResult && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-pre-wrap text-sm dark:text-gray-200">
          <h3 className="font-semibold mb-2">Calorie Recommendations:</h3>
          {calorieResult}
        </div>
      )}
    </div>
  );
}
