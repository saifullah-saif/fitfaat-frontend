"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import {
  Search,
  Filter,
  MoreHorizontal,
  Flag,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Trash,
  Eye,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react"



export function ContentModeration() {
  const [activeTab, setActiveTab] = useState("all-content")
  const [searchQuery, setSearchQuery] = useState("")
  const [contentTypeFilter, setContentTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [allContent, setAllContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedContent, setSelectedContent] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editedContent, setEditedContent] = useState({ title: "", content: "" })

  // Fetch all content on component mount
  useEffect(() => {
    fetchAllContent();
  }, []);

  // Function to fetch all content
  const fetchAllContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/admin-content/allContent", {
        withCredentials: true
      });

      setAllContent(response.data);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to load content. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter content based on search query and filters
  const filteredAllContent = allContent.filter((content) => {
    const matchesSearch =
      content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.author.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = contentTypeFilter === "all" || content.type === contentTypeFilter

    // Fix for status filtering to prevent duplicates
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" &&
        (content.status === "approved" || content.status === "Approved")) ||
      (statusFilter === "rejected" &&
        (content.status === "rejected" || content.status === "Rejected"))

    return matchesSearch && matchesType && matchesStatus
  })





  // Handle viewing content details
  const handleViewContent = (content) => {
    setSelectedContent(content)
    setIsViewDialogOpen(true)
  }

  // Close view dialog
  const closeViewDialog = () => {
    setIsViewDialogOpen(false)
    setSelectedContent(null)
  }

  // Handle editing content
  const handleEditContent = (content) => {
    setSelectedContent(content)
    setEditedContent({
      title: content.title || "",
      content: content.content,
    })
    setIsEditDialogOpen(true)
  }

  // Save edited content
  const saveEditedContent = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/admin-content/content/${selectedContent.type}/${selectedContent.id}`,
        {
          content: editedContent.content,
          title: selectedContent.type === "post" ? editedContent.title : undefined
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Update content in the local state
        const updatedContent = allContent.map((item) => {
          if (item.id === selectedContent.id) {
            return {
              ...item,
              title: selectedContent.type === "post" ? editedContent.title : item.title,
              content: editedContent.content,
            }
          }
          return item
        });

        setAllContent(updatedContent);
        setIsEditDialogOpen(false);

        toast({
          title: "Content updated",
          description: "The content has been successfully updated.",
        });
      }
    } catch (err) {
      console.error("Error updating content:", err);
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Handle deleting content
  const handleDeleteContent = (content) => {
    setSelectedContent(content);
    setIsDeleteDialogOpen(true);
  }

  // Confirm delete content
  const confirmDeleteContent = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/admin-content/content/${selectedContent.type}/${selectedContent.id}`,
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Remove content from the local state
        const updatedContent = allContent.filter((item) => item.id !== selectedContent.id);
        setAllContent(updatedContent);
        setIsDeleteDialogOpen(false);

        toast({
          title: "Content deleted",
          description: "The content has been successfully deleted.",
        });
      }
    } catch (err) {
      console.error("Error deleting content:", err);
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Handle approving content
  const handleApproveContent = async (content) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/admin-content/content/${content.type}/${content.id}/status`,
        {
          status: "approved"
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Update content status in the local state
        const updatedContent = allContent.map((item) => {
          // Only update if both ID and type match to avoid affecting posts/comments with same ID
          if (item.id === content.id && item.type === content.type) {
            return { ...item, status: "approved" }
          }
          return item
        });

        setAllContent(updatedContent);

        toast({
          title: "Content approved",
          description: "The content has been approved and is now visible to users.",
        });
      }
    } catch (err) {
      console.error("Error approving content:", err);
      toast({
        title: "Error",
        description: "Failed to approve content. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Handle rejecting content
  const handleRejectContent = async (content) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/admin-content/content/${content.type}/${content.id}/status`,
        {
          status: "rejected"
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Update content status in the local state
        const updatedContent = allContent.map((item) => {
          // Only update if both ID and type match to avoid affecting posts/comments with same ID
          if (item.id === content.id && item.type === content.type) {
            return { ...item, status: "rejected" }
          }
          return item
        });

        setAllContent(updatedContent);

        toast({
          title: "Content rejected",
          description: "The content has been rejected and is no longer visible to users.",
        });
      }
    } catch (err) {
      console.error("Error rejecting content:", err);
      toast({
        title: "Error",
        description: "Failed to reject content. Please try again.",
        variant: "destructive"
      });
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search content..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === "all-content" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Content Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllContent}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              Refresh
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="all-content">All Content</TabsTrigger>
        </TabsList>

        {/* All Content Tab */}
        <TabsContent value="all-content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User-Generated Content</CardTitle>
              <CardDescription>View and manage all user-generated content across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 border rounded-md bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading content...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAllContent.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No content found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAllContent.map((content) => (
                        <TableRow key={`${content.type}-${content.id}`}>
                          <TableCell className="font-medium">
                            <div className="max-w-[300px] truncate">
                              {content.type === "post" ? content.title : content.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {content.type === "post" ? (
                                <FileText className="mr-1 h-3 w-3" />
                              ) : (
                                <MessageSquare className="mr-1 h-3 w-3" />
                              )}
                              {content.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={content.author.avatar || "/placeholder.svg"}
                                  alt={content.author.name}
                                />
                                <AvatarFallback>{content.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[100px]">{content.author.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(content.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                content.status === "approved"
                                  ? "success"
                                  : content.status === "pending"
                                    ? "outline"
                                    : content.status === "flagged"
                                      ? "warning"
                                      : "destructive"
                              }
                              className="capitalize"
                            >
                              {content.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewContent(content)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditContent(content)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Content
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteContent(content)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Content
                                </DropdownMenuItem>
                                {content.status !== "approved" && (
                                  <DropdownMenuItem onClick={() => handleApproveContent(content)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Content
                                  </DropdownMenuItem>
                                )}
                                {content.status !== "rejected" && (
                                  <DropdownMenuItem onClick={() => handleRejectContent(content)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Content
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* View Content Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>
              Viewing details for {selectedContent?.type} by {selectedContent?.author?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.type === "post" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <div className="p-3 rounded-md border bg-muted/50">
                    {selectedContent.title}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Content</Label>
                <div className="p-3 rounded-md border bg-muted/50 whitespace-pre-wrap">
                  {selectedContent.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Author</Label>
                  <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedContent.author.avatar || "/placeholder.svg"} alt={selectedContent.author.name} />
                      <AvatarFallback>{selectedContent.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedContent.author.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="p-3 rounded-md border bg-muted/50">
                    <Badge
                      variant={
                        selectedContent.status === "approved"
                          ? "success"
                          : selectedContent.status === "pending"
                            ? "outline"
                            : selectedContent.status === "flagged"
                              ? "warning"
                              : "destructive"
                      }
                      className="capitalize"
                    >
                      {selectedContent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="p-3 rounded-md border bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(selectedContent.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedContent.group && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Group</Label>
                    <div className="p-3 rounded-md border bg-muted/50">
                      {selectedContent.group}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeViewDialog}>
                  Close
                </Button>
                <Button onClick={() => handleEditContent(selectedContent)}>
                  Edit Content
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Make changes to the selected content</DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.type === "post" && (
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedContent.title}
                    onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editedContent.content}
                  onChange={(e) => setEditedContent({ ...editedContent, content: e.target.value })}
                  rows={6}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedContent}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={confirmDeleteContent}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
