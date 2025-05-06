"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
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
} from "lucide-react"

// Mock inventory data
const initialInventory = [
  {
    id: 1,
    name: "Adjustable Dumbbells",
    category: "Weights",
    price: 199.99,
    stock: 25,
    sku: "WGT-AD-001",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Yoga Mat Premium",
    category: "Yoga",
    price: 49.99,
    stock: 42,
    sku: "YGA-MT-002",
    status: "In Stock",
  },
  {
    id: 3,
    name: "Resistance Bands Set",
    category: "Accessories",
    price: 29.99,
    stock: 8,
    sku: "ACC-RB-003",
    status: "Low Stock",
  },
  {
    id: 4,
    name: "Treadmill Pro 2000",
    category: "Cardio",
    price: 1299.99,
    stock: 5,
    sku: "CRD-TM-004",
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Protein Powder - Vanilla",
    category: "Supplements",
    price: 39.99,
    stock: 0,
    sku: "SUP-PP-005",
    status: "Out of Stock",
  },
  {
    id: 6,
    name: "Kettlebell Set",
    category: "Weights",
    price: 149.99,
    stock: 15,
    sku: "WGT-KB-006",
    status: "In Stock",
  },
  {
    id: 7,
    name: "Fitness Tracker Watch",
    category: "Electronics",
    price: 129.99,
    stock: 30,
    sku: "ELC-FT-007",
    status: "In Stock",
  },
  {
    id: 8,
    name: "Foam Roller",
    category: "Recovery",
    price: 24.99,
    stock: 3,
    sku: "RCV-FR-008",
    status: "Low Stock",
  },
]

export function InventoryManagement() {
  const [inventory, setInventory] = useState(initialInventory)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editItem, setEditItem] = useState(null)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    sku: "",
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Get unique categories for filter dropdown
  const categories = ["all", ...new Set(inventory.map((item) => item.category))]

  // Filter inventory based on search query and filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Handle adding a new item
  const handleAddItem = () => {
    // Validate form
    if (!newItem.name || !newItem.category || !newItem.price || !newItem.stock || !newItem.sku) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Create new item
    const status =
      Number.parseInt(newItem.stock) === 0
        ? "Out of Stock"
        : Number.parseInt(newItem.stock) <= 10
          ? "Low Stock"
          : "In Stock"

    const item = {
      id: inventory.length + 1,
      name: newItem.name,
      category: newItem.category,
      price: Number.parseFloat(newItem.price),
      stock: Number.parseInt(newItem.stock),
      sku: newItem.sku,
      status,
    }

    // Add to inventory
    setInventory([...inventory, item])

    // Reset form and close dialog
    setNewItem({
      name: "",
      category: "",
      price: "",
      stock: "",
      sku: "",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory`,
    })
  }

  // Handle editing an item
  const handleEditItem = () => {
    // Validate form
    if (!editItem.name || !editItem.category || editItem.price === "" || editItem.stock === "") {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Update status based on stock
    const status =
      Number.parseInt(editItem.stock) === 0
        ? "Out of Stock"
        : Number.parseInt(editItem.stock) <= 10
          ? "Low Stock"
          : "In Stock"

    // Update item in inventory
    const updatedInventory = inventory.map((item) =>
      item.id === editItem.id
        ? { ...editItem, status, price: Number.parseFloat(editItem.price), stock: Number.parseInt(editItem.stock) }
        : item,
    )

    setInventory(updatedInventory)
    setIsEditDialogOpen(false)

    toast({
      title: "Item Updated",
      description: `${editItem.name} has been updated`,
    })
  }

  // Handle deleting an item
  const handleDeleteItem = () => {
    if (!itemToDelete) return

    const updatedInventory = inventory.filter((item) => item.id !== itemToDelete.id)
    setInventory(updatedInventory)
    setIsDeleteDialogOpen(false)
    setItemToDelete(null)

    toast({
      title: "Item Deleted",
      description: `${itemToDelete.name} has been removed from inventory`,
    })
  }

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "In Stock":
        return "success"
      case "Low Stock":
        return "warning"
      case "Out of Stock":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "In Stock":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "Low Stock":
        return <AlertTriangle className="h-4 w-4 mr-1" />
      case "Out of Stock":
        return <AlertTriangle className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
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
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)} className="flex w-fit items-center">
                      {getStatusIcon(item.status)}
                      {item.status}
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
                            setEditItem(item)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setItemToDelete(item)
                            setIsDeleteDialogOpen(true)
                          }}
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
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
          {editItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Input
                  id="edit-category"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price ($)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editItem.price}
                  onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
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
                  value={editItem.stock}
                  onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="edit-sku"
                  value={editItem.sku}
                  onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
                  className="col-span-3"
                  disabled
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
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
            <Button variant="destructive" onClick={handleDeleteItem}>
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
          <div className="text-2xl font-bold">{inventory.filter((item) => item.status === "In Stock").length}</div>
          <div className="text-sm text-muted-foreground">In Stock</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{inventory.filter((item) => item.status === "Low Stock").length}</div>
          <div className="text-sm text-muted-foreground">Low Stock</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{inventory.filter((item) => item.status === "Out of Stock").length}</div>
          <div className="text-sm text-muted-foreground">Out of Stock</div>
        </div>
      </div>
    </div>
  )
}
