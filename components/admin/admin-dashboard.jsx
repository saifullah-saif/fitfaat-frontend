"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "@/components/admin/user-management"
import { ProgressMonitoring } from "@/components/admin/progress-monitoring"
import { InventoryManagement } from "@/components/admin/inventory-management"
import { OrderManagement } from "@/components/admin/order-management"
import { CommunityManagement } from "@/components/admin/community-management"
import { ContentModeration } from "@/components/admin/content-moderation"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Shield, Users, Activity, Package, ShoppingCart, UsersIcon, MessageSquare } from "lucide-react"
import { Reports } from "@/components/admin/reports"

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")

  // Check for admin status based on user role from token
  const isAdmin = user?.role === "Admin"

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background/50 backdrop-blur overflow-x-auto">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>Community</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user profiles, permissions, and account status</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Track equipment stock, update prices, and manage product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage customer orders, track shipments, and process returns</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Management</CardTitle>
              <CardDescription>Manage community groups, events, and approval requests</CardDescription>
            </CardHeader>
            <CardContent>
              <CommunityManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Manage user-generated content, posts, and comments</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentModeration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and generate reports on user activity and platform usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Reports />
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>
    </div>
  )
}
