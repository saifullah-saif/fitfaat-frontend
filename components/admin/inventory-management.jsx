"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { ScrollArea } from '@radix-ui/react-scroll-area';

export function InventoryManagement() {
  // Original state for API functionality
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

  // New UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categories, setCategories] = useState([{ category_id: "all", name: "All Categories" }]);
  const [categoryMap, setCategoryMap] = useState({});

  // Reset filters function
  const resetFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Fetch categories
  useEffect(() => {
    axios.get('http://localhost:5000/marketplace/api/categories')
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Create a map of category_id to category name for easy lookup
          const catMap = {};
          response.data.forEach(cat => {
            catMap[cat.category_id] = cat.name;
          });
          setCategoryMap(catMap);

          // Set categories for dropdown
          setCategories([
            { category_id: "all", name: "All Categories" },
            ...response.data
          ]);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      });
  }, []);

  // Fetch inventory data
  useEffect(() => {
    axios.get('http://localhost:5000/api/inventory')
      .then((response) => setInventory(response.data))
      .catch((error) => {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load inventory data",
          variant: "destructive",
        });
      });
  }, []);

  // Handle input change for new product
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Add new product
  const addProduct = () => {
    // Validate form
    if (!newProduct.name || !newProduct.price || !newProduct.stock_quantity || !newProduct.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Create a copy of the product with category_id as a number
    const productToAdd = {
      ...newProduct,
      category_id: parseInt(newProduct.category_id)
    };

    axios.post('http://localhost:5000/api/inventory', productToAdd)
      .then((response) => {
        const addedProduct = { ...productToAdd, product_id: response.data.product_id };
        setInventory([...inventory, addedProduct]);
        setNewProduct({
          name: '', price: '', sale_price: '', stock_quantity: '',
          category_id: '', description: '', sku: '', image_url: ''
        });
        setIsAddDialogOpen(false);
        toast({
          title: "Product Added",
          description: `${newProduct.name} has been added to inventory`,
        });
      })
      .catch((error) => {
        console.error('Error adding product:', error);
        toast({
          title: "Error",
          description: "Failed to add product",
          variant: "destructive",
        });
      });
  };

  // Update product
  const updateProduct = (id) => {
    // Validate form
    if (!editing.name || editing.price === "" || editing.stock_quantity === "") {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Create a copy of the product with category_id as a number
    const productToUpdate = {
      ...editing,
      category_id: parseInt(editing.category_id)
    };

    axios.put(`http://localhost:5000/api/inventory/${id}`, productToUpdate)
      .then(() => {
        setInventory(inventory.map((item) =>
          item.product_id === id ? { ...item, ...productToUpdate } : item
        ));
        setEditing(null);
        setIsEditDialogOpen(false);
        toast({
          title: "Product Updated",
          description: `${editing.name} has been updated`,
        });
      })
      .catch((error) => {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive",
        });
      });
  };

  // Delete product
  const deleteProduct = (id) => {
    axios.delete(`http://localhost:5000/api/inventory/${id}`)
      .then(() => {
        setInventory(inventory.filter((item) => item.product_id !== id));
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        toast({
          title: "Product Deleted",
          description: `Product has been removed from inventory`,
        });
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      });
  };

  // Helper functions for UI
  const getStatusFromStock = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum === 0) return "Out of Stock";
    if (stockNum <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "In Stock":
        return "success";
      case "Low Stock":
        return "warning";
      case "Out of Stock":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Stock":
        return <CheckCircle className="mr-1 h-4 w-4" />;
      case "Low Stock":
        return <AlertTriangle className="mr-1 h-4 w-4" />;
      case "Out of Stock":
        return <Trash className="mr-1 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    return categoryMap[categoryId] || `Category ${categoryId}`;
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter((product) => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilter === "all" ||
      product.category_id?.toString() === categoryFilter.toString();

    // Status filter
    const status = getStatusFromStock(product.stock_quantity);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className={`pl-8 w-[250px] ${searchQuery ? "border-primary" : ""}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className={`w-[150px] ${categoryFilter !== "all" ? "border-primary" : ""}`}>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`w-[150px] ${statusFilter !== "all" ? "border-primary" : ""}`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery !== "") && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="ml-2">
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>Add a new product to your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category_id" className="text-right">
                    Category
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newProduct.category_id ? newProduct.category_id.toString() : ""}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat.category_id !== "all").map((category) => (
                          <SelectItem key={category.category_id} value={category.category_id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sale_price" className="text-right">
                    Sale Price
                  </Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.sale_price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    value={newProduct.stock_quantity}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_url" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={newProduct.image_url}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addProduct}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery !== "") && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                  >
                    {(categoryFilter !== "all" ? 1 : 0) +
                      (statusFilter !== "all" ? 1 : 0) +
                      (searchQuery !== "" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Inventory
              </DropdownMenuItem>
              {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery !== "") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetFilters}>
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery !== "") && (
        <div className="text-sm text-muted-foreground mb-2">
          Showing {filteredInventory.length} of {inventory.length} items
          {categoryFilter !== "all" && (
            <span> in category <strong>{getCategoryName(categoryFilter)}</strong></span>
          )}
          {statusFilter !== "all" && (
            <span> with status <strong>{statusFilter}</strong></span>
          )}
          {searchQuery && (
            <span> matching <strong>"{searchQuery}"</strong></span>
          )}
        </div>
      )}


      
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product.category_id)}</TableCell>
                    <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>${parseFloat(product.sale_price || 0).toFixed(2)}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(getStatusFromStock(product.stock_quantity))} className="flex w-fit items-center">
                        {getStatusIcon(getStatusFromStock(product.stock_quantity))}
                        {getStatusFromStock(product.stock_quantity)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              // Make sure category_id is a string for the Select component
                              setEditing({
                                ...product,
                                category_id: product.category_id?.toString() || ""
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setItemToDelete(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update product information and stock levels</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editing.category_id ? editing.category_id.toString() : ""}
                    onValueChange={(value) => setEditing({ ...editing, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.category_id !== "all").map((category) => (
                        <SelectItem key={category.category_id} value={category.category_id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sale-price" className="text-right">
                  Sale Price
                </Label>
                <Input
                  id="edit-sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editing.sale_price}
                  onChange={(e) => setEditing({ ...editing, sale_price: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editing.stock_quantity}
                  onChange={(e) => setEditing({ ...editing, stock_quantity: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="edit-sku"
                  value={editing.sku}
                  onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="edit-image"
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateProduct(editing?.product_id)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {itemToDelete && (
            <div className="py-4">
              <p className="font-medium">{itemToDelete.name}</p>
              <p className="text-sm text-muted-foreground">SKU: {itemToDelete.sku}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteProduct(itemToDelete?.product_id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{inventory.length}</div>
          <div className="text-sm text-muted-foreground">Total Products</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {inventory.filter((item) => getStatusFromStock(item.stock_quantity) === "In Stock").length}
          </div>
          <div className="text-sm text-muted-foreground">In Stock</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {inventory.filter((item) => getStatusFromStock(item.stock_quantity) === "Low Stock").length}
          </div>
          <div className="text-sm text-muted-foreground">Low Stock</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {inventory.filter((item) => getStatusFromStock(item.stock_quantity) === "Out of Stock").length}
          </div>
          <div className="text-sm text-muted-foreground">Out of Stock</div>
        </div>
      </div>
    </div>
  );
}
