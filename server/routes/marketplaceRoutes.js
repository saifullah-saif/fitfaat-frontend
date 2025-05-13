const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
//const marketplace = require("../marketplace.js");

// Health check route
router.get("/test", (req, res) => {
  res.json({ message: "Marketplace API is working" });
});

// Get user's wishlist items
router.get("/wishlist", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;

  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }

  fetchWishlist(userId, res);
});

// Add item to wishlist
router.post("/wishlist/add", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;

  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }

  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  processAddToWishlist(userId, productId, res);
});

// Remove item from wishlist
router.delete("/wishlist/remove/:itemId", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;

  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }

  const itemId = req.params.itemId;

  processRemoveWishlistItem(userId, itemId, res);
});

// Helper function to fetch user's wishlist
function fetchWishlist(userId, res) {
  console.log(`Fetching wishlist for user ID: ${userId}`);

  // First, get the user's wishlist
  db.query("SELECT wishlist_id FROM wishlists WHERE user_id = ?", [userId], (err, wishlistResults) => {
    if (err) {
      console.error("Error fetching wishlist:", err);
      return res.status(500).json({ message: "Error fetching wishlist", error: err.message });
    }

    // If no wishlist exists, return empty wishlist
    if (!wishlistResults || wishlistResults.length === 0) {
      return res.json({ items: [] });
    }

    const wishlistId = wishlistResults[0].wishlist_id;

    // Get wishlist items with product details
    const query = `
      SELECT wi.wishlist_item_id, p.*
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.product_id
      WHERE wi.wishlist_id = ?
    `;

    db.query(query, [wishlistId], (err, itemResults) => {
      if (err) {
        console.error("Error fetching wishlist items:", err);
        return res.status(500).json({ message: "Error fetching wishlist items", error: err.message });
      }

      // Format the wishlist items
      const items = itemResults.map(item => ({
        id: item.wishlist_item_id,
        product_id: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image_url
      }));

      res.json({ wishlistId, items });
    });
  });
}

// Helper function to add item to wishlist - Main processing function
function processAddToWishlist(userId, productId, res) {
  console.log(`Adding product ID ${productId} to wishlist for user ID: ${userId}`);

  // First, check if the product exists
  db.query("SELECT * FROM products WHERE product_id = ?", [productId], (err, productResults) => {
    if (err) {
      console.error("Error checking product:", err);
      return res.status(500).json({ message: "Error checking product", error: err.message });
    }

    if (!productResults || productResults.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Now, get or create the user's wishlist
    db.query("SELECT wishlist_id FROM wishlists WHERE user_id = ?", [userId], (err, wishlistResults) => {
      if (err) {
        console.error("Error checking wishlist:", err);
        return res.status(500).json({ message: "Error checking wishlist", error: err.message });
      }

      let wishlistId;

      if (!wishlistResults || wishlistResults.length === 0) {
        // Create a new wishlist
        db.query("INSERT INTO wishlists (user_id, name) VALUES (?, 'My Wishlist')", [userId], (err, insertResult) => {
          if (err) {
            console.error("Error creating wishlist:", err);
            return res.status(500).json({ message: "Error creating wishlist", error: err.message });
          }

          wishlistId = insertResult.insertId;
          // Call the helper function to add the item to the wishlist
          addToWishlist(wishlistId, productId, res);
        });
      } else {
        // Use existing wishlist
        wishlistId = wishlistResults[0].wishlist_id;
        // Call the helper function to add the item to the wishlist
        addToWishlist(wishlistId, productId, res);
      }
    });
  });
}

// Helper function to add item to wishlist - Called by processAddToWishlist after wishlist is confirmed
function addToWishlist(wishlistId, productId, res) {
  // Check if the product is already in the wishlist
  db.query(
    "SELECT * FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?",
    [wishlistId, productId],
    (err, itemResults) => {
      if (err) {
        console.error("Error checking wishlist item:", err);
        return res.status(500).json({ message: "Error checking wishlist item", error: err.message });
      }

      if (!itemResults || itemResults.length === 0) {
        // Add new item to wishlist
        db.query(
          "INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)",
          [wishlistId, productId],
          (err, insertResult) => {
            if (err) {
              console.error("Error adding item to wishlist:", err);
              return res.status(500).json({ message: "Error adding item to wishlist", error: err.message });
            }

            res.json({
              message: "Item added to wishlist",
              wishlistItemId: insertResult.insertId,
              wishlistId,
              productId
            });
          }
        );
      } else {
        // Item already in wishlist
        res.json({
          message: "Item already in wishlist",
          wishlistItemId: itemResults[0].wishlist_item_id,
          wishlistId,
          productId
        });
      }
    }
  );
}

// Helper function to remove item from wishlist
function processRemoveWishlistItem(userId, itemId, res) {
  console.log(`Removing item ID ${itemId} from wishlist for user ID: ${userId}`);

  // Verify the item belongs to the user's wishlist
  const query = `
    SELECT wi.* FROM wishlist_items wi
    JOIN wishlists w ON wi.wishlist_id = w.wishlist_id
    WHERE wi.wishlist_item_id = ? AND w.user_id = ?
  `;

  db.query(query, [itemId, userId], (err, results) => {
    if (err) {
      console.error("Error verifying wishlist item:", err);
      return res.status(500).json({ message: "Error verifying wishlist item", error: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    // Remove the item
    db.query("DELETE FROM wishlist_items WHERE wishlist_item_id = ?", [itemId], (err) => {
      if (err) {
        console.error("Error removing wishlist item:", err);
        return res.status(500).json({ message: "Error removing wishlist item", error: err.message });
      }

      res.json({ message: "Item removed from wishlist" });
    });
  });
}

// Product fetching route
router.get("/api/products", (req, res) => {
  console.log("Fetching all products");

  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ message: "Error fetching products", error: err.message });
    }

    if (!results || results.length === 0) {
      console.log("No products found in database");
      return res.json([]);
    }

    console.log(`Found ${results.length} products`);

    // Sanitize and process results
    const formatted = results.map(p => ({
      ...p,
      price: parseFloat(p.price),
      sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
      stock_quantity: parseInt(p.stock_quantity),
    }));

    res.json(formatted);
  });
});

// Search products route
router.get("/api/products/search", (req, res) => {
  const searchQuery = req.query.q;

  // Log the search query for debugging
  console.log(`Searching for products with query: "${searchQuery}"`);

  if (!searchQuery) {
    // If no search query, fetch all products directly
    db.query("SELECT * FROM products", (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ message: "Error fetching products", error: err.message });
      }

      if (!results || results.length === 0) {
        console.log("No products found in database");
        return res.json([]);
      }

      console.log(`Found ${results.length} products`);

      // Sanitize and process results
      const formatted = results.map(p => ({
        ...p,
        price: parseFloat(p.price),
        sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
        stock_quantity: parseInt(p.stock_quantity),
      }));

      res.json(formatted);
    });
    return;
  }

  // Use parameterized query with LIKE for partial matching
  // The % wildcards allow matching anywhere in the name
  const query = "SELECT * FROM products WHERE name LIKE ?";
  const searchParam = `%${searchQuery}%`;

  db.query(query, [searchParam], (err, results) => {
    if (err) {
      console.error("Error searching products:", err);
      return res.status(500).json({ message: "Error searching products", error: err.message });
    }

    console.log(`Found ${results.length} products matching "${searchQuery}"`);

    // Sanitize and process results
    const formatted = results.map(p => ({
      ...p,
      price: parseFloat(p.price),
      sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
      stock_quantity: parseInt(p.stock_quantity),
    }));

    res.json(formatted);
  });
});

// Get product by ID route
router.get("/api/products/:id",(req, res) => {
  const productId = req.params.id;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  // Use a JOIN query to get product and rating data in one query
  const query = `
    SELECT p.*,
           IFNULL(AVG(pr.rating), 0) as average_rating,
           COUNT(pr.rating_id) as rating_count
    FROM products p
    LEFT JOIN product_ratings pr ON p.product_id = pr.product_id
    WHERE p.product_id = ?
    GROUP BY p.product_id
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).json({ message: "Error fetching product", error: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Sanitize and process the result
    const product = results[0];
    const formatted = {
      ...product,
      price: parseFloat(product.price),
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      stock_quantity: parseInt(product.stock_quantity),
      rating: parseFloat(product.average_rating) || 0,
      rating_count: parseInt(product.rating_count) || 0
    };

    console.log("Sending product with ratings:", {
      product_id: formatted.product_id,
      rating: formatted.rating,
      rating_count: formatted.rating_count
    });

    res.json(formatted);
  });
});

// Get all categories
router.get("/api/categories", (req, res) => {
  console.log("Fetching all categories");

  db.query("SELECT * FROM product_categories", (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ message: "Error fetching categories", error: err.message });
    }

    if (!results || results.length === 0) {
      console.log("No categories found in database");
      return res.json([]);
    }

    console.log(`Found ${results.length} categories`);
    console.log("Categories:", results); // Add this line to log the categories
    res.json(results);
  });
});

// Get products by category
router.get("/api/products/category/:categoryId", (req, res) => {
  const categoryId = req.params.categoryId;

  console.log(`Fetching products for category ID: ${categoryId}`);

  let query = "SELECT * FROM products";
  let params = [];

  // If not "all" category, filter by category_id
  if (categoryId !== "all") {
    query = "SELECT * FROM products WHERE category_id = ?";
    params = [categoryId];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching products by category:", err);
      return res.status(500).json({ message: "Error fetching products", error: err.message });
    }

    if (!results || results.length === 0) {
      console.log(`No products found for category ID: ${categoryId}`);
      return res.json([]);
    }

    console.log(`Found ${results.length} products for category ID: ${categoryId}`);

    // Sanitize and process results
    const formatted = results.map(p => ({
      ...p,
      price: parseFloat(p.price),
      sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
      stock_quantity: parseInt(p.stock_quantity),
    }));

    res.json(formatted);
  });
});

// Get products with sorting options
router.get("/api/products/sort/:sortOption", (req, res) => {
  const sortOption = req.params.sortOption;
  const categoryId = req.query.category || 'all';

  console.log(`Fetching products with sort option: ${sortOption}, category: ${categoryId}`);

  let query = "";
  let params = [];

  // Base query depending on category
  let baseQuery = "SELECT p.*, IFNULL(AVG(pr.rating), 0) as average_rating, COUNT(pr.rating_id) as rating_count FROM products p LEFT JOIN product_ratings pr ON p.product_id = pr.product_id";

  // Add category filter if not "all"
  if (categoryId !== 'all') {
    baseQuery += " WHERE p.category_id = ?";
    params.push(categoryId);
  }

  // Group by product_id for aggregations
  baseQuery += " GROUP BY p.product_id";

  // Add sorting based on option
  switch (sortOption) {
    case "price-low":
      query = baseQuery + " ORDER BY p.price ASC";
      break;
    case "price-high":
      query = baseQuery + " ORDER BY p.price DESC";
      break;
    case "rating":
      query = baseQuery + " ORDER BY average_rating DESC";
      break;
    case "featured":
    default:
      // For featured, we could implement custom logic or just use a default sort
      query = baseQuery + " ORDER BY p.product_id DESC"; // Default to newest
      break;
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching sorted products:", err);
      return res.status(500).json({ message: "Error fetching products", error: err.message });
    }

    if (!results || results.length === 0) {
      console.log(`No products found for sort option: ${sortOption}`);
      return res.json([]);
    }

    console.log(`Found ${results.length} products for sort option: ${sortOption}`);

    // Sanitize and process results
    const formatted = results.map(p => ({
      ...p,
      price: parseFloat(p.price),
      sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
      stock_quantity: parseInt(p.stock_quantity),
      rating: parseFloat(p.average_rating) || 0,
      rating_count: parseInt(p.rating_count) || 0
    }));

    res.json(formatted);
  });
});

// Add or update product rating
router.post("/api/products/rate", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;

  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }

  const { productId, rating } = req.body;

  if (!productId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Product ID and valid rating (1-5) are required" });
  }

  // Check if the product exists
  db.query("SELECT * FROM products WHERE product_id = ?", [productId], (err, productResults) => {
    if (err) {
      console.error("Error checking product:", err);
      return res.status(500).json({ message: "Error checking product", error: err.message });
    }

    if (!productResults || productResults.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user has already rated this product
    db.query(
      "SELECT * FROM product_ratings WHERE product_id = ? AND user_id = ?",
      [productId, userId],
      (err, ratingResults) => {
        if (err) {
          console.error("Error checking existing rating:", err);
          return res.status(500).json({ message: "Error checking existing rating", error: err.message });
        }

        if (ratingResults && ratingResults.length > 0) {
          // Update existing rating
          db.query(
            "UPDATE product_ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ? AND user_id = ?",
            [rating, productId, userId],
            (err) => {
              if (err) {
                console.error("Error updating rating:", err);
                return res.status(500).json({ message: "Error updating rating", error: err.message });
              }

              // Get updated average rating
              getProductRating(productId, (err, avgRating, ratingCount) => {
                if (err) {
                  console.error("Error getting updated rating:", err);
                  return res.status(500).json({ message: "Error getting updated rating", error: err.message });
                }

                res.json({
                  message: "Rating updated",
                  productId,
                  rating: avgRating,
                  ratingCount
                });
              });
            }
          );
        } else {
          // Add new rating
          db.query(
            "INSERT INTO product_ratings (product_id, user_id, rating) VALUES (?, ?, ?)",
            [productId, userId, rating],
            (err) => {
              if (err) {
                console.error("Error adding rating:", err);
                return res.status(500).json({ message: "Error adding rating", error: err.message });
              }

              // Get updated average rating
              getProductRating(productId, (err, avgRating, ratingCount) => {
                if (err) {
                  console.error("Error getting updated rating:", err);
                  return res.status(500).json({ message: "Error getting updated rating", error: err.message });
                }

                res.json({
                  message: "Rating added",
                  productId,
                  rating: avgRating,
                  ratingCount
                });
              });
            }
          );
        }
      }
    );
  });
});

// Helper function to get product rating
function getProductRating(productId, callback) {
  const query = `
    SELECT IFNULL(AVG(rating), 0) as average_rating, COUNT(rating_id) as rating_count
    FROM product_ratings
    WHERE product_id = ?
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      return callback(err);
    }

    if (!results || results.length === 0) {
      return callback(null, 0, 0);
    }

    const avgRating = parseFloat(results[0].average_rating) || 0;
    const ratingCount = parseInt(results[0].rating_count) || 0;

    callback(null, avgRating, ratingCount);
  });
}

module.exports = router;


