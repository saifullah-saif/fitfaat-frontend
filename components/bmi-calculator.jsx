"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calculator } from "lucide-react"
import { CircularProgress } from "@/components/circular-progress"

export function BMICalculator() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bmi, setBmi] = useState(null)
  const [category, setCategory] = useState("")
  const [unit, setUnit] = useState("metric")

  const calculateBMI = () => {
    if (!height || !weight) return

    let bmiValue
    if (unit === "metric") {
      // Metric: weight (kg) / height^2 (m)
      const heightInMeters = Number.parseFloat(height) / 100
      bmiValue = Number.parseFloat(weight) / (heightInMeters * heightInMeters)
    } else {
      // Imperial: (weight (lbs) * 703) / height^2 (inches)
      bmiValue = (Number.parseFloat(weight) * 703) / (Number.parseFloat(height) * Number.parseFloat(height))
    }

    bmiValue = Math.round(bmiValue * 10) / 10

    setBmi(bmiValue)

    // Determine BMI category
    if (bmiValue < 18.5) {
      setCategory("Underweight")
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setCategory("Normal weight")
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setCategory("Overweight")
    } else {
      setCategory("Obesity")
    }
  }

  const getBmiColor = () => {
    if (!bmi) return "#94a3b8" // Default gray
    if (bmi < 18.5) return "#3b82f6" // Blue for underweight
    if (bmi >= 18.5 && bmi < 25) return "#10b981" // Green for normal
    if (bmi >= 25 && bmi < 30) return "#f59e0b" // Amber for overweight
    return "#ef4444" // Red for obesity
  }

  const getBmiPercentage = () => {
    if (!bmi) return 0
    // Map BMI to a percentage for the circular progress
    // Assuming a range of 15-40 for visualization purposes
    const minBmi = 15
    const maxBmi = 40
    const percentage = ((bmi - minBmi) / (maxBmi - minBmi)) * 100
    return Math.min(Math.max(percentage, 0), 100) // Clamp between 0-100
  }

  const resetForm = () => {
    setHeight("")
    setWeight("")
    setBmi(null)
    setCategory("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/diet" className="flex items-center text-primary mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Diet Tracker
      </Link>

      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">BMI Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your Body Mass Index (BMI) to assess your weight relative to height.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Your BMI</CardTitle>
            <CardDescription>Enter your height and weight to calculate your BMI</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={unit} onValueChange={setUnit} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="metric">Metric</TabsTrigger>
                <TabsTrigger value="imperial">Imperial</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height {unit === "metric" ? "(cm)" : "(inches)"}</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder={unit === "metric" ? "175" : "69"}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight {unit === "metric" ? "(kg)" : "(lbs)"}</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={unit === "metric" ? "70" : "154"}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button onClick={calculateBMI}>
              <Calculator className="mr-2 h-4 w-4" />
              Calculate BMI
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your BMI Result</CardTitle>
            <CardDescription>
              {bmi
                ? `Your BMI indicates that you are ${category.toLowerCase()}`
                : "Enter your details to see your BMI result"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <CircularProgress
              value={getBmiPercentage()}
              size={160}
              strokeWidth={12}
              color={getBmiColor()}
              showValue={false}
            />
            <div className="absolute text-3xl font-bold">{bmi || "-"}</div>
            {category && (
              <div className="mt-4 text-center">
                <p className="text-lg font-medium">{category}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {category === "Underweight"
                    ? "You may need to gain some weight."
                    : category === "Normal weight"
                      ? "You have a healthy weight."
                      : category === "Overweight"
                        ? "You may need to lose some weight."
                        : "You may need to lose weight for health reasons."}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full text-sm text-muted-foreground">
              <p className="mb-2">BMI Categories:</p>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Underweight</span>
                  <span>&lt; 18.5</span>
                </li>
                <li className="flex justify-between">
                  <span>Normal weight</span>
                  <span>18.5 - 24.9</span>
                </li>
                <li className="flex justify-between">
                  <span>Overweight</span>
                  <span>25 - 29.9</span>
                </li>
                <li className="flex justify-between">
                  <span>Obesity</span>
                  <span>&gt;= 30</span>
                </li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
