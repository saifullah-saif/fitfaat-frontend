import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Edit, UserX, Filter } from "lucide-react";

export function UserManagement() {
  // Original state for API functionality
  const [users, setUsers] = useState([]);

  // New state for UI enhancements
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesRole = filterRole === "all" || user.role?.toLowerCase() === filterRole;

    return matchesSearch && matchesRole;
  });

  // Handle opening the edit dialog
  const handleEditUser = (user) => {
    setSelectedUser({ ...user });
    setEditDialogOpen(true);
  };

  // Handle role change in the dialog
  const handleRoleChange = (value) => {
    setSelectedUser({ ...selectedUser, role: value });
  };

  // Save user changes (API call)
  const saveUser = () => {
    if (selectedUser) {
      axios.put(`http://localhost:5000/api/admin/users/${selectedUser.user_id}`, { role: selectedUser.role })
        .then(() => {
          setUsers(users.map(u => u.user_id === selectedUser.user_id ? { ...u, role: selectedUser.role } : u));
          setEditDialogOpen(false);
        })
        .catch(err => console.error('Error updating role:', err));
    }
  };

  // Handle opening delete confirmation dialog
  const handleDeleteUser = (user) => {
    // Additional safety check to prevent deletion of admin users
    if (user.role === 'Admin') {
      console.warn('Cannot delete admin users');
      return;
    }

    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Delete user (API call)
  const deleteUser = () => {
    if (!userToDelete) return;

    // Final safety check to prevent deletion of admin users
    if (userToDelete.role === 'Admin') {
      console.error('Cannot delete admin users');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      return;
    }

    axios.delete(`http://localhost:5000/api/admin/users/${userToDelete.user_id}`)
      .then(() => {
        setUsers(users.filter(u => u.user_id !== userToDelete.user_id));
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      })
      .catch(err => console.error('Error deleting user:', err));
  };

  // Helper function for role badge styling
  const getRoleBadgeColor = (role) => {
    const roleLower = role?.toLowerCase() || '';
    switch (roleLower) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "premium":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[58vh]" >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Quiz Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.quiz_status}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {user.role !== 'Admin' && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                            <UserX className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user profile here.</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={selectedUser.username || ""}
                  className="col-span-3"
                  disabled
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={selectedUser.email || ""}
                  className="col-span-3"
                  disabled
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUser}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
