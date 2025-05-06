"use client"

import { useEffect } from "react"

export default function Document({ children }) {
  // Fix for mobile menu scrolling
  useEffect(() => {
    const handleMenuToggle = (e) => {
      if (e.target.closest("button")?.getAttribute("aria-label") === "Toggle menu") {
        document.body.classList.toggle("mobile-menu-open")
      }
    }

    document.addEventListener("click", handleMenuToggle)
    return () => {
      document.removeEventListener("click", handleMenuToggle)
    }
  }, [])

  return <>{children}</>
}
