"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalorieWidget } from "@/components/widgets/calorie-widget";
import { WaterIntakeWidget } from "@/components/widgets/water-intake-widget";
import { WorkoutWidget } from "@/components/widgets/workout-widget";
import { ActivityFeed } from "@/components/widgets/activity-feed";
import { useAuth } from "@/components/auth-provider";
import { UserStats } from "@/components/user-stats";
import { CircularProgress, MultiColorCircularProgress } from "@/components/circular-progress";
import { Button } from "@/components/ui/button";
import { Scale, Ruler, Activity } from "lucide-react";
import axios from "axios";

export function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user || { name: "User" };

  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [bmiResult, setBmiResult] = useState("");
  const [bmiCategory, setBmiCategory] = useState("");


  // Fetch selected foods from the backend when the component is mounted
  useEffect(() => {
    async function fetchSelectedFoods() {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard/diet/");
        // Ensure the response is structured correctly
        setSelectedFoods(response.data.selectedFoods || []);  // Assuming response structure: { selectedFoods: [...] }
      } catch (error) {
        console.error("Failed to fetch selected foods.", error);
      } finally {
        setLoading(false);  // Set loading to false after fetching
      }
    }

    fetchSelectedFoods();
  }, []);

  // Function to remove food item from selectedFoods list
  const handleRemove = (foodId) => {
    const updatedSelectedFoods = selectedFoods.filter((food) => food.id !== foodId);
    setSelectedFoods(updatedSelectedFoods);
  };

  // Function to calculate BMI
  const calculateBMI = () => {
    if (height > 0 && weight > 0) {
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
      setBmiResult(bmi);

      // Determine BMI category
      if (bmi < 18.5) {
        setBmiCategory("Underweight");
      } else if (bmi < 25) {
        setBmiCategory("Normal weight");
      } else if (bmi < 30) {
        setBmiCategory("Overweight");
      } else {
        setBmiCategory("Obesity");
      }
    } else {
      setBmiResult("");
      setBmiCategory("");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "User"}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/50 backdrop-blur">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UserStats />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 flex flex-col items-center justify-center border-blue-500/20">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Daily Goal Progress</div>
              <CircularProgress value={78} color="hsl(var(--chart-blue))" trailColor="hsl(var(--secondary))" />
            </Card>
            <Card className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 p-6 flex flex-col items-center justify-center border-pink-500/20">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Calories Burned</div>
              <MultiColorCircularProgress
                value={45}
                colors={["hsl(var(--chart-blue))", "hsl(var(--chart-pink))"]}
                trailColor="hsl(var(--secondary))"
                label="450 / 1000 kcal"
                labelSize={12}
              />
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 p-6 flex flex-col items-center justify-center border-green-500/20">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Workout Streak</div>
              <CircularProgress
                value={100}
                color="hsl(var(--chart-pink))"
                trailColor="hsl(var(--secondary))"
                label="7 days"
                labelSize={12}
              />
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 p-6 flex flex-col items-center justify-center border-yellow-500/20">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Water Intake</div>
              <CircularProgress
                value={48}
                color="hsl(var(--chart-blue))"
                trailColor="hsl(var(--secondary))"
                label="1.2L / 2.5L"
                labelSize={12}
              />
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 col-span-4 border-slate-500/10 p-8">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">Daily Activity</h3>
                <div>
                  <h4 className="text-lg font-medium mb-4">Selected Foods:</h4>
                  <ul className="space-y-4">
                    {loading ? (
                      <p className="text-muted-foreground">Loading selected foods...</p>
                    ) : selectedFoods.length === 0 ? (
                      <p className="text-muted-foreground">No foods selected today.</p>
                    ) : (
                      selectedFoods.map((food) => (
                        <li key={food.id} className="flex justify-between items-center text-sm text-muted-foreground">
                          <span className="font-medium">{food.name}</span> - {food.calories} kcal
                          <button
                            onClick={() => handleRemove(food.id)}
                            className="ml-4 text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <ActivityFeed />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 col-span-3 border-indigo-500/10">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Today's Widgets</h3>
                <div className="grid gap-4">
                  <CalorieWidget />
                  <WaterIntakeWidget />
                  <WorkoutWidget />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 border-slate-500/10">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Analytics</h3>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics charts will appear here</p>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 border-slate-500/10">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Reports</h3>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Reports will appear here</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quiz Button Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 mt-6 border-purple-500/20">
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-semibold mb-3">Personalize Your Experience</h3>
          <p className="text-muted-foreground mb-4">
            Take our health quiz to get personalized recommendations tailored to your goals and needs.
          </p>
          <Button
            onClick={() => router.push('/onboarding')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Play Your Quiz Now to Get Better Results
          </Button>
        </div>
      </Card>

      {/* BMI Calculator Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-green-500/10 p-6 mt-6 border-blue-500/20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">BMI Calculator</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Body Mass Index (BMI) is a measure of body fat based on height and weight that applies to adult men and women.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-blue-500" />
                  <label htmlFor="height" className="font-medium">Height (cm)</label>
                </div>
                <input
                  type="number"
                  id="height"
                  placeholder="Enter your height"
                  value={height || ''}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  <label htmlFor="weight" className="font-medium">Weight (kg)</label>
                </div>
                <input
                  type="number"
                  id="weight"
                  placeholder="Enter your weight"
                  value={weight || ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <Button
                onClick={calculateBMI}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-md hover:from-blue-600 hover:to-green-600 transition-all"
              >
                Calculate BMI
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {bmiResult ? (
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="text-4xl font-bold text-blue-600">{bmiResult}</div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gray-200 shadow-sm">
                    <span className="font-medium text-sm">{bmiCategory}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Underweight: &lt; 18.5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Normal weight: 18.5 - 24.9</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Overweight: 25 - 29.9</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Obesity: ≥ 30</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">Enter your height and weight to calculate your BMI</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
