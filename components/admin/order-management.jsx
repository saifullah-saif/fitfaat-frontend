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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  XCircle,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

// Mock order data
const initialOrders = [
  {
    id: "ORD-2023-1001",
    customer: {
      name: "John Smith",
      email: "john@example.com",
    },
    date: "2023-11-15",
    total: 249.98,
    status: "Delivered",
    items: [
      { id: 1, name: "Adjustable Dumbbells", quantity: 1, price: 199.99 },
      { id: 2, name: "Resistance Bands Set", quantity: 1, price: 29.99 },
      { id: 3, name: "Shipping", quantity: 1, price: 20.0 },
    ],
    shipping: {
      address: "123 Main St, Anytown, CA 12345",
      method: "Standard Shipping",
      tracking: "TRK123456789",
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
  },
  {
    id: "ORD-2023-1002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    date: "2023-11-16",
    total: 79.98,
    status: "Shipped",
    items: [
      { id: 1, name: "Yoga Mat Premium", quantity: 1, price: 49.99 },
      { id: 2, name: "Foam Roller", quantity: 1, price: 24.99 },
      { id: 3, name: "Shipping", quantity: 1, price: 5.0 },
    ],
    shipping: {
      address: "456 Oak Ave, Somewhere, NY 54321",
      method: "Express Shipping",
      tracking: "TRK987654321",
    },
    payment: {
      method: "PayPal",
      email: "sarah@example.com",
    },
  },
  {
    id: "ORD-2023-1003",
    customer: {
      name: "Michael Brown",
      email: "michael@example.com",
    },
    date: "2023-11-17",
    total: 169.99,
    status: "Processing",
    items: [
      { id: 1, name: "Fitness Tracker Watch", quantity: 1, price: 129.99 },
      { id: 2, name: "Protein Powder - Vanilla", quantity: 1, price: 39.99 },
      { id: 3, name: "Shipping", quantity: 1, price: 0.0 },
    ],
    shipping: {
      address: "789 Pine Ln, Elsewhere, TX 67890",
      method: "Free Shipping",
      tracking: "",
    },
    payment: {
      method: "Credit Card",
      last4: "1234",
    },
  },
  {
    id: "ORD-2023-1004",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
    },
    date: "2023-11-18",
    total: 174.98,
    status: "Cancelled",
    items: [
      { id: 1, name: "Kettlebell Set", quantity: 1, price: 149.99 },
      { id: 2, name: "Resistance Bands Set", quantity: 1, price: 29.99 },
      { id: 3, name: "Shipping", quantity: 1, price: 15.0 },
      { id: 4, name: "Discount", quantity: 1, price: -20.0 },
    ],
    shipping: {
      address: "321 Elm St, Nowhere, FL 13579",
      method: "Standard Shipping",
      tracking: "",
    },
    payment: {
      method: "Credit Card",
      last4: "5678",
    },
  },
  {
    id: "ORD-2023-1005",
    customer: {
      name: "Alex Wilson",
      email: "alex@example.com",
    },
    date: "2023-11-19",
    total: 89.99,
    status: "Pending",
    items: [
      { id: 1, name: "Protein Powder - Chocolate", quantity: 2, price: 39.99 },
      { id: 2, name: "Shipping", quantity: 1, price: 10.0 },
    ],
    shipping: {
      address: "555 Maple Dr, Anyplace, WA 24680",
      method: "Standard Shipping",
      tracking: "",
    },
    payment: {
      method: "Credit Card",
      last4: "9012",
    },
  },
]

export function OrderManagement() {
  const [orders, setOrders] = useState(initialOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Handle updating order status
  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return

    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id ? { ...order, status: newStatus } : order,
    )

    setOrders(updatedOrders)
    setIsUpdateStatusDialogOpen(false)

    toast({
      title: "Order Updated",
      description: `Order ${selectedOrder.id} status changed to ${newStatus}`,
    })
  }

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "Delivered":
        return "success"
      case "Shipped":
        return "outline"
      case "Processing":
        return "secondary"
      case "Pending":
        return "warning"
      case "Cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "Shipped":
        return <Truck className="h-4 w-4 mr-1" />
      case "Processing":
        return <Clock className="h-4 w-4 mr-1" />
      case "Pending":
        return <AlertTriangle className="h-4 w-4 mr-1" />
      case "Cancelled":
        return <XCircle className="h-4 w-4 mr-1" />
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
              placeholder="Search orders..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
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
                <Calendar className="h-4 w-4 mr-2" />
                Filter by Date
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Orders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="flex w-fit items-center">
                      {getStatusIcon(order.status)}
                      {order.status}
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
                            setSelectedOrder(order)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order)
                            setNewStatus(order.status)
                            setIsUpdateStatusDialogOpen(true)
                          }}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Update Status
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

      {/* View Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order ${selectedOrder.id} placed on ${selectedOrder.date}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Customer Information</h3>
                  <div className="text-sm">
                    <p>{selectedOrder.customer.name}</p>
                    <p>{selectedOrder.customer.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Shipping Information</h3>
                  <div className="text-sm">
                    <p>{selectedOrder.shipping.address}</p>
                    <p>Method: {selectedOrder.shipping.method}</p>
                    {selectedOrder.shipping.tracking && <p>Tracking: {selectedOrder.shipping.tracking}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Payment Information</h3>
                  <div className="text-sm">
                    <p>Method: {selectedOrder.payment.method}</p>
                    {selectedOrder.payment.last4 && <p>Card ending in: {selectedOrder.payment.last4}</p>}
                    {selectedOrder.payment.email && <p>PayPal email: {selectedOrder.payment.email}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Order Total
                      </TableCell>
                      <TableCell className="text-right font-bold">${selectedOrder.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-medium">Order Status</h3>
                  <Badge variant={getStatusVariant(selectedOrder.status)} className="flex w-fit items-center">
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </Badge>
                </div>
                <Button
                  onClick={() => {
                    setNewStatus(selectedOrder.status)
                    setIsViewDialogOpen(false)
                    setIsUpdateStatusDialogOpen(true)
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>{selectedOrder && `Change the status for order ${selectedOrder.id}`}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Status</h3>
                <Badge variant={getStatusVariant(selectedOrder.status)} className="flex w-fit items-center">
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">New Status</h3>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "Shipped" && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tracking Number</h3>
                  <Input placeholder="Enter tracking number" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{orders.length}</div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{orders.filter((order) => order.status === "Pending").length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{orders.filter((order) => order.status === "Processing").length}</div>
          <div className="text-sm text-muted-foreground">Processing</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{orders.filter((order) => order.status === "Shipped").length}</div>
          <div className="text-sm text-muted-foreground">Shipped</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{orders.filter((order) => order.status === "Delivered").length}</div>
          <div className="text-sm text-muted-foreground">Delivered</div>
        </div>
      </div>
    </div>
  )
}
