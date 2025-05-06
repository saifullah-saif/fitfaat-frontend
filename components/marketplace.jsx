"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Search, ShoppingCart, Plus, Minus, Heart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: 1,
    name: "Premium Protein Powder",
    category: "Supplements",
    price: 49.99,
    rating: 4.8,
    reviews: [
      {
        id: 1,
        user: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-10-15",
        comment: "Great taste and mixes well. I've seen significant improvements in my recovery time.",
      },
      {
        id: 2,
        user: "Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2023-09-22",
        comment: "Good product but a bit expensive. The chocolate flavor is delicious though!",
      },
    ],
    reviewCount: 124,
    image: "/placeholder.svg?height=200&width=200",
    description: "High-quality whey protein with 25g protein per serving. Chocolate flavor.",
    details: {
      servingSize: "30g scoop",
      servingsPerContainer: 30,
      protein: "25g per serving",
      calories: "120 per serving",
      flavors: ["Chocolate", "Vanilla", "Strawberry"],
      ingredients: "Whey Protein Isolate, Cocoa Powder, Natural and Artificial Flavors, Lecithin, Sucralose",
    },
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
  },
  {
    id: 2,
    name: "Adjustable Dumbbells Set",
    category: "Equipment",
    price: 299.99,
    rating: 4.7,
    reviews: [
      {
        id: 1,
        user: "Mike Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-11-05",
        comment: "These dumbbells are amazing! They save so much space in my home gym.",
      },
      {
        id: 2,
        user: "Emma Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2023-10-18",
        comment: "Great quality but the weight adjustment mechanism can be a bit finicky sometimes.",
      },
    ],
    reviewCount: 89,
    image: "/placeholder.svg?height=200&width=200",
    description: "5-50 lbs adjustable dumbbells. Space-saving design for home gyms.",
    details: {
      weightRange: "5-50 lbs (2.3-22.7 kg) per dumbbell",
      adjustmentIncrement: "5 lbs (2.3 kg)",
      dimensions: '16.9" x 8.3" x 9.5" (L x W x H)',
      material: "Steel, Nylon, Rubber",
      warranty: "2 years",
    },
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
  },
  {
    id: 3,
    name: "Fitness Tracker Watch",
    category: "Wearables",
    price: 129.99,
    rating: 4.5,
    reviews: [
      {
        id: 1,
        user: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-11-10",
        comment: "The battery life is incredible! I only need to charge it once a week.",
      },
      {
        id: 2,
        user: "Olivia Taylor",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2023-10-25",
        comment: "Great fitness tracker but the sleep tracking could be more accurate.",
      },
    ],
    reviewCount: 210,
    image: "/placeholder.svg?height=200&width=200",
    description: "Track steps, heart rate, sleep, and workouts. Water-resistant.",
    details: {
      display: '1.4" AMOLED Touch Screen',
      battery: "Up to 7 days",
      waterResistance: "5 ATM",
      sensors: "Heart rate, accelerometer, gyroscope, SpO2",
      connectivity: "Bluetooth 5.0, GPS",
      compatibility: "iOS 12.0+, Android 7.0+",
    },
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
  },
  {
    id: 4,
    name: "Resistance Bands Set",
    category: "Equipment",
    price: 24.99,
    rating: 4.6,
    reviews: [
      {
        id: 1,
        user: "James Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-09-15",
        comment: "Great quality bands that don't snap like cheaper ones I've tried before.",
      },
      {
        id: 2,
        user: "Sophia Martinez",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2023-08-22",
        comment: "Good variety of resistance levels. The carrying bag is a nice touch.",
      },
    ],
    reviewCount: 156,
    image: "/placeholder.svg?height=200&width=200",
    description: "Set of 5 resistance bands with different resistance levels.",
    details: {
      resistanceLevels: "10, 15, 20, 25, 30 lbs",
      material: "Natural latex",
      includes: "5 bands, carrying bag, exercise guide",
      length: "48 inches each",
    },
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
  },
  {
    id: 5,
    name: "Pre-Workout Energy Drink",
    category: "Supplements",
    price: 39.99,
    rating: 4.4,
    reviews: [
      {
        id: 1,
        user: "Ryan Thompson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-10-30",
        comment: "Gives me incredible energy without the crash. Blue raspberry flavor is amazing!",
      },
      {
        id: 2,
        user: "Natalie Garcia",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2023-10-05",
        comment: "Good energy boost but a bit too sweet for my taste.",
      },
    ],
    reviewCount: 78,
    image: "/placeholder.svg?height=200&width=200",
    description: "Energy-boosting pre-workout formula with caffeine and B-vitamins.",
    details: {
      servingSize: "1 scoop (7g)",
      servingsPerContainer: 30,
      caffeine: "200mg per serving",
      flavors: ["Blue Raspberry", "Fruit Punch", "Watermelon"],
      ingredients: "Caffeine Anhydrous, Beta-Alanine, Creatine Monohydrate, L-Citrulline, B-Vitamins",
    },
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
  },
  {
    id: 6,
    name: "Yoga Mat",
    category: "Equipment",
    price: 34.99,
    rating: 4.9,
    reviews: [
      {
        id: 1,
        user: "Emily Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-11-15",
        comment: "Perfect thickness and grip. Makes my yoga practice so much more comfortable.",
      },
      {
        id: 2,
        user: "Michael Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2023-10-20",
        comment: "High quality mat that doesn't slip. Worth every penny!",
      },
    ],
    reviewCount: 112,
    image: "/placeholder.svg?height=200&width=200",
    description: "Non-slip, eco-friendly yoga mat with perfect cushioning.",
    details: {
      thickness: "6mm",
      material: "TPE Eco-friendly foam",
      dimensions: '72" x 24" (183cm x 61cm)',
      weight: "2.5 lbs (1.1 kg)",
      colors: ["Purple", "Blue", "Black", "Green"],
    },
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
  },
]

const categories = [
  { id: "all", name: "All Products" },
  { id: "supplements", name: "Supplements" },
  { id: "equipment", name: "Equipment" },
  { id: "wearables", name: "Wearables" },
  { id: "clothing", name: "Clothing" },
]

export function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleCloseDialog = () => {
    setSelectedProduct(null)
  }

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddReview = () => {
    if (!selectedProduct || !newReview.comment) return

    // Create a new review object
    const review = {
      id: Date.now(), // Simple unique ID
      user: "Current User", // In a real app, this would be the logged-in user
      avatar: "/placeholder.svg?height=40&width=40",
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
      comment: newReview.comment,
    }

    // Update the product with the new review
    const updatedProduct = {
      ...selectedProduct,
      reviews: [review, ...selectedProduct.reviews],
      reviewCount: selectedProduct.reviewCount + 1,
      // Recalculate average rating
      rating:
        (selectedProduct.rating * selectedProduct.reviewCount + review.rating) / (selectedProduct.reviewCount + 1),
    }

    // Update the product in the products array
    const updatedProducts = products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))

    // In a real app, this would send the review to the database
    // For now, we'll just update the local state
    setSelectedProduct(updatedProduct)

    // Reset the review form
    setReviewDialogOpen(false)
    setNewReview({ rating: 5, comment: "" })

    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    })
  }

  const addToCart = (product, qty = 1) => {
    if (!product) return

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      // Update quantity if product already exists in cart
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + qty } : item)))
    } else {
      // Add new product to cart
      setCart([...cart, { ...product, quantity: qty }])
    }

    // Optional: Log the cart for debugging
    console.log("Cart updated:", [...cart, { ...product, quantity: qty }])

    if (selectedProduct) {
      // Close the product dialog after adding to cart
      setTimeout(() => setSelectedProduct(null), 500)
    }
  }

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some((item) => item.id === product.id)

    if (isInWishlist) {
      setWishlist(wishlist.filter((item) => item.id !== product.id))
      toast({
        title: "Removed from wishlist",
        description: `${product.name} removed from your wishlist`,
      })
    } else {
      setWishlist([...wishlist, product])
      toast({
        title: "Added to wishlist",
        description: `${product.name} added to your wishlist`,
      })
    }
  }

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? "text-primary fill-primary" : "text-gray-300"}`} />
      ))
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">Browse and purchase fitness products and supplements.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="featured">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="product-card max-w-none w-full">
            <div className="aspect-square relative">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full"
                onClick={() => handleProductClick(product)}
              />
              <Badge className="absolute top-2 right-2">{product.category}</Badge>
              <Button
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(product)
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="absolute bottom-2 left-2 h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleWishlist(product)
                }}
              >
                <Heart
                  className={`h-4 w-4 ${wishlist.some((item) => item.id === product.id) ? "fill-primary text-primary" : ""}`}
                />
              </Button>
            </div>
            <div className="p-4">
              <h3
                className="font-medium text-base line-clamp-1 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-xs text-muted-foreground">{product.rating}</span>
                </div>
                <span className="font-medium">${product.price.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={handleCloseDialog}>
        {selectedProduct && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>{selectedProduct.category}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-md">
                  <img
                    src={selectedProduct.images[0] || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-md">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Details</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    {Object.entries(selectedProduct.details).map(([key, value]) => (
                      <li key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                        <span className="font-medium">{Array.isArray(value) ? value.join(", ") : value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedProduct.rating)}</div>
                      <span className="text-sm font-medium">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{selectedProduct.reviewCount} reviews</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">${selectedProduct.price.toFixed(2)}</span>
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button variant="ghost" size="icon" onClick={incrementQuantity}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 relative"
                      onClick={() => {
                        // Add the product to the cart
                        addToCart(selectedProduct, quantity)

                        // Show visual feedback
                        toast({
                          title: "Added to cart",
                          description: `${quantity} × ${selectedProduct.name} added to your cart`,
                          action: (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <a href="/checkout">View Cart</a>
                              </Button>
                            </div>
                          ),
                        })
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleWishlist(selectedProduct)}
                      className={wishlist.some((item) => item.id === selectedProduct.id) ? "bg-primary/10" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 ${wishlist.some((item) => item.id === selectedProduct.id) ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Reviews</h3>
                <Button size="sm" onClick={() => setReviewDialogOpen(true)}>
                  Add Review
                </Button>
              </div>
              <div className="space-y-4">
                {selectedProduct.reviews.map((review) => (
                  <div key={review.id} className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.user} />
                          <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{review.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
            <DialogDescription>Share your experience with this product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  >
                    <Star
                      className={`h-6 w-6 ${star <= newReview.rating ? "text-primary fill-primary" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Your Review
              </label>
              <Textarea
                id="comment"
                placeholder="Write your review here..."
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
