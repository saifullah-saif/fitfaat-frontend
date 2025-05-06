"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalorieWidget } from "@/components/widgets/calorie-widget"
import { WaterIntakeWidget } from "@/components/widgets/water-intake-widget"
import { WorkoutWidget } from "@/components/widgets/workout-widget"
import { StepCounterWidget } from "@/components/widgets/step-counter-widget"
import { WeightWidget } from "@/components/widgets/weight-widget"
import { ActivityFeed } from "@/components/widgets/activity-feed"
import { useAuth } from "@/components/auth-provider"
import { UserStats } from "@/components/user-stats"
import { CircularProgress, MultiColorCircularProgress } from "@/components/circular-progress"

export function Dashboard() {
  const auth = useAuth()
  const user = auth?.user || { name: "User" }

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
            <Card className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 col-span-4 border-slate-500/10">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Daily Activity</h3>
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
                  <StepCounterWidget />
                  <WeightWidget />
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
    </div>
  )
}
