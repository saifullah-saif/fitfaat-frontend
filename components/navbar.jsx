"use client"

import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import axios from "axios"
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
  Package,
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

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
  withCredentials: true,
});

// Create a cart context
export const CartContext = createContext({
  cart: [],
  setCart: () => {},
  refreshCart: () => {},
  isLoading: false,
  cartTotal: 0,
  orders: [],
  setOrders: () => {},
  wishlist: [],
  removeFromWishlist: () => {},
  refreshWishlist: () => {},
  addToCart: () => {}
});

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

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
  const [orders, setOrders] = useState([])
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Function to fetch user cart
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get("/cart");

      if (response.data && Array.isArray(response.data.items)) {
        setCart(response.data.items);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated, not user

  // Function to fetch user orders
  const fetchUserOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.get("/cart/orders");

      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated, not user

  // Function to fetch user wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.get("/marketplace/wishlist");

      if (response.data && Array.isArray(response.data.items)) {
        setWishlist(response.data.items);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated, not user

  // Calculate cart total whenever cart changes
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // Add a refreshCart function that calls fetchCart
  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  // Add a refreshWishlist function that calls fetchWishlist
  const refreshWishlist = useCallback(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Function to remove item from wishlist
  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`/marketplace/wishlist/remove/${itemId}`);
      fetchWishlist(); // Refresh wishlist after removing item
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
    }
  };

  // Handle hydration mismatch by only rendering client-side
  useEffect(() => {
    setMounted(true)

    // Check theme
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
  }, [])

  // Fetch cart and orders when component mounts or when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchUserOrders();
      fetchWishlist();
    } else {
      setCart([]);
      setOrders([]);
      setWishlist([]);
    }
  }, [isAuthenticated, fetchCart, fetchUserOrders, fetchWishlist]);

  // Add a useEffect to refresh orders after checkout
  useEffect(() => {
    if (isAuthenticated && pathname && pathname.includes('/checkout/success')) {
      // Immediately clear the cart when on the success page
      setCart([]);
      // Also fetch updated orders to show the new order
      fetchUserOrders();
    }
  }, [pathname, isAuthenticated, fetchUserOrders]);

  const removeFromCart = async (id) => {
    try {
      await api.delete(`/cart/remove/${id}`);
      setCart(cart.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  }

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/cart/update/${id}`, { quantity: newQuantity });
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
    } catch (err) {
      console.error("Error updating cart quantity:", err);
    }
  }

  // Function to add item to cart that calls the API
  const addToCart = async (product, qty = 1) => {
    if (!product) return;

    try {
      // Call the API to add the product to the cart
      console.log("Adding to cart:", {
        productId: product.product_id,
        quantity: qty
      });

      const response = await api.post("/cart/add", {
        productId: product.product_id,
        quantity: qty,
      });

      console.log("Add to cart response:", response.data);

      // Update local cart state
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if product already exists in cart
        setCart(cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        ));
      } else {
        // Add new product to cart
        setCart([...cart, { ...product, quantity: qty }]);
      }

      // Refresh the cart to ensure consistency with the server
      fetchCart();

    } catch (err) {
      console.error("Error adding item to cart:", err);
    }
  };

  // Only wait for client-side mounting to avoid hydration issues
  if (!mounted) return null

  // Make sure the context value includes all necessary functions
  const cartContextValue = {
    cart,
    setCart,
    refreshCart,
    isLoading,
    cartTotal,
    orders,
    setOrders,
    wishlist,
    removeFromWishlist,
    refreshWishlist,
    addToCart
  };

  return (
    <CartContext.Provider value={cartContextValue}>
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
                {navItems
                  .filter(item => item.name !== "Admin" || (user && user.role === "Admin"))
                  .map((item) => (
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
                        <DropdownMenuItem onClick={() => setIsOrdersOpen(true)} className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Orders</span>
                          {orders.length > 0 && (
                            <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                              {orders.length}
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
              {navItems
                .filter(item => item.name !== "Admin" || (user && user.role === "Admin"))
                .map((item) => (
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
                      setIsWishlistOpen(true)
                    }}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Wishlist
                    {wishlist.length > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                  <button
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground mt-2"
                    onClick={() => {
                      setIsOpen(false)
                      setIsOrdersOpen(true)
                    }}
                  >
                    <Package className="mr-2 h-5 w-5" />
                    Orders
                    {orders.length > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {orders.length}
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
                            onClick={async () => {
                              // Add to cart functionality and then remove from wishlist
                              try {
                                await addToCart(item);
                                await removeFromWishlist(item.id);
                                window.location.reload();
                              } catch (err) {
                                console.error("Error processing wishlist item:", err);
                              }
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Remove from wishlist
                              removeFromWishlist(item.id);
                              window.location.reload();
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
                      onClick={async () => {
                        // Add all items to cart using API
                        try {
                          // Process items one by one to ensure they're all added
                          await Promise.all(
                            wishlist.map(item => addToCart(item, 1))
                          );

                          // Clear wishlist after adding all items to cart
                          if (wishlist.length > 0) {
                            await Promise.all(wishlist.map(item => removeFromWishlist(item.id)));
                          }

                          // Close wishlist and open cart sheet
                          window.location.reload();
                          setIsWishlistOpen(false);
                          setIsCartOpen(true);
                        } catch (err) {
                          console.error("Error adding all items to cart:", err);
                        }
                      }}
                    >
                      Add All to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Clear wishlist by removing each item
                        if (wishlist.length > 0) {
                          Promise.all(wishlist.map(item => removeFromWishlist(item.id)))
                            .then(() => {
                              console.log("Wishlist cleared successfully");
                            })
                            .catch(err => {
                              console.error("Error clearing wishlist:", err);
                            });
                        }
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

        {/* Orders Sheet */}
        <Sheet open={isOrdersOpen} onOpenChange={setIsOrdersOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Your Orders</SheetTitle>
              <SheetDescription>
                {orders.length === 0 ? "You have no orders yet" : `${orders.length} orders found`}
              </SheetDescription>
            </SheetHeader>

            {isLoading ? (
              <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto py-6">
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Order #{order.id}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "Delivered" ? "bg-green-100 text-green-800" :
                            order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          <div>Date: {order.date}</div>
                          <div>Total: ${order.total.toFixed(2)}</div>
                        </div>
                        <div className="space-y-2">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-md overflow-hidden bg-secondary/20">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No items found for this order</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sticky bottom-0 bg-background border-t pt-4 pb-4">
                  <Button variant="outline" className="w-full" onClick={() => setIsOrdersOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't placed any orders yet</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/marketplace" onClick={() => setIsOrdersOpen(false)}>
                    Browse Products
                  </Link>
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </>
    </CartContext.Provider>
  )
}


