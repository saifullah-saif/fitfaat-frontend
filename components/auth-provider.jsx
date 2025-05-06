"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Create a mock user
  const mockUser = {
    id: "mock-user-id",
    email: "demo@example.com",
    name: "Demo User",
    avatar_url: null,
  }

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("fitfaat_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (
      !loading &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/signup" &&
      pathname !== "/" && // Allow access to home page without auth
      !pathname.includes("/auth")
    ) {
      router.push("/login")
    }
  }, [user, loading, pathname, router])

  const login = async (email, password) => {
    try {
      // Simple validation
      if (email.trim() === "" || password.trim() === "") {
        return { success: false, error: "Email and password are required" }
      }

      // In a real app, this would validate against a backend
      // For demo purposes, accept any credentials
      setUser(mockUser)
      localStorage.setItem("fitfaat_user", JSON.stringify(mockUser))
      router.push("/")
      return { success: true }
    } catch (error) {
      console.error("Login error:", error.message)
      return { success: false, error: error.message }
    }
  }

  const signup = async (email, password, userData) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { success: false, error: "Please enter a valid email address" }
      }

      // Validate password
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long" }
      }

      // Create a new user with the provided data
      const newUser = {
        ...mockUser,
        email: email,
        name: userData.name || "New User",
      }

      setUser(newUser)
      localStorage.setItem("fitfaat_user", JSON.stringify(newUser))

      // Redirect to onboarding page instead of dashboard
      router.push("/onboarding")

      return { success: true, message: "Account created successfully!" }
    } catch (error) {
      console.error("Signup error:", error.message)
      return { success: false, error: error.message || "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem("fitfaat_user")
    router.push("/")
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
