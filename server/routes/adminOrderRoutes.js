const express = require('express');
const cors = require('cors');
const db = require('../db'); // Database connection
const router = express.Router();

// Middleware
router.use(cors()); // Allow requests from frontend
router.use(express.json()); // Parse JSON bodies

// GET all orders
router.get('/', (req, res) => {
  const query = `
    SELECT o.*, u.username, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    ORDER BY o.order_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Format the results to match the expected structure in the frontend
    const formattedResults = results.map(order => ({
      id: order.order_id.toString(),
      customer: {
        name: order.username,
        email: order.email
      },
      date: new Date(order.order_date).toLocaleDateString(),
      total: parseFloat(order.total_amount) || 0,
      status: order.status,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      payment_method: order.payment_method,
      shipping_method: order.shipping_method,
      subtotal: parseFloat(order.subtotal) || 0,
      shipping_cost: parseFloat(order.shipping_cost) || 0,
      tax: parseFloat(order.tax) || 0,
      tracking_number: order.tracking_number || 'N/A'
    }));

    res.json(formattedResults);
  });
});

// GET orders by status
router.get('/status/:status', (req, res) => {
  const { status } = req.params;

  // If status is 'all', return all orders
  if (status.toLowerCase() === 'all') {
    return router.handle(req, res);
  }

  const query = `
    SELECT o.*, u.username, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    WHERE o.status = ?
    ORDER BY o.order_date DESC
  `;

  db.query(query, [status], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Format the results
    const formattedResults = results.map(order => ({
      id: order.order_id.toString(),
      customer: {
        name: order.username,
        email: order.email
      },
      date: new Date(order.order_date).toLocaleDateString(),
      total: parseFloat(order.total_amount) || 0,
      status: order.status,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      payment_method: order.payment_method,
      shipping_method: order.shipping_method,
      subtotal: parseFloat(order.subtotal) || 0,
      shipping_cost: parseFloat(order.shipping_cost) || 0,
      tax: parseFloat(order.tax) || 0,
      tracking_number: order.tracking_number || 'N/A'
    }));

    res.json(formattedResults);
  });
});

// GET order details with items
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // Query to get order details
  const orderQuery = `
    SELECT o.*, u.username, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    WHERE o.order_id = ?
  `;

  // Query to get order items
  const itemsQuery = `
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
  `;

  db.query(orderQuery, [id], (err, orderResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (orderResults.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orderResults[0];

    db.query(itemsQuery, [id], (err, itemResults) => {
      if (err) return res.status(500).json({ error: err.message });

      // Format the order with items
      const formattedOrder = {
        id: order.order_id.toString(),
        customer: {
          id: order.user_id,
          name: order.username,
          email: order.email
        },
        date: new Date(order.order_date).toLocaleDateString(),
        status: order.status,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        payment_method: order.payment_method,
        shipping_method: order.shipping_method,
        subtotal: parseFloat(order.subtotal) || 0,
        shipping_cost: parseFloat(order.shipping_cost) || 0,
        tax: parseFloat(order.tax) || 0,
        total: parseFloat(order.total_amount) || 0,
        tracking_number: order.tracking_number || 'N/A',
        items: itemResults.map(item => ({
          id: item.order_item_id,
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price_per_unit,
          total: item.total_price,
          image_url: item.image_url
        }))
      };

      res.json(formattedOrder);
    });
  });
});

// UPDATE order status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  db.query(
    'UPDATE orders SET status = ? WHERE order_id = ?',
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

// Export the router
module.exports = router;