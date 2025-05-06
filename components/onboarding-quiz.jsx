"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

const steps = [
  { id: "step-1", name: "Basic Info" },
  { id: "step-2", name: "Body Metrics" },
  { id: "step-3", name: "Dietary Preferences" },
  { id: "step-4", name: "Health Information" },
  { id: "step-5", name: "Complete" },
]

const foodPreferences = [
  { id: "omnivore", label: "Omnivore (Everything)" },
  { id: "vegetarian", label: "Vegetarian (No meat)" },
  { id: "vegan", label: "Vegan (No animal products)" },
  { id: "pescatarian", label: "Pescatarian (Fish, no meat)" },
  { id: "keto", label: "Keto (Low carb, high fat)" },
  { id: "paleo", label: "Paleo (Whole foods)" },
]

const commonAllergies = [
  { id: "dairy", label: "Dairy" },
  { id: "nuts", label: "Nuts" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat/Gluten" },
  { id: "shellfish", label: "Shellfish" },
  { id: "fish", label: "Fish" },
]

export function OnboardingQuiz() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    foodPreference: "",
    healthIssues: "",
    allergies: [],
  })

  const updateFields = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Here you would save the user data to your backend
    console.log("Submitting user data:", formData)

    // For now, we'll just simulate a successful save and redirect
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Personalize Your Experience</CardTitle>
          <CardDescription>Help us customize FitFaat to your needs by answering a few questions</CardDescription>
          <Progress value={progressPercentage} className="h-2 mt-4" />
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => updateFields({ age: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateFields({ gender: value })}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Enter your height in cm"
                    value={formData.height}
                    onChange={(e) => updateFields({ height: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter your weight in kg"
                    value={formData.weight}
                    onChange={(e) => updateFields({ weight: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Food Preferences</Label>
                  <RadioGroup
                    value={formData.foodPreference}
                    onValueChange={(value) => updateFields({ foodPreference: value })}
                    className="flex flex-col space-y-2"
                  >
                    {foodPreferences.map((preference) => (
                      <div key={preference.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={preference.id} id={preference.id} />
                        <Label htmlFor={preference.id}>{preference.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="healthIssues">Health Issues or Conditions</Label>
                  <Textarea
                    id="healthIssues"
                    placeholder="Please list any health issues or conditions (e.g., diabetes, hypertension)"
                    value={formData.healthIssues}
                    onChange={(e) => updateFields({ healthIssues: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Food Allergies</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonAllergies.map((allergy) => (
                      <div key={allergy.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={allergy.id}
                          checked={formData.allergies.includes(allergy.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFields({ allergies: [...formData.allergies, allergy.id] })
                            } else {
                              updateFields({
                                allergies: formData.allergies.filter((id) => id !== allergy.id),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={allergy.id}>{allergy.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 text-center"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">All Set!</h3>
                <p className="text-muted-foreground">
                  Thank you for providing your information. We'll use this to personalize your experience.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          {currentStep > 0 && currentStep < 4 && (
            <Button variant="outline" onClick={prev}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep === 0 && <div />}

          {currentStep < 3 && (
            <Button onClick={next}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === 3 && (
            <Button onClick={next}>
              Complete
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === 4 && (
            <Button onClick={handleSubmit} className="w-full">
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
