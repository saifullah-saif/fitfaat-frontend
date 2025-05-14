"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import CalorieCalculator from "@/components/CalorieCalculator";

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
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-zinc-900 text-white rounded-2xl shadow-2xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">🍽️ Diet Tracker</h1>
        <p className="text-xl sm:text-2xl font-medium text-zinc-300">Generate or customize your diet plan</p>
        <p className="text-lg sm:text-xl text-green-400 font-semibold">Total Calories: {totalCalories} kcal</p>
      </div>

      <div>
        <Select onValueChange={handleSelect}>
          <SelectTrigger className="w-full bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 focus:ring-2 focus:ring-green-500">
            <span>Select Food</span>
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 text-white border border-zinc-700">
            {availableFoods.map((food) => (
              <SelectItem
                key={food.id}
                value={food.id.toString()}
                className="hover:bg-zinc-700 cursor-pointer"
              >
                {food.name} ({food.calories} kcal)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">Selected Foods</h2>
        {selectedFoods.length === 0 ? (
          <p className="text-zinc-400">No foods selected.</p>
        ) : (
          selectedFoods.map((food) => (
            <div key={food.id} className="flex justify-between items-center text-sm sm:text-base">
              <p>{food.name} - {food.calories} kcal</p>
              <Button
                onClick={() => handleRemove(food.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={saveSelectedFoods}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-lg rounded-xl"
      >
        Save to Dashboard
      </Button>

      <div className="pt-4 border-t border-zinc-700">
        <CalorieCalculator />
      </div>

      <Link href="/dietmaker" className="block">
        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 text-lg rounded-xl">
          Auto Diet Generator
        </Button>
      </Link>
    </div>
  );
}
