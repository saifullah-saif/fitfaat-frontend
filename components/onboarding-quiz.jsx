"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export function OnboardingQuiz() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    target_weight: "",
    activity_level: "",
    goal_type: "",
    daily_calorie_target: "",
    dietary_preferences: "",
    allergies: "",
    medical_conditions: "",
  });

  const [step, setStep] = useState(0); // To track the current question step

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("fitfaat_user");
    if (!userData) {
      // Redirect to login if no user data found
      router.push("/login");
    }
  }, [router]);
  const questions = [
    { name: "height", label: "What is your height (cm)?" },
    { name: "weight", label: "What is your weight (kg)?" },
    { name: "target_weight", label: "What is your target weight (kg)?" },
    { name: "activity_level", label: "How would you describe your activity level?" },
    { name: "goal_type", label: "What is your fitness goal?" },
    { name: "daily_calorie_target", label: "What is your daily calorie target?" },
    { name: "dietary_preferences", label: "What is your dietary preference?" },
    { name: "allergies", label: "Do you have any allergies?" },
    { name: "medical_conditions", label: "Do you have any medical conditions?" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < questions.length - 1) {
      setStep(step + 1); // Move to the next question
    } else {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        // Get user data from localStorage
        const userData = localStorage.getItem("fitfaat_user");
        if (!userData) {
          setError("User not logged in. Please log in first.");
          setLoading(false);
          return;
        }

        // Send the form data to the server
        const response = await axios.post(
          "http://localhost:5000/api/onboarding/",
          formData,
          {
            withCredentials: true, // sends JWT cookie
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        console.log("Onboarding data submitted successfully:", response.data);
        setSuccess("Profile saved successfully!");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Error submitting onboarding data:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to save profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderInputField = (question) => {
    switch (question.name) {
      case "activity_level":
      case "goal_type":
      case "dietary_preferences":
        return (
          <select
            name={question.name}
            value={formData[question.name]}
            onChange={handleChange}
            required
            className="mt-2 block w-full px-3 py-2 text-base text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:focus:ring-blue-300"
          >
            <option value="">Please select...</option>
            {question.name === "activity_level" && (
              <>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Very Active">Very Active</option>
                <option value="Extremely Active">Extremely Active</option>
              </>
            )}
            {question.name === "goal_type" && (
              <>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Overall Fitness">Overall Fitness</option>
              </>
            )}
            {question.name === "dietary_preferences" && (
              <>
                <option value="Vegan">Vegan</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Mixed">Mixed</option>
                <option value="Non-Veg">Non-Veg</option>
              </>
            )}
          </select>
        );

      default:
        return (
          <div className="relative">
            <input
              type="text"
              name={question.name}
              value={formData[question.name]}
              onChange={handleChange}
              required
              className="peer mt-2 block w-full px-3 py-2 text-base text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:focus:ring-blue-300"
            />
            <label
              htmlFor={question.name}
              className="absolute text-gray-500 left-3 top-2 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:text-sm peer-focus:text-blue-500 dark:text-gray-300 dark:peer-focus:text-blue-300"
            >
              {question.label}
            </label>
          </div>
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">Onboarding Quiz</h2>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-lg text-gray-700 dark:text-gray-300">{questions[step]?.label}</p>
        {renderInputField(questions[step])}

        <div className="flex justify-between items-center">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : step < questions.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Step {step + 1} of {questions.length}
        </p>
      </div>
    </form>
  );
}
