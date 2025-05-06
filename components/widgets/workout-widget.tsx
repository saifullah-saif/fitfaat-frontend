"use client"

import { Dumbbell } from "lucide-react"
import { useEffect, useState } from "react"

export function WorkoutWidget() {
  const [percentage, setPercentage] = useState(0)
  const completed = 2
  const total = 3
  const calculatedPercentage = Math.round((completed / total) * 100)

  useEffect(() => {
    // Animate the percentage
    const timer = setTimeout(() => {
      setPercentage(calculatedPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [calculatedPercentage])

  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
      <div className="relative h-12 w-12 flex-shrink-0">
        <svg className="w-12 h-12" viewBox="0 0 36 36">
          <defs>
            <linearGradient id="workout-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path
            className="stroke-current text-secondary"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            stroke="url(#workout-gradient)"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="progress-circle"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Dumbbell className="h-5 w-5 text-purple-500" />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">Workout</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{completed}</span>
          <span className="mx-1">/</span>
          <span>{total} exercises</span>
        </div>
      </div>
    </div>
  )
}
