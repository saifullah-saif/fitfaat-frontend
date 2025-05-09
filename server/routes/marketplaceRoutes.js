const express = require("express");
const router = express.Router();
const db = require("../db");
//const marketplace = require("../marketplace.js");

// Health check route
router.get("/test", (req, res) => {
  res.json({ message: "Marketplace API is working" });
});

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
    return exports.getAllProducts(req, res);
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

// Future:
// router.post("/api/cart", (req, res) => { /* Add to cart logic */ });

module.exports = router;


