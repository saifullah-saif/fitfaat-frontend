"use client"

import { useEffect, useState } from "react"

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color = "hsl(var(--primary))",
  trailColor = "hsl(var(--secondary))",
  showValue = true,
  valueSize = 24,
  label,
  labelSize = 14,
  labelColor = "hsl(var(--muted-foreground))",
  animate = true,
  duration = 1000,
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setProgress(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setProgress(value)
    }
  }, [value, animate])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trailColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="progress-circle"
          style={{
            transition: animate ? `stroke-dashoffset ${duration}ms ease-in-out` : "none",
          }}
        />
      </svg>
      {showValue && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <span className="font-bold" style={{ fontSize: valueSize }}>
            {Math.round(progress)}%
          </span>
          {label && (
            <span style={{ fontSize: labelSize, color: labelColor }} className="mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function MultiColorCircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  colors = ["hsl(var(--chart-blue))", "hsl(var(--chart-pink))"],
  trailColor = "hsl(var(--secondary))",
  showValue = true,
  valueSize = 24,
  label,
  labelSize = 14,
  labelColor = "hsl(var(--muted-foreground))",
  animate = true,
  duration = 1000,
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setProgress(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setProgress(value)
    }
  }, [value, animate])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Create gradient ID
  const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((color, index) => (
              <stop key={index} offset={`${(index / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trailColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="progress-circle"
          style={{
            transition: animate ? `stroke-dashoffset ${duration}ms ease-in-out` : "none",
          }}
        />
      </svg>
      {showValue && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <span className="font-bold" style={{ fontSize: valueSize }}>
            {Math.round(progress)}%
          </span>
          {label && (
            <span style={{ fontSize: labelSize, color: labelColor }} className="mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
