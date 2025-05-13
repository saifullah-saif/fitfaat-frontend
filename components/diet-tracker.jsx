"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import CalorieCalculator from "@/components/CalorieCalculator";
import Diet from "@/components/diet";

export default function DietTracker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);

  const calculateTotalCalories = (updatedSelectedFoods) => {
    const total = updatedSelectedFoods.reduce((sum, food) => sum + food.calories, 0);
    setTotalCalories(total);
  };

  useEffect(() => {
    async function fetchFoods() {
      try {
        const response = await axios.get("http://localhost:5000/api/foods");
        setAvailableFoods(response.data);
      } catch (error) {
        console.error("Failed to fetch foods.", error);
      }
    }
    fetchFoods();
  }, []);

  const handleSelect = (foodId) => {
    const food = availableFoods.find((f) => f.id === parseInt(foodId));
    if (food && !selectedFoods.some((selected) => selected.id === food.id)) {
      const updatedSelectedFoods = [...selectedFoods, food];
      setSelectedFoods(updatedSelectedFoods);
      calculateTotalCalories(updatedSelectedFoods);
    }
  };

  const handleRemove = (foodId) => {
    const updatedSelectedFoods = selectedFoods.filter((food) => food.id !== foodId);
    setSelectedFoods(updatedSelectedFoods);
    calculateTotalCalories(updatedSelectedFoods);
  };

  const saveSelectedFoods = async () => {
    try {
      await axios.post("http://localhost:5000/api/dashboard/diet/", { selectedFoods });
    } catch (error) {
      console.error("Failed to save selected foods.", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-5xl font-bold text-center">Diet Tracker</h1>
      <p className="text-3xl font-semibold text-center">Generate a diet or Customise your own diet here!</p>
      <p className="text-2xl font-semibold text-center">Total Calories: {totalCalories} kcal</p>

      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full bg-gray-800 text-white">
          <p>Select Food</p>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 text-white">
          {availableFoods.map((food) => (
            <SelectItem key={food.id} value={food.id.toString()}>{food.name} ({food.calories} kcal)</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4 p-4 border rounded-md bg-gray-800">
        <h2 className="font-semibold">Selected Foods:</h2>
        {selectedFoods.length === 0 ? <p>No foods selected.</p> : selectedFoods.map((food) => (
          <div key={food.id} className="flex justify-between items-center">
            <p>{food.name} - {food.calories} kcal</p>
            <Button onClick={() => handleRemove(food.id)} className="ml-4 bg-red-500 hover:bg-red-600">Remove</Button>
          </div>
        ))}
      </div>

      <Button onClick={saveSelectedFoods} className="w-full mt-4 bg-green-500 hover:bg-green-600">Save to Dashboard</Button>

      <CalorieCalculator />

      <Link href="/dietmaker">
        <Button className="mt-4">Auto Diet Generator</Button>
      </Link>
    </div>
  );
}
