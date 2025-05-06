"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

export function AnimatedBackground() {
  const canvasRef = useRef(null)
  const { theme } = useTheme()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const animationFrameRef = useRef(null)

  // Initialize particles
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Create particles
    const particlesArray = []
    const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight * 0.0001), 100)

    for (let i = 0; i < particleCount; i++) {
      particlesArray.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    setParticles(particlesArray)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Handle mouse movement for parallax effect
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0 || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      particles.forEach((particle, index) => {
        const updatedParticle = { ...particle }

        // Apply parallax effect based on mouse position
        const parallaxX = (mousePosition.x / dimensions.width - 0.5) * 2
        const parallaxY = (mousePosition.y / dimensions.height - 0.5) * 2

        updatedParticle.x += updatedParticle.speedX + parallaxX * 0.5
        updatedParticle.y += updatedParticle.speedY + parallaxY * 0.5

        // Wrap around edges
        if (updatedParticle.x < 0) updatedParticle.x = dimensions.width
        if (updatedParticle.x > dimensions.width) updatedParticle.x = 0
        if (updatedParticle.y < 0) updatedParticle.y = dimensions.height
        if (updatedParticle.y > dimensions.height) updatedParticle.y = 0

        // Draw particle
        const isDark = theme === "dark"
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${updatedParticle.opacity})`
          : `rgba(0, 0, 0, ${updatedParticle.opacity})`

        ctx.beginPath()
        ctx.arc(updatedParticle.x, updatedParticle.y, updatedParticle.size, 0, Math.PI * 2)
        ctx.fill()

        particles[index] = updatedParticle
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [particles, dimensions, mousePosition, theme])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" style={{ opacity: 0.7 }} />
}
