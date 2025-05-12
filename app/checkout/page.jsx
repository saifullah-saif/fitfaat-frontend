"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/navbar"

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
  withCredentials: true,
});

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { setCart, refreshCart } = useCart() // Get refreshCart from cart context
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })

  // Fetch cart data when component mounts
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await api.get("/cart");
        
        if (response.data && Array.isArray(response.data.items)) {
          setCartItems(response.data.items);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        toast({
          title: "Error",
          description: "Failed to load your cart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, [isAuthenticated, router, toast]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.first_name + " " + user.last_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Send order data to server
      const response = await api.post("/cart/checkout", {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        paymentMethod: paymentMethod === "card" ? "Credit Card" : "Bkash"
      });

      console.log("Order created:", response.data);
      
      // Store order details in localStorage for the success page
      localStorage.setItem("lastOrder", JSON.stringify({
        orderId: response.data.orderId,
        total: response.data.total,
        items: cartItems
      }));
      
      // Immediately clear the cart state before navigation
      setCart([]);
      
      // Also refresh the cart in the context to sync with server
      await refreshCart();
      
      // Redirect to success page
      router.push("/checkout/success");
    } catch (err) {
      console.error("Error creating order:", err);
      toast({
        title: "Checkout Failed",
        description: err.response?.data?.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container max-w-6xl py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
        <Button asChild>
          <Link href="/marketplace">Go to Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="payment-section">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="payment-form-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="payment-form-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="payment-form-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="payment-form-input"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="payment-form-input"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="payment-form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="payment-section">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card">Credit Card</TabsTrigger>
                    <TabsTrigger value="bkash">Bkash</TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="pt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            required={paymentMethod === "card"}
                            className="payment-form-input pl-10"
                          />
                          
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cardExpiry">Expiry Date</Label>
                          <Input
                            id="cardExpiry"
                            name="cardExpiry"
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            required={paymentMethod === "card"}
                            className="payment-form-input"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cardCvc">CVC</Label>
                          <Input
                            id="cardCvc"
                            name="cardCvc"
                            placeholder="123"
                            value={formData.cardCvc}
                            onChange={handleInputChange}
                            required={paymentMethod === "card"}
                            className="payment-form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="bkash" className="pt-4">
                    <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                      <p className="text-center text-muted-foreground mb-4">
                        You will be redirected to Bkash to complete your payment.
                      </p>
                      <img src="/placeholder.svg?height=40&width=150&text=Bkash" alt="Bkash" className="h-10" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href="/marketplace">Return to Shopping</Link>
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Complete Order"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="sticky top-20 payment-section">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary/20">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
