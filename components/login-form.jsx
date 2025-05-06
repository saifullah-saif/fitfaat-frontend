"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, authError } = useAuth()
  const [theme, setTheme] = useState("dark")

  // Show auth initialization errors
  useEffect(() => {
    if (authError) {
      setError(`Authentication system error: ${authError}. Using demo mode.`)
    }

    // Check theme
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
  }, [authError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || "Failed to login")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // For development, provide a demo login option
  const handleDemoLogin = async () => {
    setEmail("demo@example.com")
    setPassword("password123")
    setIsLoading(true)

    try {
      const result = await login("demo@example.com", "password123")
      if (!result.success) {
        // If regular login fails, we'll use the mock user in development
        console.log("Using demo mode")
      }
    } catch (err) {
      console.error("Demo login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-16">
              <Image
                src={theme === "dark" ? "/images/fitfaat-logo-yellow.png" : "/images/fitfaat-logo-black.png"}
                alt="FitFaat Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl font-black">Fit </span>
            <span className="text-3xl bengali-font">ফাট</span>
          </div>
          <CardDescription className="text-lg">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {process.env.NODE_ENV === "development" && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Demo Login
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
