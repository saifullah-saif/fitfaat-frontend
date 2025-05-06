"use client"

import { Droplets } from "lucide-react"
import { useEffect, useState } from "react"

export function WaterIntakeWidget() {
  const [percentage, setPercentage] = useState(0)
  const consumed = 1.2
  const total = 2.5
  const calculatedPercentage = Math.round((consumed / total) * 100)

  useEffect(() => {
    // Animate the percentage
    const timer = setTimeout(() => {
      setPercentage(calculatedPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [calculatedPercentage])

  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
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
            className="stroke-current text-blue-500 progress-circle"
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
          <Droplets className="h-5 w-5 text-blue-500" />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">Water Intake</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{consumed.toFixed(1)}</span>
          <span className="mx-1">/</span>
          <span>{total.toFixed(1)} L</span>
        </div>
      </div>
    </div>
  )
}
