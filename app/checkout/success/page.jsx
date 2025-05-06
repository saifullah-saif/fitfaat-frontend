"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
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
        <div className="payment-section">
          <h2 className="font-semibold mb-2">Order #FIT-12345</h2>
          <p className="text-sm text-muted-foreground mb-4">May 2, 2025</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Premium Protein Powder</span>
              <span>$49.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resistance Bands Set (x2)</span>
              <span>$49.98</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>$105.96</span>
              </div>
            </div>
          </div>
        </div>
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
