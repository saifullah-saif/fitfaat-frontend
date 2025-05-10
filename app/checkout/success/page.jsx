"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/components/navbar"

export default function CheckoutSuccessPage() {
  const [orderDetails, setOrderDetails] = useState(null)
  const { refreshCart, setCart} = useCart()
  const [hasRefreshed, setHasRefreshed] = useState(false)

  useEffect(() => {
    if (hasRefreshed) return; // Only run once
    
    // Try to get order details from localStorage
    const lastOrder = localStorage.getItem("lastOrder")
    if (lastOrder) {
      try {
        setOrderDetails(JSON.parse(lastOrder))
      } catch (error) { 
        console.error("Error parsing order details:", error)
      }
    }
    
    // Immediately clear the cart state
    setCart([]);
    
    // Refresh cart to ensure it's empty after checkout
    refreshCart();
    
  
    
    setHasRefreshed(true);
  }, [refreshCart, setCart, hasRefreshed])

  return (
    <div className="container max-w-md py-16">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="rounded-full bg-primary/10 p-4">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. We've sent a confirmation email with your order details.
        </p>
        
        {orderDetails && orderDetails.orderId && (
          <div className="payment-section">
            <h2 className="font-semibold mb-2">Order #{orderDetails.orderId}</h2>
          </div>
        )}
        
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/marketplace">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}



