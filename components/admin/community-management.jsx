"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Search,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Calendar,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Image
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import axios from "axios"

export function CommunityManagement() {
  const [activeTab, setActiveTab] = useState("groups")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewGroupDetails, setViewGroupDetails] = useState(null)
  const [viewGroupRequestDetails, setViewGroupRequestDetails] = useState(null)

  // State for managing the lists
  const [groups, setGroups] = useState([])
  const [pendingGroups, setPendingGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)

  // Pagination state
  const [groupsPagination, setGroupsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [pendingPagination, setPendingPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Group editing state
  const [editGroupDetails, setEditGroupDetails] = useState(null)

  // Fetch groups with pagination
  const fetchGroups = async (page = 1, limit = 10, status = statusFilter, search = searchQuery) => {
    setLoading(true)
    try {
      // Fetch active/inactive groups
      const groupsResponse = await axios.get('http://localhost:5000/admin-group/allGroups', {
        params: { page, limit, status, search },
        withCredentials: true
      })

      setGroups(groupsResponse.data.groups)
      setGroupsPagination(groupsResponse.data.pagination)

      return groupsResponse.data
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch pending groups with pagination
  const fetchPendingGroups = async (page = 1, limit = 10, search = searchQuery) => {
    setLoading(true)
    try {
      // Fetch pending group requests
      const pendingResponse = await axios.get('http://localhost:5000/admin-group/pendingGroups', {
        params: { page, limit, search },
        withCredentials: true
      })

      setPendingGroups(pendingResponse.data.groups)
      setPendingPagination(pendingResponse.data.pagination)

      return pendingResponse.data
    } catch (error) {
      console.error('Error fetching pending groups:', error)
      toast({
        title: "Error",
        description: "Failed to load pending group requests. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch all groups and pending groups on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchGroups()
      await fetchPendingGroups()
    }

    loadInitialData()
  }, [])

  // Refetch when search or status filter changes
  useEffect(() => {
    if (activeTab === "groups") {
      fetchGroups(1, groupsPagination.limit, statusFilter, searchQuery)
    } else if (activeTab === "group-requests") {
      fetchPendingGroups(1, pendingPagination.limit, searchQuery)
    }
  }, [searchQuery, statusFilter, activeTab])

  // Handle pagination for groups
  const handleGroupsPageChange = (newPage) => {
    fetchGroups(newPage, groupsPagination.limit, statusFilter, searchQuery)
  }

  // Handle pagination for pending groups
  const handlePendingPageChange = (newPage) => {
    fetchPendingGroups(newPage, pendingPagination.limit, searchQuery)
  }

  // We no longer need to filter groups locally since the API handles filtering
  // This is just for backward compatibility with the existing code
  const filteredGroups = groups
  const filteredGroupRequests = pendingGroups

  // Handle group editing
  const handleEditGroup = async () => {
    if (!editGroupDetails) return

    setLoadingAction(true)
    try {
      const response = await axios.put(
        `http://localhost:5000/admin-group/updateGroup/${editGroupDetails.id}`,
        {
          name: editGroupDetails.name,
          description: editGroupDetails.description,
          location: editGroupDetails.location
        },
        { withCredentials: true }
      )

      // Update the group in the state
      const updatedGroups = groups.map(g => {
        if (g.id === editGroupDetails.id) {
          return response.data.group
        }
        return g
      })

      setGroups(updatedGroups)

      // If we're viewing the group details, update that too
      if (viewGroupDetails && viewGroupDetails.id === editGroupDetails.id) {
        setViewGroupDetails(response.data.group)
      }

      // Clear the edit state
      setEditGroupDetails(null)

      toast({
        title: "Group Updated",
        description: "The group has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating group:', error)
      toast({
        title: "Error",
        description: "Failed to update the group. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Handle group request approval/rejection
  const handleGroupRequest = async (requestId, approved) => {
    setLoadingAction(true)
    const request = pendingGroups.find((req) => req.id === requestId)

    try {
      if (approved) {
        // Approve the group
        await axios.put(`http://localhost:5000/admin-group/approveGroup/${requestId}`, {}, {
          withCredentials: true
        })

        // Fetch the updated group to add to the groups list
        const groupResponse = await axios.get(`http://localhost:5000/admin-group/group/${requestId}`, {
          withCredentials: true
        })

        setGroups([...groups, groupResponse.data])

        toast({
          title: "Group approved",
          description: `"${request.name}" has been approved and is now active.`,
        })
      } else {
        // Reject the group
        await axios.put(`http://localhost:5000/admin-group/rejectGroup/${requestId}`, {}, {
          withCredentials: true
        })

        toast({
          title: "Group rejected",
          description: `"${request.name}" request has been rejected.`,
        })
      }

      // Remove from pending requests
      setPendingGroups(pendingGroups.filter((req) => req.id !== requestId))
      setViewGroupRequestDetails(null)
    } catch (error) {
      console.error('Error handling group request:', error)
      toast({
        title: "Error",
        description: `Failed to ${approved ? 'approve' : 'reject'} the group. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Toggle group status (activate/deactivate)
  const handleToggleGroupStatus = async (groupId) => {
    setLoadingAction(true)
    const group = groups.find((g) => g.id === groupId)

    try {
      // Call the API to toggle the group status
      const response = await axios.put(`http://localhost:5000/admin-group/toggleStatus/${groupId}`, {}, {
        withCredentials: true
      })

      // Update the group in the state
      const updatedGroups = groups.map((g) => {
        if (g.id === groupId) {
          return { ...g, status: response.data.newStatus }
        }
        return g
      })

      setGroups(updatedGroups)

      // If we're viewing the group details, update that too
      if (viewGroupDetails && viewGroupDetails.id === groupId) {
        setViewGroupDetails({ ...viewGroupDetails, status: response.data.newStatus })
      }

      toast({
        title: response.data.newStatus === 'active' ? "Group Activated" : "Group Deactivated",
        description: `"${group.name}" has been ${response.data.newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      })
    } catch (error) {
      console.error('Error toggling group status:', error)
      toast({
        title: "Error",
        description: "Failed to update group status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingAction(false)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>


      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="group-requests">
            Group Requests
            {pendingGroups.length > 0 && (
              <Badge variant="destructive" className="ml-4">{pendingGroups.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Existing Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
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
                        <span>Loading groups...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No groups found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={group.image || "/placeholder.svg"} alt={group.name} />
                            <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[150px]">{group.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{group.members}</TableCell>
                      <TableCell className="hidden md:table-cell">{group.location}</TableCell>
                      <TableCell className="hidden md:table-cell">{group.createdAt}</TableCell>
                      <TableCell>
                        <Badge variant={group.status === "active" ? "success" : "secondary"}>{group.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewGroupDetails(group)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditGroupDetails({...group})}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleGroupStatus(group.id)}>
                              {group.status === "active" ? (
                                <>
                                  <X className="mr-2 h-4 w-4 text-red-500" />
                                  <span className="text-red-500">Deactivate Group</span>
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                  <span className="text-green-500">Activate Group</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Group Requests Tab */}
        <TabsContent value="group-requests" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Request Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredGroupRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No pending group requests
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroupRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={request.creator.avatar || "/placeholder.svg"}
                              alt={request.creator.name}
                            />
                            <AvatarFallback>{request.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px]">{request.creator.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{request.location}</TableCell>
                      <TableCell className="hidden md:table-cell">{request.requestDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewGroupRequestDetails(request)}
                            disabled={loadingAction}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                            onClick={() => handleGroupRequest(request.id, true)}
                            disabled={loadingAction}
                          >
                            {loadingAction ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleGroupRequest(request.id, false)}
                            disabled={loadingAction}
                          >
                            {loadingAction ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination for Groups */}
          {!loading && groupsPagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGroupsPageChange(groupsPagination.page - 1)}
                disabled={groupsPagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm">
                Page {groupsPagination.page} of {groupsPagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGroupsPageChange(groupsPagination.page + 1)}
                disabled={groupsPagination.page === groupsPagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Pagination for Pending Groups */}
        {!loading && activeTab === "group-requests" && pendingPagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePendingPageChange(pendingPagination.page - 1)}
              disabled={pendingPagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {pendingPagination.page} of {pendingPagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePendingPageChange(pendingPagination.page + 1)}
              disabled={pendingPagination.page === pendingPagination.totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        )}
      </Tabs>

      {/* Group Details Dialog */}
      <Dialog open={!!viewGroupDetails} onOpenChange={() => setViewGroupDetails(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
            <DialogDescription>Detailed information about the group</DialogDescription>
          </DialogHeader>

          {viewGroupDetails && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={viewGroupDetails.image || "/placeholder.svg"}
                      alt={viewGroupDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-2/3 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{viewGroupDetails.name}</h3>
                    <Badge variant={viewGroupDetails.status === "active" ? "success" : "secondary"}>
                      {viewGroupDetails.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{viewGroupDetails.members} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewGroupDetails.location}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created on {viewGroupDetails.createdAt}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{viewGroupDetails.description}</p>
                  </div>


                </div>
              </div>

              <div className="flex justify-end">


                <Button
                  variant={viewGroupDetails.status === "active" ? "destructive" : "default"}
                  onClick={() => handleToggleGroupStatus(viewGroupDetails.id)}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {viewGroupDetails.status === "active" ? (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Deactivate Group
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Activate Group
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Group Request Details Dialog */}
      <Dialog open={!!viewGroupRequestDetails} onOpenChange={() => setViewGroupRequestDetails(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Group Request Details</DialogTitle>
            <DialogDescription>Review the group creation request</DialogDescription>
          </DialogHeader>

          {viewGroupRequestDetails && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{viewGroupRequestDetails.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Requested on {viewGroupRequestDetails.requestDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Avatar>
                    <AvatarImage
                      src={viewGroupRequestDetails.creator.avatar || "/placeholder.svg"}
                      alt={viewGroupRequestDetails.creator.name}
                    />
                    <AvatarFallback>{viewGroupRequestDetails.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{viewGroupRequestDetails.creator.name}</p>
                    <p className="text-sm text-muted-foreground">Group Creator</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{viewGroupRequestDetails.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewGroupRequestDetails.location}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Initial Members</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{viewGroupRequestDetails.members} (Creator only)</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleGroupRequest(viewGroupRequestDetails.id, false)}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Reject Request"
                  )}
                </Button>
                <Button
                  onClick={() => handleGroupRequest(viewGroupRequestDetails.id, true)}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Approve Group"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={!!editGroupDetails} onOpenChange={(open) => !open && setEditGroupDetails(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Make changes to the group details</DialogDescription>
          </DialogHeader>

          {editGroupDetails && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={editGroupDetails.name}
                    onChange={(e) => setEditGroupDetails({...editGroupDetails, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editGroupDetails.description || ''}
                    onChange={(e) => setEditGroupDetails({...editGroupDetails, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editGroupDetails.location || ''}
                    onChange={(e) => setEditGroupDetails({...editGroupDetails, location: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditGroupDetails(null)}>Cancel</Button>
                <Button
                  onClick={handleEditGroup}
                  disabled={!editGroupDetails.name || loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
