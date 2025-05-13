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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        // For development, use the mock user instead of making API calls
        // Comment this out when your backend is ready
        setUser({
          id: "mock-user-id",
          email: "demo@example.com",
          name: "Demo User",
          avatar_url: null,
        });
        setIsAuthenticated(true);
        setLoading(false);
        return;

        // Uncomment this when your backend is ready
        /*
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        */
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [])

  useEffect(() => {
    // If user is logged in and we're on a page that requires authentication
    if (!loading && user) {
      // Check if we should redirect to onboarding
      const shouldRedirectToOnboarding = localStorage.getItem("redirect_to_onboarding");

      // If we're not already on the onboarding page and need to redirect
      if (shouldRedirectToOnboarding === "true" && pathname !== "/onboarding") {
        // Don't remove the flag here - we'll keep it until onboarding is completed
        router.push("/onboarding");
      }

      // If we're on the login page and already authenticated, redirect to appropriate page
      if (pathname === "/login") {
        if (shouldRedirectToOnboarding === "true") {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    }

    // If user is not logged in and trying to access a protected page
    if (
      !loading &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/signup" &&
      pathname !== "/" && // Allow access to home page without auth
      pathname !== "/marketplace" && // Allow access to marketplace without auth
      !pathname.includes("/auth")
    ) {
      router.push("/login");
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

        // Check if user needs onboarding based on server response
        const needsOnboarding = data.user.needsOnboarding;

        // Set a flag to redirect to onboarding after login
        localStorage.setItem("redirect_to_onboarding", needsOnboarding ? "true" : "false");

        // Directly redirect to onboarding page
        router.push("/onboarding");

        return { success: true, redirectToOnboarding: true };
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

        // Set a flag to redirect to onboarding after login
        localStorage.setItem("redirect_to_onboarding", "true");

        // Directly redirect to onboarding page
        router.push("/onboarding");

        return { success: true, redirectToOnboarding: true };
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

      // Don't store user data in localStorage after signup
      // Instead, redirect to login page
      if (data && data.user) {
        // Clear any existing user data to ensure they log in fresh
        setUser(null);
        localStorage.removeItem("fitfaat_user");

        // Redirect to login page instead of onboarding
        router.push("/login");
        return { success: true, message: "Account created successfully! Please log in." };
      } else {
        return { success: false, error: "Invalid response from server" };
      }
    } catch (error) {
      console.error("Signup error:", error.message);

      // For development/demo purposes, fallback to redirect to login if server is not available
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: redirecting to login after signup");

        // Clear any existing user data
        setUser(null);
        localStorage.removeItem("fitfaat_user");

        // Redirect to login page
        router.push("/login");
        return { success: true, message: "Account created successfully! Please log in." };
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
    loading,
    isAuthenticated,
    login: async (email, password) => {
      // Mock login for development
      setUser({
        id: "mock-user-id",
        email: email || "demo@example.com",
        name: "Demo User",
        avatar_url: null,
      });
      setIsAuthenticated(true);
      return true;
    },
    logout: () => {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
