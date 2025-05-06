"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dumbbell, Clock, Flame, Plus, ChevronRight, CheckCircle2 } from "lucide-react"
import { CircularProgress } from "@/components/circular-progress"

const workoutTypes = [
  {
    id: "upper-body",
    name: "Upper Body",
    icon: Dumbbell,
    color: "#8b5cf6", // purple
    description: "Focus on chest, shoulders, back, and arms",
    workouts: [
      {
        id: "bench-press",
        name: "Bench Press",
        sets: 3,
        reps: "8-12",
        muscles: ["Chest", "Shoulders", "Triceps"],
      },
      {
        id: "shoulder-press",
        name: "Shoulder Press",
        sets: 3,
        reps: "8-12",
        muscles: ["Shoulders", "Triceps"],
      },
      {
        id: "pull-ups",
        name: "Pull-ups",
        sets: 3,
        reps: "8-12",
        muscles: ["Back", "Biceps"],
      },
      {
        id: "bicep-curls",
        name: "Bicep Curls",
        sets: 3,
        reps: "10-15",
        muscles: ["Biceps"],
      },
    ],
  },
  {
    id: "lower-body",
    name: "Lower Body",
    icon: Dumbbell,
    color: "#ec4899", // pink
    description: "Focus on quads, hamstrings, glutes, and calves",
    workouts: [
      {
        id: "squats",
        name: "Squats",
        sets: 4,
        reps: "8-12",
        muscles: ["Quadriceps", "Glutes", "Hamstrings"],
      },
      {
        id: "lunges",
        name: "Lunges",
        sets: 3,
        reps: "10-12 each leg",
        muscles: ["Quadriceps", "Glutes", "Hamstrings"],
      },
      {
        id: "deadlifts",
        name: "Deadlifts",
        sets: 3,
        reps: "8-10",
        muscles: ["Hamstrings", "Glutes", "Lower Back"],
      },
      {
        id: "calf-raises",
        name: "Calf Raises",
        sets: 3,
        reps: "15-20",
        muscles: ["Calves"],
      },
    ],
  },
  {
    id: "cardio",
    name: "Cardio",
    icon: Flame,
    color: "#f97316", // orange
    description: "Improve cardiovascular health and burn calories",
    workouts: [
      {
        id: "running",
        name: "Running",
        duration: "30 min",
        intensity: "Moderate",
        calories: "300-400",
      },
      {
        id: "cycling",
        name: "Cycling",
        duration: "45 min",
        intensity: "Moderate to High",
        calories: "400-600",
      },
      {
        id: "jump-rope",
        name: "Jump Rope",
        duration: "15 min",
        intensity: "High",
        calories: "200-300",
      },
      {
        id: "hiit",
        name: "HIIT",
        duration: "20 min",
        intensity: "Very High",
        calories: "300-400",
      },
    ],
  },
  {
    id: "core",
    name: "Core",
    icon: Dumbbell,
    color: "#10b981", // green
    description: "Strengthen abdominal and lower back muscles",
    workouts: [
      {
        id: "planks",
        name: "Planks",
        sets: 3,
        duration: "30-60 sec",
        muscles: ["Abs", "Lower Back"],
      },
      {
        id: "crunches",
        name: "Crunches",
        sets: 3,
        reps: "15-20",
        muscles: ["Abs"],
      },
      {
        id: "russian-twists",
        name: "Russian Twists",
        sets: 3,
        reps: "20 total",
        muscles: ["Obliques", "Abs"],
      },
      {
        id: "leg-raises",
        name: "Leg Raises",
        sets: 3,
        reps: "12-15",
        muscles: ["Lower Abs"],
      },
    ],
  },
]

const workouts = [
  {
    id: 1,
    name: "Upper Body Strength",
    duration: "45 min",
    calories: 320,
    completed: true,
    exercises: [
      { name: "Bench Press", sets: 3, reps: 10, completed: true },
      { name: "Pull-ups", sets: 3, reps: 8, completed: true },
      { name: "Shoulder Press", sets: 3, reps: 10, completed: true },
      { name: "Bicep Curls", sets: 3, reps: 12, completed: true },
    ],
  },
  {
    id: 2,
    name: "Core Workout",
    duration: "30 min",
    calories: 250,
    completed: false,
    exercises: [
      { name: "Plank", sets: 3, duration: "60 sec", completed: false },
      { name: "Russian Twists", sets: 3, reps: 20, completed: false },
      { name: "Leg Raises", sets: 3, reps: 15, completed: false },
      { name: "Mountain Climbers", sets: 3, duration: "45 sec", completed: false },
    ],
  },
  {
    id: 3,
    name: "Cardio Session",
    duration: "40 min",
    calories: 400,
    completed: false,
    exercises: [
      { name: "Treadmill Run", duration: "20 min", completed: false },
      { name: "Jump Rope", duration: "10 min", completed: false },
      { name: "Burpees", sets: 3, reps: 15, completed: false },
      { name: "Box Jumps", sets: 3, reps: 12, completed: false },
    ],
  },
]

export function WorkoutPlanner() {
  const [activeTab, setActiveTab] = useState("today")

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Planner</h1>
        <p className="text-muted-foreground">Plan and track your workouts to achieve your fitness goals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={60} size={100} color="#10b981" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">3 / 5</div>
              <p className="text-xs text-muted-foreground">2 workouts remaining this week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={64.7} size={100} color="#f97316" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">970 kcal</div>
              <p className="text-xs text-muted-foreground">Target: 1,500 kcal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={57.5} size={100} color="#8b5cf6" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">115 min</div>
              <p className="text-xs text-muted-foreground">Target: 200 min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularProgress value={100} size={100} color="#ec4899" />
            <div className="mt-2 text-center">
              <div className="text-xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="workout-types">Workout Types</TabsTrigger>
          <TabsTrigger value="routines">My Routines</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workouts.map((workout) => (
              <Card key={workout.id} className={workout.completed ? "border-green-500/50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      {workout.name}
                      {workout.completed && <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {workout.duration}
                    </span>
                    <span className="flex items-center">
                      <Flame className="mr-1 h-4 w-4" />
                      {workout.calories} kcal
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {workout.exercises.map((exercise, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 rounded-full p-1 bg-muted">
                            <Dumbbell className="h-4 w-4" />
                          </div>
                          <span>{exercise.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-2">
                            {exercise.sets && exercise.reps ? `${exercise.sets} × ${exercise.reps}` : exercise.duration}
                          </span>
                          {exercise.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="workout-types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workoutTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-2" style={{ backgroundColor: `${type.color}20` }}>
                      <type.icon className="h-5 w-5" style={{ color: type.color }} />
                    </div>
                    <CardTitle>{type.name}</CardTitle>
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {type.workouts.map((workout) => (
                      <Link href={`/workout/${type.id}/${workout.id}`} key={workout.id}>
                        <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer">
                          <div>
                            <p className="font-medium">{workout.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {workout.sets && workout.reps
                                ? `${workout.sets} sets × ${workout.reps}`
                                : workout.duration && workout.intensity
                                  ? `${workout.duration} • ${workout.intensity} intensity`
                                  : ""}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="routines" className="space-y-4">
          <div className="h-[400px] flex items-center justify-center border rounded-md">
            <p className="text-muted-foreground">Your saved workout routines will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
