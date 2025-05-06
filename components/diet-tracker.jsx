"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Plus, Apple, Beef, Fish, Carrot, Coffee, Calculator, ArrowRight } from "lucide-react"
import { CircularProgress } from "@/components/circular-progress"

const meals = [
  {
    id: 1,
    name: "Breakfast",
    time: "7:00 AM",
    calories: 320,
    items: [
      { name: "Oatmeal", calories: 150, icon: Apple },
      { name: "Banana", calories: 105, icon: Apple },
      { name: "Almond Milk", calories: 65, icon: Coffee },
    ],
  },
  {
    id: 2,
    name: "Lunch",
    time: "12:30 PM",
    calories: 520,
    items: [
      { name: "Grilled Chicken", calories: 250, icon: Beef },
      { name: "Brown Rice", calories: 150, icon: Carrot },
      { name: "Steamed Vegetables", calories: 120, icon: Carrot },
    ],
  },
  {
    id: 3,
    name: "Dinner",
    time: "7:00 PM",
    calories: 450,
    items: [
      { name: "Salmon", calories: 280, icon: Fish },
      { name: "Quinoa", calories: 120, icon: Carrot },
      { name: "Asparagus", calories: 50, icon: Carrot },
    ],
  },
  {
    id: 4,
    name: "Snacks",
    time: "Various",
    calories: 200,
    items: [
      { name: "Greek Yogurt", calories: 100, icon: Coffee },
      { name: "Mixed Nuts", calories: 100, icon: Apple },
    ],
  },
]

const mealPlans = [
  {
    id: "balanced",
    name: "Balanced Diet",
    description: "A well-rounded diet with balanced macronutrients",
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65,
    meals: [
      {
        name: "Breakfast",
        foods: ["Oatmeal with berries", "Greek yogurt", "Honey"],
        calories: 450,
      },
      {
        name: "Lunch",
        foods: ["Grilled chicken breast", "Quinoa", "Mixed vegetables"],
        calories: 650,
      },
      {
        name: "Dinner",
        foods: ["Baked salmon", "Brown rice", "Steamed broccoli"],
        calories: 600,
      },
      {
        name: "Snacks",
        foods: ["Apple with almond butter", "Protein shake"],
        calories: 300,
      },
    ],
  },
  {
    id: "keto",
    name: "Ketogenic Diet",
    description: "High fat, moderate protein, very low carb diet",
    calories: 2000,
    protein: 150,
    carbs: 50,
    fat: 150,
    meals: [
      {
        name: "Breakfast",
        foods: ["Scrambled eggs with cheese", "Avocado", "Bacon"],
        calories: 550,
      },
      {
        name: "Lunch",
        foods: ["Tuna salad with mayo", "Mixed greens", "Olive oil dressing"],
        calories: 600,
      },
      {
        name: "Dinner",
        foods: ["Ribeye steak", "Cauliflower mash", "Asparagus with butter"],
        calories: 700,
      },
      {
        name: "Snacks",
        foods: ["Cheese cubes", "Macadamia nuts"],
        calories: 150,
      },
    ],
  },
  {
    id: "vegan",
    name: "Vegan Diet",
    description: "Plant-based diet with no animal products",
    calories: 2000,
    protein: 80,
    carbs: 300,
    fat: 55,
    meals: [
      {
        name: "Breakfast",
        foods: ["Tofu scramble", "Whole grain toast", "Avocado"],
        calories: 450,
      },
      {
        name: "Lunch",
        foods: ["Lentil soup", "Mixed green salad", "Hummus"],
        calories: 550,
      },
      {
        name: "Dinner",
        foods: ["Chickpea curry", "Brown rice", "Steamed vegetables"],
        calories: 650,
      },
      {
        name: "Snacks",
        foods: ["Apple", "Almond butter", "Energy balls"],
        calories: 350,
      },
    ],
  },
]

export function DietTracker() {
  const [activeTab, setActiveTab] = useState("today")
  const [selectedMealPlan, setSelectedMealPlan] = useState("balanced")

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Diet Tracker</h1>
        <p className="text-muted-foreground">Track your meals and monitor your calorie intake.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={74.5} size={100} color="#10b981" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">1,490 / 2,000</div>
              <p className="text-xs text-muted-foreground">510 calories remaining</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={70.8} size={100} color="#8b5cf6" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">85g / 120g</div>
              <p className="text-xs text-muted-foreground">35g remaining</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={72} size={100} color="#f59e0b" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">180g / 250g</div>
              <p className="text-xs text-muted-foreground">70g remaining</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={69.2} size={100} color="#ec4899" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">45g / 65g</div>
              <p className="text-xs text-muted-foreground">20g remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Link href="/diet/bmi-calculator">
          <Button variant="outline" className="gap-2">
            <Calculator className="h-4 w-4" />
            BMI Calculator
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
          <TabsTrigger value="meal-planner">Meal Planner</TabsTrigger>
          <TabsTrigger value="calculator">Diet Calculator</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {meals.map((meal) => (
              <Card key={meal.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{meal.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">{meal.time}</span>
                  </div>
                  <CardDescription>{meal.calories} calories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {meal.items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 rounded-full p-1 bg-muted">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span>{item.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.calories} kcal</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="yesterday" className="space-y-4">
          <div className="h-[400px] flex items-center justify-center border rounded-md">
            <p className="text-muted-foreground">Yesterday's meals will appear here</p>
          </div>
        </TabsContent>
        <TabsContent value="meal-planner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Selection</CardTitle>
              <CardDescription>Choose a meal plan that fits your dietary preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="meal-plan">Select Meal Plan</Label>
                <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                  <SelectTrigger id="meal-plan">
                    <SelectValue placeholder="Select a meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Daily Calories</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    defaultValue={[mealPlans.find((plan) => plan.id === selectedMealPlan)?.calories || 2000]}
                    max={3000}
                    step={50}
                  />
                  <span className="w-12 text-center font-medium">
                    {mealPlans.find((plan) => plan.id === selectedMealPlan)?.calories}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Protein</Label>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {mealPlans.find((plan) => plan.id === selectedMealPlan)?.protein}g
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        ((mealPlans.find((plan) => plan.id === selectedMealPlan)?.protein || 0) * 4 * 100) /
                          (mealPlans.find((plan) => plan.id === selectedMealPlan)?.calories || 1),
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Carbs</Label>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {mealPlans.find((plan) => plan.id === selectedMealPlan)?.carbs}g
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        ((mealPlans.find((plan) => plan.id === selectedMealPlan)?.carbs || 0) * 4 * 100) /
                          (mealPlans.find((plan) => plan.id === selectedMealPlan)?.calories || 1),
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Fat</Label>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {mealPlans.find((plan) => plan.id === selectedMealPlan)?.fat}g
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        ((mealPlans.find((plan) => plan.id === selectedMealPlan)?.fat || 0) * 9 * 100) /
                          (mealPlans.find((plan) => plan.id === selectedMealPlan)?.calories || 1),
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {mealPlans
              .find((plan) => plan.id === selectedMealPlan)
              ?.meals.map((meal, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{meal.name}</CardTitle>
                    <CardDescription>{meal.calories} calories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {meal.foods.map((food, foodIndex) => (
                        <li key={foodIndex} className="flex items-center">
                          <div className="mr-2 rounded-full p-1 bg-muted">
                            <Apple className="h-4 w-4" />
                          </div>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="flex justify-end">
            <Button>
              Apply This Meal Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diet Calculator</CardTitle>
              <CardDescription>Calculate your daily caloric needs based on your goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select defaultValue="male">
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" placeholder="175" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select defaultValue="moderate">
                    <SelectTrigger id="activity">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very-active">Very Active (hard exercise daily)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal</Label>
                  <Select defaultValue="maintain">
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Calculate Diet Plan</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Results</CardTitle>
              <CardDescription>Based on your inputs, here are your daily caloric needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center p-4 border rounded-md">
                  <span className="text-sm text-muted-foreground">Basal Metabolic Rate</span>
                  <span className="text-2xl font-bold">1,645</span>
                  <span className="text-xs text-muted-foreground">calories/day</span>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-md">
                  <span className="text-sm text-muted-foreground">Maintenance Calories</span>
                  <span className="text-2xl font-bold">2,467</span>
                  <span className="text-xs text-muted-foreground">calories/day</span>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-md bg-primary/10">
                  <span className="text-sm text-muted-foreground">Recommended Intake</span>
                  <span className="text-2xl font-bold">2,000</span>
                  <span className="text-xs text-muted-foreground">calories/day</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Protein (30%)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">150g</span>
                    <span className="text-sm text-muted-foreground">600 kcal</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <Label>Carbs (40%)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">200g</span>
                    <span className="text-sm text-muted-foreground">800 kcal</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-2">
                  <Label>Fat (30%)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">67g</span>
                    <span className="text-sm text-muted-foreground">600 kcal</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Apply Diet Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
