"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"

export default function WorkoutDetailPage() {
  const params = useParams()
  const { type, id } = params
  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    const workoutData = {
      "upper-body": {
        "bench-press": {
          name: "Bench Press",
          description:
            "The bench press is a compound exercise that targets the muscles of the upper body. It involves lying on a bench and pressing weight upward using either a barbell or dumbbells. The bench press is one of the three lifts in the sport of powerlifting and is used extensively in weight training, bodybuilding, and other types of training to develop the chest muscles.",
          muscles: ["Chest", "Shoulders", "Triceps"],
          steps: [
            "Lie on a flat bench with your feet flat on the floor.",
            "Grip the barbell with hands slightly wider than shoulder-width apart.",
            "Unrack the barbell and position it over your chest with arms fully extended.",
            "Lower the barbell to your mid-chest.",
            "Press the barbell back to the starting position.",
          ],
          videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
        },
        "shoulder-press": {
          name: "Shoulder Press",
          description:
            "The shoulder press is a strength training exercise targeting the shoulder muscles. It involves pressing weight from the shoulders until the arms are extended overhead.",
          muscles: ["Shoulders", "Triceps", "Upper Chest"],
          steps: [
            "Sit on a bench with back support.",
            "Hold a dumbbell in each hand at shoulder height.",
            "Press the weights upward until your arms are fully extended.",
            "Lower the weights back to shoulder level.",
          ],
          videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
        },
      },
      "lower-body": {
        squats: {
          name: "Squats",
          description:
            "The squat is a compound exercise that primarily targets the muscles of the thighs, hips, buttocks, and quads. It also strengthens the bones, ligaments, and tendons throughout the lower body.",
          muscles: ["Quadriceps", "Hamstrings", "Glutes", "Lower Back"],
          steps: [
            "Stand with feet shoulder-width apart.",
            "Bend your knees and lower your hips as if sitting in a chair.",
            "Keep your chest up and back straight.",
            "Lower until thighs are parallel to the ground (or as low as comfortable).",
            "Push through your heels to return to standing position.",
          ],
          videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
        },
        lunges: {
          name: "Lunges",
          description:
            "Lunges are a lower body exercise that works the quadriceps, hamstrings, glutes, and calves. They also improve balance, coordination, and core stability.",
          muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
          steps: [
            "Stand with feet hip-width apart.",
            "Take a step forward with one leg.",
            "Lower your body until both knees are bent at 90-degree angles.",
            "Push through the front heel to return to starting position.",
            "Repeat with the other leg.",
          ],
          videoUrl: "https://www.youtube.com/embed/QOVaHwm-Q6U",
        },
      },
      cardio: {
        running: {
          name: "Running",
          description:
            "Running is a method of terrestrial locomotion allowing humans to move rapidly on foot. It is a type of gait characterized by an aerial phase in which all feet are above the ground. Running is a popular form of exercise that improves cardiovascular health, builds endurance, and burns calories.",
          benefits: ["Improves cardiovascular health", "Burns calories", "Builds endurance", "Reduces stress"],
          tips: [
            "Start with a warm-up walk.",
            "Maintain good posture with shoulders relaxed.",
            "Land midfoot, not on your heels or toes.",
            "Breathe rhythmically and deeply.",
            "Cool down with a walk after running.",
          ],
          videoUrl: "https://www.youtube.com/embed/brFHyOtTwH4",
        },
        cycling: {
          name: "Cycling",
          description:
            "Cycling is the use of bicycles for transport, recreation, exercise, or sport. It is an effective cardiovascular exercise that strengthens your heart, lungs, and muscles with minimal impact on your joints.",
          benefits: [
            "Low-impact cardiovascular exercise",
            "Builds leg strength",
            "Improves joint mobility",
            "Environmentally friendly transportation",
          ],
          tips: [
            "Adjust your bike to fit your body properly.",
            "Wear a helmet for safety.",
            "Start with shorter rides and gradually increase distance.",
            "Maintain a cadence of 70-90 rpm for efficiency.",
            "Stay hydrated during longer rides.",
          ],
          videoUrl: "https://www.youtube.com/embed/r6xn-Q5oSR0",
        },
      },
      core: {
        planks: {
          name: "Planks",
          description:
            "Running is a method of terrestrial locomotion allowing humans to move rapidly on foot. It is a type of gait characterized by an aerial phase in which all feet are above the ground. Running is a popular form of exercise that improves cardiovascular health, builds endurance, and burns calories.",
          benefits: ["Improves cardiovascular health", "Burns calories", "Builds endurance", "Reduces stress"],
          tips: [
            "Start with a warm-up walk.",
            "Maintain good posture with shoulders relaxed.",
            "Land midfoot, not on your heels or toes.",
            "Breathe rhythmically and deeply.",
            "Cool down with a walk after running.",
          ],
          videoUrl: "https://www.youtube.com/embed/brFHyOtTwH4",
        },
        cycling: {
          name: "Cycling",
          description:
            "Cycling is the use of bicycles for transport, recreation, exercise, or sport. It is an effective cardiovascular exercise that strengthens your heart, lungs, and muscles with minimal impact on your joints.",
          benefits: [
            "Low-impact cardiovascular exercise",
            "Builds leg strength",
            "Improves joint mobility",
            "Environmentally friendly transportation",
          ],
          tips: [
            "Adjust your bike to fit your body properly.",
            "Wear a helmet for safety.",
            "Start with shorter rides and gradually increase distance.",
            "Maintain a cadence of 70-90 rpm for efficiency.",
            "Stay hydrated during longer rides.",
          ],
          videoUrl: "https://www.youtube.com/embed/r6xn-Q5oSR0",
        },
      },
    }

    setTimeout(() => {
      if (workoutData[type] && workoutData[type][id]) {
        setWorkout(workoutData[type][id])
      }
      setLoading(false)
    }, 500)
  }, [type, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/workout" className="flex items-center text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workouts
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-2">Workout Not Found</h2>
            <p className="text-muted-foreground">The workout you're looking for doesn't exist.</p>
            <Button asChild className="mt-4">
              <Link href="/workout">Browse Workouts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/workout" className="flex items-center text-primary mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Workouts
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{workout.name}</CardTitle>
          <CardDescription>
            {workout.muscles ? `Targets: ${workout.muscles.join(", ")}` : ""}
            {workout.benefits ? `Benefits: ${workout.benefits.join(", ")}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p>{workout.description}</p>
          </div>

          {workout.steps && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Steps</h3>
              <ol className="list-decimal pl-5 space-y-1">
                {workout.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {workout.tips && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tips</h3>
              <ul className="list-disc pl-5 space-y-1">
                {workout.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Video Tutorial</h3>
            <div className="aspect-video rounded-md overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={workout.videoUrl}
                title={`${workout.name} tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Add to Today's Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
