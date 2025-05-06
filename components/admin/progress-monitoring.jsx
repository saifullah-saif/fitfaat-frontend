"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Search, Calendar, TrendingUp, Activity, Weight, Dumbbell } from "lucide-react"

// Mock progress data
const mockWeightData = [
  { name: "Jan", User1: 75, User2: 68, User3: 82 },
  { name: "Feb", User1: 74, User2: 67, User3: 81 },
  { name: "Mar", User1: 73, User2: 67, User3: 80 },
  { name: "Apr", User1: 72, User2: 66, User3: 79 },
  { name: "May", User1: 71, User2: 65, User3: 78 },
]

const mockWorkoutData = [
  { name: "Jan", User1: 12, User2: 8, User3: 15 },
  { name: "Feb", User1: 15, User2: 10, User3: 18 },
  { name: "Mar", User1: 18, User2: 12, User3: 20 },
  { name: "Apr", User1: 20, User2: 15, User3: 22 },
  { name: "May", User1: 22, User2: 18, User3: 25 },
]

const mockCalorieData = [
  { name: "Jan", User1: 2200, User2: 1800, User3: 2500 },
  { name: "Feb", User1: 2150, User2: 1750, User3: 2450 },
  { name: "Mar", User1: 2100, User2: 1700, User3: 2400 },
  { name: "Apr", User1: 2050, User2: 1650, User3: 2350 },
  { name: "May", User1: 2000, User2: 1600, User3: 2300 },
]

// Mock user achievements
const mockAchievements = [
  {
    id: 1,
    userId: 1,
    userName: "John Doe",
    achievement: "Weight Loss Goal",
    description: "Lost 5kg in 2 months",
    date: "2023-04-15",
    status: "completed",
  },
  {
    id: 2,
    userId: 2,
    userName: "Jane Smith",
    achievement: "Workout Streak",
    description: "Completed 30 days of workouts",
    date: "2023-05-01",
    status: "completed",
  },
  {
    id: 3,
    userId: 3,
    userName: "Robert Johnson",
    achievement: "Nutrition Goal",
    description: "Maintained calorie deficit for 3 weeks",
    date: "2023-04-20",
    status: "in-progress",
  },
  {
    id: 4,
    userId: 4,
    userName: "Emily Davis",
    achievement: "Strength Milestone",
    description: "Increased bench press by 20kg",
    date: "2023-05-05",
    status: "completed",
  },
  {
    id: 5,
    userId: 5,
    userName: "Michael Wilson",
    achievement: "Running Goal",
    description: "Ran 100km in a month",
    date: "2023-04-28",
    status: "in-progress",
  },
]

export function ProgressMonitoring() {
  const [selectedMetric, setSelectedMetric] = useState("weight")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly")
  const [achievementFilter, setAchievementFilter] = useState("all")

  // Get the appropriate data based on selected metric
  const getChartData = () => {
    switch (selectedMetric) {
      case "weight":
        return mockWeightData
      case "workouts":
        return mockWorkoutData
      case "calories":
        return mockCalorieData
      default:
        return mockWeightData
    }
  }

  // Get chart title based on selected metric
  const getChartTitle = () => {
    switch (selectedMetric) {
      case "weight":
        return "Weight Progress (kg)"
      case "workouts":
        return "Workout Frequency (per month)"
      case "calories":
        return "Calorie Intake (daily average)"
      default:
        return "Progress Data"
    }
  }

  // Get chart icon based on selected metric
  const getChartIcon = () => {
    switch (selectedMetric) {
      case "weight":
        return <Weight className="h-5 w-5 mr-2" />
      case "workouts":
        return <Dumbbell className="h-5 w-5 mr-2" />
      case "calories":
        return <Activity className="h-5 w-5 mr-2" />
      default:
        return <TrendingUp className="h-5 w-5 mr-2" />
    }
  }

  // Filter achievements based on search and filter
  const filteredAchievements = mockAchievements.filter((achievement) => {
    const matchesSearch =
      achievement.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.achievement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = achievementFilter === "all" || achievement.status === achievementFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Progress Charts</TabsTrigger>
          <TabsTrigger value="achievements">User Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="workouts">Workouts</SelectItem>
                  <SelectItem value="calories">Calories</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                {getChartIcon()}
                {getChartTitle()}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    User1: {
                      label: "John Doe",
                      color: "hsl(var(--chart-1))",
                    },
                    User2: {
                      label: "Jane Smith",
                      color: "hsl(var(--chart-2))",
                    },
                    User3: {
                      label: "Robert Johnson",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="User1" stroke="var(--color-User1)" strokeWidth={2} />
                      <Line type="monotone" dataKey="User2" stroke="var(--color-User2)" strokeWidth={2} />
                      <Line type="monotone" dataKey="User3" stroke="var(--color-User3)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={achievementFilter} onValueChange={setAchievementFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Achievements</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAchievements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No achievements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAchievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell className="font-medium">{achievement.userName}</TableCell>
                      <TableCell>{achievement.achievement}</TableCell>
                      <TableCell>{achievement.description}</TableCell>
                      <TableCell>{new Date(achievement.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            achievement.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }
                        >
                          {achievement.status === "completed" ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
