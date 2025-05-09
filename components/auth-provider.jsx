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
    const checkAuthStatus = async () => {
      try {
        // First check if user is stored in localStorage
        const storedUser = localStorage.getItem("fitfaat_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Then verify with the server if the JWT token is valid
        const response = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            // Update user data with the latest from server
            setUser(data.user);
            localStorage.setItem("fitfaat_user", JSON.stringify(data.user));
          }
        } else {
          // If token is invalid, clear user data
          localStorage.removeItem("fitfaat_user");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Don't clear user data on network errors to allow offline usage
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [])

  useEffect(() => {
    if (
      !loading &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/signup" &&
      pathname !== "/" && // Allow access to home page without auth
      pathname !== "/marketplace" && // Allow access to marketplace without auth
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

      // Call the server login endpoint
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Login failed" };
      }

      const data = await response.json();

      // Store user data in localStorage
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("fitfaat_user", JSON.stringify(data.user));
        router.push("/dashboard");
        return { success: true };
      } else {
        return { success: false, error: "Invalid response from server" };
      }
    } catch (error) {
      console.error("Login error:", error.message);

      // For development/demo purposes, fallback to mock user if server is not available
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock user for development");
        setUser(mockUser);
        localStorage.setItem("fitfaat_user", JSON.stringify(mockUser));
        router.push("/dashboard");
        return { success: true };
      }

      return { success: false, error: error.message };
    }
  }

  const signup = async (username, email, password, userData) => {
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

      // Call the server signup endpoint
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          date_of_birth: userData.date_of_birth || "",
          gender: userData.gender || "Male",
          location: userData.location || "",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Signup failed" };
      }

      const data = await response.json();

      // Store user data in localStorage
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("fitfaat_user", JSON.stringify(data.user));

        // Redirect to onboarding page instead of dashboard
        router.push("/onboarding");
        return { success: true, message: "Account created successfully!" };
      } else {
        return { success: false, error: "Invalid response from server" };
      }
    } catch (error) {
      console.error("Signup error:", error.message);

      // For development/demo purposes, fallback to mock user if server is not available
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock user for development");
        const newUser = {
          ...mockUser,
          email: email,
          name: userData.first_name || "New User",
        };

        setUser(newUser);
        localStorage.setItem("fitfaat_user", JSON.stringify(newUser));
        router.push("/onboarding");
        return { success: true, message: "Account created successfully!" };
      }

      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  }

  const logout = async () => {
    try {
      // Call the server logout endpoint to clear the JWT cookie
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local user data
      setUser(null)
      localStorage.removeItem("fitfaat_user")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Even if the server call fails, clear local data
      setUser(null)
      localStorage.removeItem("fitfaat_user")
      router.push("/")
    }
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
