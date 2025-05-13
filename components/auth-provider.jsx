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
  }, []);

  // Provide auth context values
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
