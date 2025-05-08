"use client"
import axios from "axios"
import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [theme, setTheme] = useState("dark")

  const router = useRouter()

  // Check theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    // Basic validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      await axios.post(
        "http://localhost:5000/auth/signup",
        {
          username,
          email,
          password,
          first_name,
          last_name,
          date_of_birth,
          gender,
          location
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setSuccessMessage("Account created successfully!");
      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardDescription className="text-lg">Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
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
              <p className="text-xs text-muted-foreground">Use a valid email address. You'll need to verify it.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                type="text"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                type="text"
                placeholder="Last Name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date of Birth</Label>
              <Input
                id="date"
                type="date"
                value={date_of_birth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Select Gender</Label>
              <select
                id="gender"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Dhaka"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
