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
    const fetchExerciseData = async () => {
      try {
        setLoading(true)

        // Import axios dynamically to avoid server-side rendering issues
        const axios = (await import('axios')).default

        // Create axios instance with common configuration
        const api = axios.create({
          baseURL: '/api',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        // Fetch the specific exercise by ID
        const response = await api.get(`/exercises/fetch_exercise/${id}`)

        const exerciseData = response.data
        console.log('Exercise data:', exerciseData)

        // Transform the data to match the expected format
        const processedWorkout = {
          name: exerciseData.name,
          description: exerciseData.description,
          muscles: exerciseData.muscle_group ? exerciseData.muscle_group.split(', ') : [],
          difficulty: exerciseData.difficulty_level,
          equipment: exerciseData.equipment_needed,
          videoUrl: exerciseData.video_tutorial_url,
          // Create some generic steps based on the exercise type
          steps: [
            "Prepare the proper equipment: " + (exerciseData.equipment_needed || "None required"),
            "Ensure proper form and posture",
            "Perform the exercise with controlled movements",
            "Focus on the target muscles: " + (exerciseData.muscle_group || "Full body"),
            "Maintain proper breathing throughout the exercise"
          ]
        }

        setWorkout(processedWorkout)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching exercise data:', error)
        // Get more detailed error information from axios error
        const errorMessage = error.response
          ? `Error ${error.response.status}: ${error.response.data.error || error.message}`
          : error.message
        console.error(errorMessage)
        setLoading(false)
      }
    }

    fetchExerciseData()
  }, [id])

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
          {workout.difficulty && (
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Difficulty:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                workout.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                workout.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {workout.difficulty}
              </span>
            </div>
          )}

          {workout.equipment && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Equipment Needed</h3>
              <p>{workout.equipment}</p>
            </div>
          )}

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
