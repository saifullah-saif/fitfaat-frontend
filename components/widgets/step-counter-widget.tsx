"use client"

import { Footprints } from "lucide-react"
import { useEffect, useState } from "react"

export function StepCounterWidget() {
  const [percentage, setPercentage] = useState(0)
  const steps = 6540
  const goal = 10000
  const calculatedPercentage = Math.round((steps / goal) * 100)

  useEffect(() => {
    // Animate the percentage
    const timer = setTimeout(() => {
      setPercentage(calculatedPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [calculatedPercentage])

  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
      <div className="relative h-12 w-12 flex-shrink-0">
        <svg className="w-12 h-12" viewBox="0 0 36 36">
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
            className="stroke-current text-green-500 progress-circle"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Footprints className="h-5 w-5 text-green-500" />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">Steps</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{steps.toLocaleString()}</span>
          <span className="mx-1">/</span>
          <span>{goal.toLocaleString()} steps</span>
        </div>
      </div>
    </div>
  )
}
