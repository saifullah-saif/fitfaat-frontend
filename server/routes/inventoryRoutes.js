const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET all products
router.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ ADD new product
router.post('/', (req, res) => {
  const { name, price, sale_price, stock_quantity, category_id, description, sku, image_url } = req.body;

  if (!name || price == null || sale_price == null || stock_quantity == null || !category_id) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  db.query(
    `INSERT INTO products (name, price, sale_price, stock_quantity, category_id, description, sku, image_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, price, sale_price, stock_quantity, category_id, description, sku, image_url],
    (err, result) => {
      if (err) {
        console.error('Error inserting product:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Product added successfully', product_id: result.insertId });
    }
  );
});

// ✅ UPDATE product
router.put("/:id", (req, res) => {
  const { name, price, sale_price, stock_quantity, category_id, description, sku, image_url } = req.body;
  const { id } = req.params;

  const query = `
    UPDATE products 
    SET name = ?, price = ?, sale_price = ?, stock_quantity = ?, category_id = ?, description = ?, sku = ?, image_url = ?
    WHERE product_id = ?
  `;

  db.query(query, [name, price, sale_price, stock_quantity, category_id, description, sku, image_url, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product updated successfully." });
  });
});

// ✅ DELETE product
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE product_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product deleted successfully." });
  });
});

module.exports = router;
