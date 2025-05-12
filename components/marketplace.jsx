"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
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
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/navbar";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
  withCredentials: true,
});

// Initial empty products array
const categories = [
  { id: "all", name: "All Products" },
  { id: "supplements", name: "Supplements" },
  { id: "equipment", name: "Equipment" },
  { id: "wearables", name: "Wearables" },
  { id: "clothing", name: "Clothing" },
]

export function Marketplace() {
  const { user } = useAuth();
  const { refreshWishlist: refreshNavbarWishlist } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOption, setSortOption] = useState("featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5 })
  const [cart, setCart] = useState([]) // Initialize cart state but don't display it in the UI
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([
    { category_id: "all", name: "All Products" }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wishlist, setWishlist] = useState([])

  // Fetch wishlist items from the server
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    try {
      const response = await api.get("/marketplace/wishlist");

      if (response.data && Array.isArray(response.data.items)) {
        console.log("Wishlist items from server:", response.data.items);
        setWishlist(response.data.items);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setWishlist([]);
    }
  }, [user]);

  // Remove item from wishlist
  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`/marketplace/wishlist/remove/${itemId}`);
      // Update local wishlist state - use the correct property name (id) for filtering
      setWishlist(wishlist.filter(item => item.id !== itemId));
      // Also refresh the navbar wishlist
      if (refreshNavbarWishlist) refreshNavbarWishlist();
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
    }
  };

  // Function to add item to wishlist using the API
  const addToWishlist = async (productId) => {
    try {
      await api.post("/marketplace/wishlist/add", { productId });
      // Refresh local wishlist
      fetchWishlist();
      // Also refresh the navbar wishlist
      if (refreshNavbarWishlist) refreshNavbarWishlist();
    } catch (err) {
      console.error("Error adding item to wishlist:", err);
    }
  };

  // Fetch wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/marketplace/api/categories");
        console.log("Categories response:", response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Add "All Products" as the first option
          setCategories([
            { category_id: "all", name: "All Products" },
            ...response.data
          ]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Keep the default "All Products" category if there's an error
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on selected category and sort option
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log(`Fetching products for category: ${selectedCategory}, sort: ${sortOption}`);

        // Use the new sort endpoint with category as a query parameter
        const response = await api.get(`/marketplace/api/products/sort/${sortOption}?category=${selectedCategory}`);

        if (!Array.isArray(response.data)) {
          console.error("Invalid response format:", response.data);
          throw new Error("Invalid response format");
        }

        console.log(`Fetched ${response.data.length} products`);

        const formattedProducts = response.data.map(product => ({
          id: product.product_id,
          name: product.name,
          description: product.description,
          category: product.category_id.toString(),
          price: parseFloat(product.price) || 0,
          sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
          stock: product.stock_quantity,
          sku: product.sku,
          image: product.image_url,
          images: product.image_url ? [product.image_url] : [],
          rating: parseFloat(product.rating) || 0,
          reviewCount: parseInt(product.rating_count) || 0,
          reviews: [],
          details: {
            sku: product.sku,
            stock: product.stock_quantity
          }
        }));

        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortOption]);

  // Update the category filter handler
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Clear search when changing category
  };

  // Add sort option handler
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    const timeoutId = setTimeout(async () => {
      if (!query.trim()) {
        // If search is empty, fetch all products with ratings
        try {
          setLoading(true);
          console.log("Fetching all products with ratings (from search)");

          // Use the sort endpoint which includes ratings
          const response = await api.get("/marketplace/api/products/sort/featured");

          if (!Array.isArray(response.data)) {
            console.error("Invalid response format:", response.data);
            throw new Error("Invalid response format");
          }

          console.log(`Fetched ${response.data.length} products`);

          const formattedProducts = response.data.map(product => ({
            id: product.product_id,
            name: product.name,
            description: product.description,
            category: product.category_id.toString(),
            price: parseFloat(product.price) || 0,
            sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
            stock: product.stock_quantity,
            sku: product.sku,
            image: product.image_url,
            images: product.image_url ? [product.image_url] : [],
            rating: parseFloat(product.rating) || 0,
            reviewCount: parseInt(product.rating_count) || 0,
            reviews: [],
            details: {
              sku: product.sku,
              stock: product.stock_quantity
            }
          }));

          setProducts(formattedProducts);
          setError(null);
        } catch (err) {
          console.error("Error fetching products:", err);

          if (err.response) {
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
            setError(`Fetch error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
          } else if (err.request) {
            console.error("Request made but no response received");
            setError("No response from server. Please check your connection.");
          } else {
            console.error("Error message:", err.message);
            setError(`Error: ${err.message}`);
          }
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        console.log(`Searching for products with query: "${query}"`);

        const response = await api.get(`/marketplace/api/products/search?q=${encodeURIComponent(query)}`);

        if (!Array.isArray(response.data)) {
          console.error("Invalid response format:", response.data);
          throw new Error("Invalid response format");
        }

        console.log(`Found ${response.data.length} products matching "${query}"`);

        // After getting search results, fetch ratings for each product
        // This is a workaround since the search endpoint doesn't include ratings
        const productIds = response.data.map(product => product.product_id);

        // Create a map to store ratings for each product
        const ratingsMap = {};

        // If we have products, fetch their ratings
        if (productIds.length > 0) {
          try {
            // We'll use the individual product endpoint to get ratings for each product
            // This could be optimized with a batch endpoint in the future
            const ratingPromises = productIds.map(id =>
              api.get(`/marketplace/api/products/${id}`)
                .then(res => {
                  ratingsMap[id] = {
                    rating: parseFloat(res.data.rating) || 0,
                    rating_count: parseInt(res.data.rating_count) || 0
                  };
                })
                .catch(err => {
                  console.error(`Error fetching ratings for product ${id}:`, err);
                  // If we fail to get ratings, use defaults
                  ratingsMap[id] = { rating: 0, rating_count: 0 };
                })
            );

            // Wait for all rating requests to complete
            await Promise.all(ratingPromises);
          } catch (err) {
            console.error("Error fetching product ratings:", err);
          }
        }

        const formattedProducts = response.data.map(product => {
          const productRatings = ratingsMap[product.product_id] || { rating: 0, rating_count: 0 };

          return {
            id: product.product_id,
            name: product.name,
            description: product.description,
            category: product.category_id.toString(),
            price: parseFloat(product.price) || 0,
            sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
            stock: product.stock_quantity,
            sku: product.sku,
            image: product.image_url,
            images: product.image_url ? [product.image_url] : [],
            rating: productRatings.rating,
            reviewCount: productRatings.rating_count,
            reviews: [],
            details: {
              sku: product.sku,
              stock: product.stock_quantity
            }
          };
        });

        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error("Error searching products:", err);

        // More detailed error logging
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
          setError(`Search error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          console.error("Request made but no response received");
          setError("No response from server. Please check your connection.");
        } else {
          console.error("Error message:", err.message);
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, []);

  // Update search handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Check server availability and fetch products
  useEffect(() => {
    const checkServerAndFetchProducts = async () => {
      try {
        // First check if the server is available
        await api.get('/marketplace/test');
        console.log('Server is available');

        // Then fetch products directly with ratings using the sort endpoint
        setLoading(true);
        console.log("Fetching all products with ratings (initial load)");

        // Use the sort endpoint which includes ratings
        const response = await api.get("/marketplace/api/products/sort/featured");

        if (!Array.isArray(response.data)) {
          console.error("Invalid response format:", response.data);
          throw new Error("Invalid response format");
        }

        console.log(`Fetched ${response.data.length} products`);

        const formattedProducts = response.data.map(product => ({
          id: product.product_id,
          name: product.name,
          description: product.description,
          category: product.category_id.toString(),
          price: parseFloat(product.price) || 0,
          sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
          stock: product.stock_quantity,
          sku: product.sku,
          image: product.image_url,
          images: product.image_url ? [product.image_url] : [],
          rating: parseFloat(product.rating) || 0,
          reviewCount: parseInt(product.rating_count) || 0,
          reviews: [],
          details: {
            sku: product.sku,
            stock: product.stock_quantity
          }
        }));

        setProducts(formattedProducts);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Server check or fetch failed:', err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
          setError(`Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          console.error("Request made but no response received");
          setError('Server is not available. Please make sure the server is running.');
        } else {
          console.error("Error message:", err.message);
          setError(`Error: ${err.message}`);
        }
        setLoading(false);
      }
    };

    checkServerAndFetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    // We don't need to filter by category here anymore since we're fetching by category
    // Just filter by search query
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Fetch product details when a product is clicked
  const handleProductClick = async (product) => {
    try {
      // First set the product from our list to show something immediately
      setSelectedProduct({
        ...product,
        rating: 0,
        reviewCount: 0
      });
      setQuantity(1);

      // Then fetch the latest product details from the server
      const response = await api.get(`/marketplace/api/products/${product.id}`);

      console.log("Product API response:", response.data);

      // Format the product data - make sure we're using the correct property names from the API
      const formattedProduct = {
        id: response.data.product_id,
        name: response.data.name,
        description: response.data.description,
        category: response.data.category_id ? response.data.category_id.toString() : "",
        price: parseFloat(response.data.price) || 0,
        sale_price: response.data.sale_price ? parseFloat(response.data.sale_price) : null,
        stock: response.data.stock_quantity,
        sku: response.data.sku,
        image: response.data.image_url,
        images: response.data.image_url ? [response.data.image_url] : [],
        // Make sure we're using the exact property names from the API response
        rating: parseFloat(response.data.rating) || 0,
        reviewCount: parseInt(response.data.rating_count) || 0,
        reviews: product.reviews || [], // Keep existing reviews
        details: {
          sku: response.data.sku,
          stock: response.data.stock_quantity
        }
      };

      console.log("Formatted product with ratings:", {
        rating: formattedProduct.rating,
        reviewCount: formattedProduct.reviewCount
      });

      // Update the selected product with the latest data
      setSelectedProduct(formattedProduct);

    } catch (err) {
      console.error("Error fetching product details:", err);
    }
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

  const handleAddReview = async () => {
    if (!selectedProduct) return;

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to rate products",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Submitting rating ${newReview.rating} for product ${selectedProduct.id}`);

      // Call the API to add/update the rating
      const response = await api.post("/marketplace/api/products/rate", {
        productId: selectedProduct.id,
        rating: newReview.rating
      });

      console.log("Rating response:", response.data);

      // Update the product with the new rating from the server
      const updatedProduct = {
        ...selectedProduct,
        rating: parseFloat(response.data.rating) || 0,
        reviewCount: parseInt(response.data.ratingCount) || 0
      };

      // Update the selected product
      setSelectedProduct(updatedProduct);

      // Also update the product in the products array
      setProducts(products.map(p =>
        p.id === selectedProduct.id ? { ...p, rating: updatedProduct.rating, reviewCount: updatedProduct.reviewCount } : p
      ));

      // Close the dialog and reset the form
      setReviewDialogOpen(false);
      setNewReview({ rating: 5 });

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
    } catch (err) {
      console.error("Error submitting rating:", err);

      let errorMessage = "Failed to submit rating";
      if (err.response) {
        console.error("Error response:", err.response.data);
        errorMessage = err.response.data.message || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  const addToCart = async (product, qty = 1) => {
    if (!product) return;

    try {
      // Check if user is logged in
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to your cart",
          variant: "destructive",
        });
        return;
      }

      console.log("Adding to cart:", {
        productId: product.id,
        quantity: qty,
        user: user ? `ID: ${user.id || user.user_id || 'unknown'}` : 'not logged in'
      });

      // Call the API to add the product to the cart
      const response = await api.post("/cart/add", {
        productId: product.id,
        quantity: qty,
      });

      console.log("Add to cart response:", response.data);

      // Update local cart state
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if product already exists in cart
        setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + qty } : item)));
      } else {
        // Add new product to cart
        setCart([...cart, { ...product, quantity: qty }]);
      }

      // If this item was in the wishlist and we're adding it to cart from there,
      // we might want to refresh the wishlist to keep it in sync
      fetchWishlist();
      if (refreshNavbarWishlist) refreshNavbarWishlist();

      // Show success toast
      toast({
        title: "Added to cart",
        description: `${qty} × ${product.name} added to your cart`,
        action: (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href="/checkout">View Cart</a>
            </Button>
          </div>
        ),
      });

      // Close the product dialog after adding to cart
      if (selectedProduct) {
        setTimeout(() => setSelectedProduct(null), 500);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);

      // Show error toast
      let errorMessage = "Failed to add item to cart";

      if (err.response) {
        console.error("Error response:", err.response.data);
        if (err.response.status === 400 && err.response.data.message === "Not enough stock") {
          errorMessage = `Only ${err.response.data.available} items available`;
        } else if (err.response.status === 401) {
          errorMessage = "Please log in to add items to your cart";
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Toggle wishlist function
  const toggleWishlist = (product) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    console.log("Toggle wishlist for product:", product);
    console.log("Current wishlist:", wishlist);

    // product.id is the product_id, but in wishlist items we have both id (wishlist_item_id) and product_id
    const isInWishlist = wishlist.some((item) => item.product_id === product.id);
    console.log("Is product in wishlist?", isInWishlist);

    if (isInWishlist) {
      // Find the wishlist item to get its ID (which is the wishlist_item_id)
      const wishlistItem = wishlist.find(item => item.product_id === product.id);
      console.log("Found wishlist item:", wishlistItem);

      if (wishlistItem) {
        // Pass the wishlist_item_id (stored in the id property) to removeFromWishlist
        removeFromWishlist(wishlistItem.id);
        window.location.reload();
        // Show success toast
        toast({
          title: "Removed from wishlist",
          description: `${product.name} removed from your wishlist`,
        });
      } else {
        console.error("Wishlist item found but could not be retrieved");
      }
    } else {
      // Use the local addToWishlist function with the product_id
      addToWishlist(product.id);
      window.location.reload();
      // Show success toast
      toast({
        title: "Added to wishlist",
        description: `${product.name} added to your wishlist`,
      });
    }
  };

  const renderStars = (rating) => {
    const ratingValue = parseFloat(rating) || 0;

    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(ratingValue) ? "text-primary fill-primary" : "text-gray-300"}`}
        />
      ));
  }

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;

      try {
        console.log("Fetching cart for user:", user);
        const response = await api.get("/cart");

        console.log("Cart response:", response.data);

        if (response.data && Array.isArray(response.data.items)) {
          // Format cart items to match our local state format
          const formattedItems = response.data.items.map(item => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || item.image_url,
          }));

          setCart(formattedItems);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        if (err.response && err.response.status === 401) {
          console.log("User not authenticated for cart fetch");
        }
      }
    };

    fetchCart();
  }, [user]);

  // Add a function to update cart item quantity
  const updateCartItemQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;

      const response = await api.put(`/cart/update/${itemId}`, { quantity: newQuantity });
      console.log("Update cart response:", response.data);

      // Update local cart state
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));

      toast({
        title: "Cart updated",
        description: "Item quantity updated successfully",
      });
    } catch (err) {
      console.error("Error updating cart item:", err);

      let errorMessage = "Failed to update item";
      if (err.response && err.response.status === 400 && err.response.data.message === "Not enough stock") {
        errorMessage = `Only ${err.response.data.available} items available`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Add a function to remove item from cart
  const removeCartItem = async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      console.log("Remove from cart response:", response.data);

      // Update local cart state
      setCart(cart.filter(item => item.id !== itemId));

      toast({
        title: "Item removed",
        description: "Item removed from your cart",
      });
    } catch (err) {
      console.error("Error removing cart item:", err);

      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

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
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Loading products...</p>
          <p className="text-muted-foreground">Please wait while we fetch the products</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-red-500">
          <p className="text-lg font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Products grid */}
      {!loading && !error && (
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
                  className="absolute bottom-2 left-2 h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWishlist(product)
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${wishlist.some((item) => item.product_id === product.id) ? "fill-primary text-primary" : ""}`}
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
                  <div className="flex items-center">
                    <div className="flex">{renderStars(product.rating)}</div>
                  </div>
                  <span className="font-medium">${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No products found */}
      {!loading && !error && filteredProducts.length === 0 && (
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
                      <span className="text-sm font-medium">
                        {selectedProduct.rating ? selectedProduct.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>

                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">${typeof selectedProduct.price === 'number' ? selectedProduct.price.toFixed(2) : '0.00'}</span>
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
                        window.location.reload();
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
                      className={wishlist.some((item) => item.product_id === selectedProduct.id) ? "bg-primary/10" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 ${wishlist.some((item) => item.product_id === selectedProduct.id) ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-end justify-end mb-4">

                <Button size="sm" onClick={() => setReviewDialogOpen(true)}>
                  Add Rating
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
            <DialogTitle>Rate this Product</DialogTitle>
            <DialogDescription>Select a star rating for this product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-2"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  >
                    <Star
                      className={`h-8 w-8 ${star <= newReview.rating ? "text-primary fill-primary" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {newReview.rating === 1 && "Poor"}
              {newReview.rating === 2 && "Fair"}
              {newReview.rating === 3 && "Good"}
              {newReview.rating === 4 && "Very Good"}
              {newReview.rating === 5 && "Excellent"}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddReview}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
