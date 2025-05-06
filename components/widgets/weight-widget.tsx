"use client"

import { Scale } from "lucide-react"
import { useEffect, useState } from "react"

export function WeightWidget() {
  const [percentage, setPercentage] = useState(0)
  const weight = 75.5
  const change = -0.5
  // For weight, we'll use a different calculation - assuming 85% is the target percentage
  const calculatedPercentage = 85

  useEffect(() => {
    // Animate the percentage
    const timer = setTimeout(() => {
      setPercentage(calculatedPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [calculatedPercentage])

  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
      <div className="relative h-12 w-12 flex-shrink-0">
        <svg className="w-12 h-12" viewBox="0 0 36 36">
          <defs>
            <linearGradient id="weight-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
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
            stroke="url(#weight-gradient)"
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
          <Scale className="h-5 w-5 text-orange-500" />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">Weight</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{weight.toFixed(1)} kg</span>
          <span className="text-green-500 text-xs">
            {change > 0 ? "+" : ""}
            {change.toFixed(1)} kg
          </span>
        </div>
      </div>
    </div>
  )
}
