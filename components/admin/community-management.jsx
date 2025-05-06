"use client"

import { useState } from "react"
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
import { Search, MoreHorizontal, Check, X, Eye, Calendar, Users, MapPin, Clock, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for existing groups
const existingGroups = [
  {
    id: 1,
    name: "Morning Runners Club",
    members: 128,
    description: "Group for early morning runners. We organize weekly group runs.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Dhaka, Bangladesh",
    nextEvent: "Saturday, 6:00 AM - Gulshan Park",
    status: "active",
    createdAt: "2023-05-15",
  },
  {
    id: 2,
    name: "Vegan Fitness",
    members: 95,
    description: "Plant-based diet and fitness tips for optimal health.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Online",
    nextEvent: "Wednesday, 7:00 PM - Zoom Nutrition Workshop",
    status: "active",
    createdAt: "2023-06-22",
  },
  {
    id: 3,
    name: "Weekend Warriors",
    members: 210,
    description: "For those who pack their workouts into the weekend.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Dhaka, Bangladesh",
    nextEvent: "Sunday, 8:00 AM - Hatirjheel Lake Trail",
    status: "active",
    createdAt: "2023-04-10",
  },
]

// Mock data for group creation requests
const groupRequests = [
  {
    id: 101,
    name: "Yoga Enthusiasts",
    description: "A group for yoga practitioners of all levels to connect and share experiences.",
    creator: {
      id: 42,
      name: "Maya Rahman",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    location: "Dhaka, Bangladesh",
    members: 1,
    requestDate: "2023-09-15",
    status: "pending",
  },
  {
    id: 102,
    name: "Cycling Club Dhaka",
    description: "For cycling enthusiasts in Dhaka to organize group rides and share routes.",
    creator: {
      id: 56,
      name: "Rafiq Ahmed",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    location: "Dhaka, Bangladesh",
    members: 1,
    requestDate: "2023-09-18",
    status: "pending",
  },
  {
    id: 103,
    name: "Strength Training 101",
    description: "Learn proper form and techniques for strength training exercises.",
    creator: {
      id: 78,
      name: "Tasneem Khan",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    location: "Online",
    members: 1,
    requestDate: "2023-09-20",
    status: "pending",
  },
]

// Mock data for event creation requests
const eventRequests = [
  {
    id: 201,
    title: "5K Fun Run",
    description: "A beginner-friendly 5K run around Gulshan Lake.",
    creator: {
      id: 34,
      name: "Imran Hossain",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    group: {
      id: 1,
      name: "Morning Runners Club",
    },
    location: "Gulshan Lake, Dhaka",
    date: "2023-10-15T06:00:00",
    duration: "1 hour",
    maxParticipants: 30,
    requestDate: "2023-09-22",
    status: "pending",
  },
  {
    id: 202,
    title: "Plant-Based Protein Workshop",
    description: "Learn about plant-based protein sources and how to incorporate them into your diet.",
    creator: {
      id: 45,
      name: "Nadia Islam",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    group: {
      id: 2,
      name: "Vegan Fitness",
    },
    location: "Online (Zoom)",
    date: "2023-10-18T19:00:00",
    duration: "1.5 hours",
    maxParticipants: 50,
    requestDate: "2023-09-23",
    status: "pending",
  },
  {
    id: 203,
    title: "Hatirjheel Trail Run",
    description: "A challenging trail run around Hatirjheel Lake.",
    creator: {
      id: 67,
      name: "Kamal Hasan",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    group: {
      id: 3,
      name: "Weekend Warriors",
    },
    location: "Hatirjheel Lake, Dhaka",
    date: "2023-10-22T07:30:00",
    duration: "2 hours",
    maxParticipants: 25,
    requestDate: "2023-09-24",
    status: "pending",
  },
]

export function CommunityManagement() {
  const [activeTab, setActiveTab] = useState("groups")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewGroupDetails, setViewGroupDetails] = useState(null)
  const [viewEventDetails, setViewEventDetails] = useState(null)
  const [viewGroupRequestDetails, setViewGroupRequestDetails] = useState(null)
  const [viewEventRequestDetails, setViewEventRequestDetails] = useState(null)

  // State for managing the lists
  const [groups, setGroups] = useState(existingGroups)
  const [pendingGroups, setPendingGroups] = useState(groupRequests)
  const [pendingEvents, setPendingEvents] = useState(eventRequests)

  // Filter functions
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || group.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredGroupRequests = pendingGroups.filter((request) => {
    return (
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const filteredEventRequests = pendingEvents.filter((request) => {
    return (
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Handle group request approval/rejection
  const handleGroupRequest = (requestId, approved) => {
    const request = pendingGroups.find((req) => req.id === requestId)

    if (approved) {
      // Add to active groups
      const newGroup = {
        ...request,
        id: groups.length + 1,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        nextEvent: "No upcoming events",
      }
      setGroups([...groups, newGroup])

      toast({
        title: "Group approved",
        description: `"${request.name}" has been approved and is now active.`,
      })
    } else {
      toast({
        title: "Group rejected",
        description: `"${request.name}" request has been rejected.`,
      })
    }

    // Remove from pending requests
    setPendingGroups(pendingGroups.filter((req) => req.id !== requestId))
    setViewGroupRequestDetails(null)
  }

  // Handle event request approval/rejection
  const handleEventRequest = (requestId, approved) => {
    const request = pendingEvents.find((req) => req.id === requestId)

    if (approved) {
      // Update the group's next event
      const updatedGroups = groups.map((group) => {
        if (group.id === request.group.id) {
          const eventDate = new Date(request.date)
          const formattedDate = eventDate.toLocaleDateString("en-US", {
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
          })
          return {
            ...group,
            nextEvent: `${formattedDate} - ${request.title}`,
          }
        }
        return group
      })

      setGroups(updatedGroups)

      toast({
        title: "Event approved",
        description: `"${request.title}" has been approved and added to the group calendar.`,
      })
    } else {
      toast({
        title: "Event rejected",
        description: `"${request.title}" event request has been rejected.`,
      })
    }

    // Remove from pending requests
    setPendingEvents(pendingEvents.filter((req) => req.id !== requestId))
    setViewEventRequestDetails(null)
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

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{pendingGroups.length} Group Requests</span>
          </Badge>
          <Badge variant="outline" className="flex gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{pendingEvents.length} Event Requests</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="group-requests">Group Requests</TabsTrigger>
          <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
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
                {filteredGroups.length === 0 ? (
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
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Members
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Events
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
                {filteredGroupRequests.length === 0 ? (
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                            onClick={() => handleGroupRequest(request.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleGroupRequest(request.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Event Requests Tab */}
        <TabsContent value="event-requests" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="hidden md:table-cell">Creator</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEventRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No pending event requests
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEventRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.group.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
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
                      <TableCell className="hidden md:table-cell">
                        {new Date(request.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewEventRequestDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                            onClick={() => handleEventRequest(request.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleEventRequest(request.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
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

                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-1">Next Event</h4>
                    <p className="text-sm">{viewGroupDetails.nextEvent}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline">Manage Members</Button>
                <Button variant="outline">View Events</Button>
                <Button variant={viewGroupDetails.status === "active" ? "destructive" : "default"}>
                  {viewGroupDetails.status === "active" ? "Deactivate Group" : "Activate Group"}
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
                <Button variant="destructive" onClick={() => handleGroupRequest(viewGroupRequestDetails.id, false)}>
                  Reject Request
                </Button>
                <Button onClick={() => handleGroupRequest(viewGroupRequestDetails.id, true)}>Approve Group</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Request Details Dialog */}
      <Dialog open={!!viewEventRequestDetails} onOpenChange={() => setViewEventRequestDetails(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Event Request Details</DialogTitle>
            <DialogDescription>Review the event creation request</DialogDescription>
          </DialogHeader>

          {viewEventRequestDetails && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{viewEventRequestDetails.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Requested on {viewEventRequestDetails.requestDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={viewEventRequestDetails.creator.avatar || "/placeholder.svg"}
                        alt={viewEventRequestDetails.creator.name}
                      />
                      <AvatarFallback>{viewEventRequestDetails.creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{viewEventRequestDetails.creator.name}</p>
                      <p className="text-sm text-muted-foreground">Event Creator</p>
                    </div>
                  </div>
                  <Badge variant="outline">{viewEventRequestDetails.group.name}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{viewEventRequestDetails.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewEventRequestDetails.location}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Date & Time</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(viewEventRequestDetails.date).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Duration</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{viewEventRequestDetails.duration}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Max Participants</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{viewEventRequestDetails.maxParticipants}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button variant="destructive" onClick={() => handleEventRequest(viewEventRequestDetails.id, false)}>
                  Reject Event
                </Button>
                <Button onClick={() => handleEventRequest(viewEventRequestDetails.id, true)}>Approve Event</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
