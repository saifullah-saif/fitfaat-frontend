const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// Get user's cart
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  
  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }
  
  fetchCart(userId, res);
});

// Add item to cart
router.post("/add", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  
  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }
  
  processAddToCart(userId, req, res);
});

// Update cart item quantity
router.put("/update/:itemId", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  
  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }
  
  processUpdateCartItem(userId, req, res);
});

// Remove item from cart
router.delete("/remove/:itemId", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  
  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }
  
  processRemoveCartItem(userId, req, res);
});

// Add a new route for creating orders
router.post("/checkout", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  
  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }
  
  processCheckout(userId, req, res);
});

// Get user's orders
router.get("/orders", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  
  if (!userId) {
    console.error("User ID missing from token. User object:", req.user);
    return res.status(401).json({ message: "Authentication error: User ID missing" });
  }
  
  fetchUserOrders(userId, res);
});

// Helper function to process checkout
function processCheckout(userId, req, res) {
  const { name, address, city, postalCode, country, paymentMethod } = req.body;
 
  console.log(`Processing checkout for user ID: ${userId}`);
 
  if (!address) {
    return res.status(400).json({ message: "Shipping address is required" });
  }
 
  // Format the full address
  const fullAddress = `${address}, ${city || ''}, ${postalCode || ''}, ${country || ''}`;
 
  // First, get the user's cart
  db.query("SELECT cart_id FROM carts WHERE user_id = ?", [userId], (err, cartResults) => {
    if (err) {
      console.error("Error fetching cart:", err);
      return res.status(500).json({ message: "Error fetching cart", error: err.message });
    }
   
    if (!cartResults || cartResults.length === 0) {
      return res.status(404).json({ message: "No cart found for this user" });
    }
   
    const cartId = cartResults[0].cart_id;
   
    // Get cart items with product details to calculate totals
    const query = `
      SELECT ci.cart_item_id, ci.quantity, p.price, p.product_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = ?
    `;
   
    db.query(query, [cartId], (err, itemResults) => {
      if (err) {
        console.error("Error fetching cart items:", err);
        return res.status(500).json({ message: "Error fetching cart items", error: err.message });
      }
     
      if (!itemResults || itemResults.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }
     
      // Calculate totals
      const subtotal = itemResults.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const shippingCost = 5.99; // Fixed shipping cost
      const tax = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + shippingCost + tax;
     
      // Create the order
      const orderData = {
        user_id: userId,
        shipping_address: fullAddress,
        billing_address: fullAddress, // Using same address for billing
        payment_method: paymentMethod || 'Credit Card',
        shipping_method: 'Standard Shipping',
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        tax: tax.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        status: 'Pending'
      };
     
      // Insert the order
      db.query(
        `INSERT INTO orders SET ?`,
        orderData,
        (err, orderResult) => {
          if (err) {
            console.error("Error creating order:", err);
            return res.status(500).json({ message: "Error creating order", error: err.message });
          }
         
          const orderId = orderResult.insertId;
          console.log(`Created order ID: ${orderId} for user ID: ${userId}`);
         
          // Insert order items
          const orderItems = itemResults.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            parseFloat(item.price).toFixed(2),
            (parseFloat(item.price) * item.quantity).toFixed(2)
          ]);
         
          const orderItemsQuery = `
            INSERT INTO order_items
            (order_id, product_id, quantity,price_per_unit, total_price)
            VALUES ?
          `;
         
          db.query(orderItemsQuery, [orderItems], (err) => {
            if (err) {
              console.error("Error creating order items:", err);
              return res.status(500).json({ message: "Error creating order items", error: err.message });
            }
           
            // Clear the cart after successful order - make sure this works
            console.log(`Clearing cart ID: ${cartId} for user ID: ${userId}`);
            db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId], (err) => {
              if (err) {
                console.error("Error clearing cart:", err);
                // Continue even if cart clearing fails, but log it
              }
             
              // Return the order details
              res.status(201).json({
                message: "Order created successfully",
                orderId,
                total: totalAmount.toFixed(2)
              });
            });
          });
        }
      );
    });
  });
}


// Helper function to fetch cart
function fetchCart(userId, res) {
  console.log(`Fetching cart for user ID: ${userId}`);
 
  // First, get the user's cart
  db.query("SELECT cart_id FROM carts WHERE user_id = ?", [userId], (err, cartResults) => {
    if (err) {
      console.error("Error fetching cart:", err);
      return res.status(500).json({ message: "Error fetching cart", error: err.message });
    }
   
    // If no cart exists, return empty cart
    if (!cartResults || cartResults.length === 0) {
      return res.json({ items: [] });
    }
   
    const cartId = cartResults[0].cart_id;
   
    // Get cart items with product details
    const query = `
      SELECT ci.cart_item_id, ci.quantity, p.*
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = ?
    `;
   
    db.query(query, [cartId], (err, itemResults) => {
      if (err) {
        console.error("Error fetching cart items:", err);
        return res.status(500).json({ message: "Error fetching cart items", error: err.message });
      }
     
      // Format the cart items
      const items = itemResults.map(item => ({
        id: item.cart_item_id,
        product_id: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        image: item.image_url,
        stock: item.stock_quantity
      }));
     
      res.json({ cartId, items });
    });
  });
}


// Helper function to process adding to cart once we have the user ID
function processAddToCart(userId, req, res) {
  const { productId, quantity } = req.body;
 
  console.log(`Adding to cart - User ID: ${userId}, Product ID: ${productId}, Quantity: ${quantity}`);
 
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: "Product ID and quantity are required" });
  }
 
  // First, check if the product exists and has enough stock
  db.query("SELECT * FROM products WHERE product_id = ?", [productId], (err, productResults) => {
    if (err) {
      console.error("Error checking product:", err);
      return res.status(500).json({ message: "Error checking product", error: err.message });
    }
   
    if (!productResults || productResults.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
   
    const product = productResults[0];
   
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        message: "Not enough stock",
        available: product.stock_quantity
      });
    }
   
    // Now, get or create the user's cart
    db.query("SELECT cart_id FROM carts WHERE user_id = ?", [userId], (err, cartResults) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res.status(500).json({ message: "Error checking cart", error: err.message });
      }
     
      let cartId;
     
      if (!cartResults || cartResults.length === 0) {
        // Create a new cart
        console.log(`Creating new cart for user ID: ${userId}`);
        db.query("INSERT INTO carts (user_id) VALUES (?)", [userId], (err, insertResult) => {
          if (err) {
            console.error("Error creating cart:", err);
            return res.status(500).json({ message: "Error creating cart", error: err.message });
          }
         
          cartId = insertResult.insertId;
          addToCart(cartId, productId, quantity, res);
        });
      } else {
        // Use existing cart
        cartId = cartResults[0].cart_id;
        console.log(`Using existing cart ID: ${cartId} for user ID: ${userId}`);
        addToCart(cartId, productId, quantity, res);
      }
    });
  });
}


// Helper function to add item to cart
function addToCart(cartId, productId, quantity, res) {
  // Check if the product is already in the cart
  db.query(
    "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, productId],
    (err, itemResults) => {
      if (err) {
        console.error("Error checking cart item:", err);
        return res.status(500).json({ message: "Error checking cart item", error: err.message });
      }
     
      if (!itemResults || itemResults.length === 0) {
        // Add new item to cart
        db.query(
          "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
          [cartId, productId, quantity],
          (err, insertResult) => {
            if (err) {
              console.error("Error adding item to cart:", err);
              return res.status(500).json({ message: "Error adding item to cart", error: err.message });
            }
           
            res.json({
              message: "Item added to cart",
              cartItemId: insertResult.insertId,
              cartId,
              productId,
              quantity
            });
          }
        );
      } else {
        // Update existing item quantity
        const newQuantity = itemResults[0].quantity + quantity;
       
        db.query(
          "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
          [newQuantity, cartId, productId],
          (err) => {
            if (err) {
              console.error("Error updating cart item:", err);
              return res.status(500).json({ message: "Error updating cart item", error: err.message });
            }
           
            res.json({
              message: "Cart updated",
              cartItemId: itemResults[0].cart_item_id,
              cartId,
              productId,
              quantity: newQuantity
            });
          }
        );
      }
    }
  );
}


// Helper function to process updating cart item
function processUpdateCartItem(userId, req, res) {
  const itemId = req.params.itemId;
  const { quantity } = req.body;
 
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }
 
  // First, verify the item belongs to the user's cart
  const query = `
    SELECT ci.*, p.stock_quantity, p.product_id
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.cart_id
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_item_id = ? AND c.user_id = ?
  `;
 
  db.query(query, [itemId, userId], (err, results) => {
    if (err) {
      console.error("Error verifying cart item:", err);
      return res.status(500).json({ message: "Error verifying cart item", error: err.message });
    }
   
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
   
    const cartItem = results[0];
   
    // Check product stock
    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        message: "Not enough stock",
        available: cartItem.stock_quantity
      });
    }
   
    // Update the quantity
    db.query(
      "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?",
      [quantity, itemId],
      (err) => {
        if (err) {
          console.error("Error updating cart item:", err);
          return res.status(500).json({ message: "Error updating cart item", error: err.message });
        }
       
        res.json({
          message: "Cart updated",
          cartItemId: itemId,
          productId: cartItem.product_id,
          quantity
        });
      }
    );
  });
}


// Helper function to process removing cart item
function processRemoveCartItem(userId, req, res) {
  const itemId = req.params.itemId;
 
  // Verify the item belongs to the user's cart
  const query = `
    SELECT ci.* FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.cart_id
    WHERE ci.cart_item_id = ? AND c.user_id = ?
  `;
 
  db.query(query, [itemId, userId], (err, results) => {
    if (err) {
      console.error("Error verifying cart item:", err);
      return res.status(500).json({ message: "Error verifying cart item", error: err.message });
    }
   
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
   
    // Remove the item
    db.query("DELETE FROM cart_items WHERE cart_item_id = ?", [itemId], (err) => {
      if (err) {
        console.error("Error removing cart item:", err);
        return res.status(500).json({ message: "Error removing cart item", error: err.message });
      }
     
      res.json({ message: "Item removed from cart" });
    });
  });
}


// Helper function to fetch user orders
function fetchUserOrders(userId, res) {
  try {
    console.log(`Fetching orders for user ID: ${userId}`);
    
    // First, get basic order information
    const orderQuery = `
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY order_date DESC, order_id DESC
    `;
    
    db.query(orderQuery, [userId], (err, orderResults) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ 
          message: "Error fetching orders", 
          error: err.message 
        });
      }
      
      if (!orderResults || orderResults.length === 0) {
        console.log(`No orders found for user ID: ${userId}`);
        return res.json({ orders: [] });
      }
      
      console.log(`Found ${orderResults.length} orders for user ID: ${userId}`);
      
      // Create a map of orders with basic information
      const orders = orderResults.map(order => ({
        id: order.order_id,
        date: new Date(order.order_date || order.created_at || Date.now()).toISOString().split('T')[0],
        total: parseFloat(order.total_amount || 0),
        status: order.status || 'Pending',
        items: []
      }));
      
      // Get all order IDs
      const orderIds = orderResults.map(order => order.order_id);
      
      // Fetch order items for all orders
      const itemsQuery = `
        SELECT oi.*, p.name, p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id IN (?)
      `;
      
      db.query(itemsQuery, [orderIds], (err, itemResults) => {
        if (err) {
          console.error("Error fetching order items:", err);
          // Return orders without items if there's an error
          return res.json({ orders });
        }
        
        // Add items to their respective orders
        if (itemResults && itemResults.length > 0) {
          console.log(`Found ${itemResults.length} order items`);
          
          // Create a map for faster lookup
          const ordersMap = {};
          orders.forEach(order => {
            ordersMap[order.id] = order;
          });
          
          // Add items to their orders
          itemResults.forEach(item => {
            if (ordersMap[item.order_id]) {
              ordersMap[item.order_id].items.push({
                id: item.product_id,
                name: item.name || `Product #${item.product_id}`,
                quantity: item.quantity,
                price: parseFloat(item.price_per_unit || 0),
                image: item.image_url || "/placeholder.svg"
              });
            }
          });
        }
        
        console.log(`Sending ${orders.length} orders with items`);
        res.json({ orders });
      });
    });
  } catch (error) {
    console.error("Unexpected error in fetchUserOrders:", error);
    res.status(500).json({ 
      message: "Unexpected error fetching orders", 
      error: error.message 
    });
  }
}


// Make sure to export the router
module.exports = router;








