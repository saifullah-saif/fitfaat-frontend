import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    category_id: '',
    description: '',
    sku: '',
    image_url: ''
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/inventory')
      .then((response) => setInventory(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const addProduct = () => {
    axios.post('http://localhost:5000/api/inventory', newProduct)
      .then((response) => {
        const addedProduct = { ...newProduct, product_id: response.data.product_id };
        setInventory([...inventory, addedProduct]);
        setNewProduct({
          name: '', price: '', sale_price: '', stock_quantity: '',
          category_id: '', description: '', sku: '', image_url: ''
        });
      })
      .catch((error) => console.error('Error adding product:', error));
  };

  const updateProduct = (id) => {
    axios.put(`http://localhost:5000/api/inventory/${id}`, editing)
      .then(() => {
        setInventory(inventory.map((item) =>
          item.product_id === id ? { ...item, ...editing } : item
        ));
        setEditing(null);
      })
      .catch((error) => console.error('Error updating product:', error));
  };

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:5000/api/inventory/${id}`)
      .then(() => setInventory(inventory.filter((item) => item.product_id !== id)))
      .catch((error) => console.error('Error deleting product:', error));
  };

  return (
    <div className="inventory-management-container">
      <h2>Inventory Management</h2>

      <div className="inventory-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Price</th><th>Sale Price</th><th>Stock</th>
              <th>Category</th><th>Description</th><th>SKU</th><th>Image URL</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((product) => (
              <tr key={product.product_id}>
                {['product_id', 'name', 'price', 'sale_price', 'stock_quantity', 'category_id', 'description', 'sku', 'image_url'].map((field, i) =>
                  <td key={i}>
                    {editing?.product_id === product.product_id ? (
                      <input
                        name={field}
                        value={editing[field]}
                        onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                      />
                    ) : product[field]}
                  </td>
                )}
                <td>
                  {editing?.product_id === product.product_id ? (
                    <button onClick={() => updateProduct(product.product_id)}>Save</button>
                  ) : (
                    <button onClick={() => setEditing(product)}>Edit</button>
                  )}
                  <button onClick={() => deleteProduct(product.product_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Add New Product</h3>
      <div className="add-product-form">
        {['name', 'price', 'sale_price', 'stock_quantity', 'category_id', 'description', 'sku', 'image_url'].map((field, i) => (
          <input
            key={i}
            name={field}
            placeholder={field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            value={newProduct[field]}
            type={field.includes('price') || field.includes('quantity') || field.includes('category') ? 'number' : 'text'}
            onChange={handleInputChange}
          />
        ))}
        <button onClick={addProduct}>Add Product</button>
      </div>
    </div>
  );
}
