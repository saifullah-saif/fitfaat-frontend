"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Home,
  Utensils,
  Dumbbell,
  Users,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  Minus,
  Plus,
  Heart,
  Shield,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Diet", href: "/diet", icon: Utensils },
  { name: "Workout", href: "/workout", icon: Dumbbell },
  { name: "Community", href: "/community", icon: Users },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Admin", href: "/admin", icon: Shield },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [theme, setTheme] = useState("dark")
  const [wishlist, setWishlist] = useState([])
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  // Handle hydration mismatch by only rendering client-side
  useEffect(() => {
    setMounted(true)
    // Mock cart data - in a real app, this would come from state management
    setCart([
      {
        id: 1,
        name: "Premium Protein Powder",
        price: 49.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      { id: 2, name: "Resistance Bands Set", price: 24.99, quantity: 2, image: "/placeholder.svg?height=80&width=80" },
    ])

    // Mock wishlist data - in a real app, this would come from state management
    setWishlist([
      {
        id: 3,
        name: "Fitness Tracker Watch",
        price: 129.99,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 6,
        name: "Yoga Mat",
        price: 34.99,
        image: "/placeholder.svg?height=80&width=80",
      },
    ])

    // Check theme
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
  }, [])

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  // Only wait for client-side mounting to avoid hydration issues
  if (!mounted) return null

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src={theme === "dark" ? "/images/fitfaat-logo-yellow.png" : "/images/fitfaat-logo-black.png"}
                  alt="FitFaat Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center">
                <span className="text-xl font-black">Fit </span>
                <span className="text-xl bengali-font">ফাট</span>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <div className="flex-1"></div>
            <nav className="flex items-center justify-center space-x-4 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-2 flex-1 justify-end">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                      <span className="cart-badge">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                    )}
                  </Button>
                  <ThemeToggle />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user?.avatar_url || "/placeholder.svg?height=32&width=32"}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsWishlistOpen(true)} className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                        {wishlist.length > 0 && (
                          <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                            {wishlist.length}
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  {pathname !== "/login" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                  {pathname !== "/signup" && (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/signup">Register</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-background border-t md:hidden">
          <nav className="grid gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Link
              href="/profile"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-5 w-5" />
              Profile
            </Link>
            {isAuthenticated ? (
              <>
                <button
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setIsOpen(false)
                    setIsCartOpen(true)
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart
                  {cart.length > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>
                <button
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground mt-2"
                  onClick={() => {
                    setIsOpen(false)
                    logout()
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Log out
                </button>
              </>
            ) : (
              <>
                {pathname !== "/login" && (
                  <Link
                    href="/login"
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Login
                  </Link>
                )}
                {pathname !== "/signup" && (
                  <Link
                    href="/signup"
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Register
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
            <SheetDescription>
              {cart.length === 0
                ? "Your cart is empty"
                : `${cart.reduce((total, item) => total + item.quantity, 0)} items in your cart`}
            </SheetDescription>
          </SheetHeader>
          {cart.length > 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto py-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary/20">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                        <div className="flex items-center mt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sticky bottom-0 bg-background border-t pt-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-sm font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium" size="lg" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Wishlist Sheet */}
      <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Wishlist</SheetTitle>
            <SheetDescription>
              {wishlist.length === 0 ? "Your wishlist is empty" : `${wishlist.length} items in your wishlist`}
            </SheetDescription>
          </SheetHeader>
          {wishlist.length > 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto py-6">
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary/20">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add to cart functionality
                            const existingItem = cart.find((cartItem) => cartItem.id === item.id)
                            if (existingItem) {
                              setCart(
                                cart.map((cartItem) =>
                                  cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                                ),
                              )
                            } else {
                              setCart([...cart, { ...item, quantity: 1 }])
                            }
                            // Show toast or notification
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Remove from wishlist
                            setWishlist(wishlist.filter((wishItem) => wishItem.id !== item.id))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sticky bottom-0 bg-background border-t pt-4 pb-4">
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // Add all items to cart
                      const newCart = [...cart]
                      wishlist.forEach((item) => {
                        const existingItem = newCart.find((cartItem) => cartItem.id === item.id)
                        if (existingItem) {
                          existingItem.quantity += 1
                        } else {
                          newCart.push({ ...item, quantity: 1 })
                        }
                      })
                      setCart(newCart)
                      setIsWishlistOpen(false)
                      setIsCartOpen(true)
                    }}
                  >
                    Add All to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Clear wishlist
                      setWishlist([])
                    }}
                  >
                    Clear Wishlist
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/marketplace" onClick={() => setIsWishlistOpen(false)}>
                  Browse Products
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
