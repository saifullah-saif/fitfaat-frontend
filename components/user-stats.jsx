"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Footprints, Scale, TrendingUp } from "lucide-react"
import { CircularProgress } from "@/components/circular-progress"

// Mock data
const mockWeightLogs = [
  { id: 1, weight: 75.5, date: new Date().toISOString() },
  { id: 2, weight: 76.0, date: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
  { id: 3, weight: 76.5, date: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
]

const mockStepsLogs = [{ id: 1, steps: 8500, date: new Date().toISOString() }]

export function UserStats() {
  const { user } = useAuth()
  const [weightLogs, setWeightLogs] = useState(mockWeightLogs)
  const [stepsLogs, setStepsLogs] = useState(mockStepsLogs)
  const [newWeight, setNewWeight] = useState("")
  const [newSteps, setNewSteps] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddWeight = async (e) => {
    e.preventDefault()
    if (!newWeight) return

    try {
      setLoading(true)
      const weight = Number.parseFloat(newWeight)
      const newLog = {
        id: Date.now(),
        weight,
        date: new Date().toISOString(),
      }

      setWeightLogs([newLog, ...weightLogs])
      setNewWeight("")
    } catch (error) {
      console.error("Error adding weight log:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSteps = async (e) => {
    e.preventDefault()
    if (!newSteps) return

    try {
      setLoading(true)
      const steps = Number.parseInt(newSteps)
      const newLog = {
        id: Date.now(),
        steps,
        date: new Date().toISOString(),
      }

      setStepsLogs([newLog, ...stepsLogs])
      setNewSteps("")
    } catch (error) {
      console.error("Error adding steps log:", error)
    } finally {
      setLoading(false)
    }
  }

  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : null
  const previousWeight = weightLogs.length > 1 ? weightLogs[1].weight : null
  const weightDifference = latestWeight && previousWeight ? latestWeight - previousWeight : null

  const todaySteps = stepsLogs.reduce((total, log) => total + log.steps, 0)
  const stepsPercentage = Math.min(Math.round((todaySteps / 10000) * 100), 100)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="minimal-card">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Scale className="mr-2 h-5 w-5 text-[hsl(var(--chart-pink))]" />
            Weight Tracking
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{latestWeight ? `${latestWeight} kg` : "No data"}</div>
                  {weightDifference !== null && (
                    <div
                      className={`text-sm ${weightDifference < 0 ? "text-green-500" : weightDifference > 0 ? "text-red-500" : "text-gray-500"}`}
                    >
                      <span className="flex items-center justify-center">
                        <TrendingUp className={`h-4 w-4 mr-1 ${weightDifference < 0 ? "rotate-180" : ""}`} />
                        {weightDifference < 0 ? Math.abs(weightDifference).toFixed(1) : weightDifference.toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddWeight} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Add New Weight (kg)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="Enter weight"
                      className="minimal-input"
                    />
                    <Button type="submit" className="minimal-button">
                      Add
                    </Button>
                  </div>
                </div>
              </form>

              {weightLogs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Logs</h4>
                  <div className="space-y-2">
                    {weightLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex justify-between text-sm p-2 rounded bg-secondary/20">
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        <span className="font-medium">{log.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <Card className="minimal-card">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Footprints className="mr-2 h-5 w-5 text-[hsl(var(--chart-blue))]" />
            Steps Tracking
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <CircularProgress
                  value={stepsPercentage}
                  color="hsl(var(--chart-blue))"
                  trailColor="hsl(var(--secondary))"
                  showValue={false}
                  size={120}
                />
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold">{todaySteps}</span>
                  <span className="text-xs text-muted-foreground">steps</span>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground mb-4">
                {10000 - todaySteps > 0 ? `${10000 - todaySteps} steps to go` : "Daily goal achieved!"}
              </div>

              <form onSubmit={handleAddSteps} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="steps">Add Steps</Label>
                  <div className="flex gap-2">
                    <Input
                      id="steps"
                      type="number"
                      value={newSteps}
                      onChange={(e) => setNewSteps(e.target.value)}
                      placeholder="Enter steps"
                      className="minimal-input"
                    />
                    <Button type="submit" className="minimal-button">
                      Add
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
