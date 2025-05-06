"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MessageSquare,
  Heart,
  Share2,
  MapPin,
  ImageIcon,
  Send,
  Trophy,
  Users,
  Calendar,
  Filter,
  ChevronRight,
  Star,
  MessageCircle,
  X,
  Search,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import Link from "next/link"

// Maps location constants
const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const center = {
  lat: 23.8103, // Dhaka coordinates
  lng: 90.4125,
}

const options = {
  disableDefaultUI: false,
  zoomControl: true,
}

// Connect with people
const connectionRequestsData = [
  { id: 2, status: "pending", sender: 1, receiver: 2, timestamp: "Just now" }, // Example - outgoing to Emma
]
const connectionsData = [
  { id: 3, user1: 1, user2: 3, timestamp: "Yesterday" }, // Example - already connected with James
]

const getConnectionStatus = (partnerId, connectionRequests, connections) => {
  // Check if already connected
  const existingConnection = connections.find(
    (c) => (c.user1 === 1 && c.user2 === partnerId) || (c.user1 === partnerId && c.user2 === 1),
  )
  if (existingConnection) return "connected"

  // Check for pending requests
  const outgoingRequest = connectionRequests.find(
    (r) => r.sender === 1 && r.receiver === partnerId && r.status === "pending",
  )
  if (outgoingRequest) return "pending-outgoing"

  const incomingRequest = connectionRequests.find(
    (r) => r.sender === partnerId && r.receiver === 1 && r.status === "pending",
  )
  if (incomingRequest) return "pending-incoming"

  return "none"
}

// Mock data for partners
const partners = [
  {
    id: 1,
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    location: { lat: 23.8103, lng: 90.4125 }, // Dhaka coordinates
    distance: "2.5 miles away",
    interests: ["Running", "Weightlifting", "Yoga"],
    level: "Intermediate",
    bio: "Fitness enthusiast looking for running partners on weekends.",
    rating: 4.8,
    reviews: 12,
  },
  {
    id: 2,
    name: "Emma Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    location: { lat: 23.8223, lng: 90.4265 }, // Slightly offset from Dhaka
    distance: "3.8 miles away",
    interests: ["CrossFit", "HIIT", "Swimming"],
    level: "Advanced",
    bio: "CrossFit coach looking to connect with other fitness professionals.",
    rating: 4.9,
    reviews: 24,
  },
  {
    id: 3,
    name: "James Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    location: { lat: 23.8003, lng: 90.4025 }, // Slightly offset from Dhaka
    distance: "1.2 miles away",
    interests: ["Cycling", "Hiking", "Bodyweight"],
    level: "Beginner",
    bio: "New to fitness and looking for a cycling buddy to explore the city.",
    rating: 4.5,
    reviews: 5,
  },
  {
    id: 4,
    name: "Olivia Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    location: { lat: 23.8153, lng: 90.4225 }, // Slightly offset from Dhaka
    distance: "4.5 miles away",
    interests: ["Pilates", "Yoga", "Dance"],
    level: "Intermediate",
    bio: "Yoga instructor looking to connect with other wellness professionals.",
    rating: 5.0,
    reviews: 18,
  },
]

// Update the posts mock data to include group information
const posts = [
  {
    id: 1,
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "alexj",
    },
    content: "Just completed a 10K run in 45 minutes! New personal best. #Running #Fitness",
    image: "/placeholder.svg?height=300&width=500",
    likes: 24,
    comments: 5,
    time: "2 hours ago",
    group: {
      id: 1,
      name: "Morning Runners Club",
    },
  },
  {
    id: 2,
    user: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "sarahw",
    },
    content: "Today's meal prep done! Healthy eating is 80% of the fitness journey. #MealPrep #HealthyEating",
    image: "/placeholder.svg?height=300&width=500",
    likes: 42,
    comments: 8,
    time: "5 hours ago",
    group: {
      id: 2,
      name: "Vegan Fitness",
    },
  },
  {
    id: 3,
    user: {
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "mikec",
    },
    content: "Found a great new gym in downtown! Anyone want to join for a workout session this weekend?",
    likes: 18,
    comments: 12,
    time: "Yesterday",
    group: {
      id: 3,
      name: "Weekend Warriors",
    },
  },
]

// Mock data for groups
const groups = [
  {
    id: 1,
    name: "Morning Runners Club",
    members: 128,
    description: "Group for early morning runners. We organize weekly group runs.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Dhaka, Bangladesh",
    nextEvent: "Saturday, 6:00 AM - Gulshan Park",
  },
  {
    id: 2,
    name: "Vegan Fitness",
    members: 95,
    description: "Plant-based diet and fitness tips for optimal health.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Online",
    nextEvent: "Wednesday, 7:00 PM - Zoom Nutrition Workshop",
  },
  {
    id: 3,
    name: "Weekend Warriors",
    members: 210,
    description: "For those who pack their workouts into the weekend.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Dhaka, Bangladesh",
    nextEvent: "Sunday, 8:00 AM - Hatirjheel Lake Trail",
  },
]

// Mock data for rankings
const rankings = [
  {
    id: 1,
    user: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    points: 1250,
    rank: 1,
    achievements: ["10K Steps Daily", "Workout Streak: 14 days", "Community Leader"],
    progress: 85,
  },
  {
    id: 2,
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    points: 1120,
    rank: 2,
    achievements: ["5K Runner", "Nutrition Master", "Early Bird"],
    progress: 78,
  },
  {
    id: 3,
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    points: 980,
    rank: 3,
    achievements: ["Gym Rat", "Protein Pro", "Weekend Warrior"],
    progress: 65,
  },
  {
    id: 4,
    user: {
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    points: 870,
    rank: 4,
    achievements: ["Yoga Master", "Meditation Guru", "Healthy Eater"],
    progress: 58,
  },
  {
    id: 5,
    user: {
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    points: 750,
    rank: 5,
    achievements: ["Weight Lifter", "Protein Champion", "Gym Regular"],
    progress: 50,
  },
]

export function Community() {
  // Move the Google Maps API loader hook inside the component
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  // Add this useEffect to log the error for debugging
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps loading error:", loadError)
    }
  }, [loadError])

  const [activeTab, setActiveTab] = useState("feed")
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [mapLoaded, setMapLoaded] = useState(false)
  // We don't need map and markers state anymore, but keeping them to avoid changing too much code
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newPost, setNewPost] = useState("")
  const [postImage, setPostImage] = useState(null)
  const [distance, setDistance] = useState([10])
  const [interests, setInterests] = useState("all")
  const mapRef = useRef(null)
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [joinedGroups, setJoinedGroups] = useState<number[]>([1]) // Start with one group joined
  const [groupFilter, setGroupFilter] = useState<"all" | "joined">("all")
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [connectionRequests, setConnectionRequests] = useState(connectionRequestsData)
  const [connections, setConnections] = useState(connectionsData)
  const [selectedMarker, setSelectedMarker] = useState(null) // map marker selector
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [chatMessages, setChatMessages] = useState<Record<string | number, any[]>>({})
  const [currentMessage, setCurrentMessage] = useState("")

  // Callback for when the map loads
  const onMapLoad = useCallback((map) => {
    setMap(map)
    setMapLoaded(true)
  }, [])

  const handleConnectionRequest = (partnerId: number) => {
    const status = getConnectionStatus(partnerId, connectionRequests, connections)

    if (status === "none") {
      // Send connection request
      const newRequest = {
        id: connectionRequests.length + 1,
        status: "pending",
        sender: 1, // Assuming current user ID is 1
        receiver: partnerId,
        timestamp: "Just now",
      }
      setConnectionRequests([...connectionRequests, newRequest])
      toast({
        title: "Connection request sent",
        description: "Your request has been sent to the user.",
      })
    } else if (status === "pending-incoming") {
      // Accept connection request
      const updatedRequests = connectionRequests.map((req) =>
        req.sender === partnerId && req.receiver === 1 ? { ...req, status: "accepted" } : req,
      )
      setConnectionRequests(updatedRequests)

      const newConnection = {
        id: connections.length + 1,
        user1: 1,
        user2: partnerId,
        timestamp: "Just now",
      }
      setConnections([...connections, newConnection])
      toast({
        title: "Connection request accepted",
        description: "You are now connected with the user.",
      })
    }
  }

  // Mock map implementation - only used if Google Maps fails to load
  useEffect(() => {
    if (activeTab === "partners" && mapRef.current && !isLoaded) {
      // Set mapLoaded to true to indicate our mock map is ready
      setMapLoaded(true)

      // Draw a simple mock map on the canvas
      const canvas = mapRef.current
      const ctx = canvas.getContext("2d")

      // Set canvas dimensions
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      // Draw background
      ctx.fillStyle = "#1a2e3b"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw some map-like elements
      ctx.strokeStyle = "#2d4b5a"
      ctx.lineWidth = 2

      // Draw grid lines
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Draw partner markers
      partners.forEach((partner) => {
        // Convert lat/lng to x,y coordinates for our mock map
        const x = (partner.location.lng - 90.4) * 1000 + canvas.width / 2
        const y = (23.82 - partner.location.lat) * 1000 + canvas.height / 2

        // Draw marker
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = "#f59e0b"
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

        // Add click handler to the canvas
        canvas.onclick = (e) => {
          const rect = canvas.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const clickY = e.clientY - rect.top

          // Check if click is near any marker
          partners.forEach((p) => {
            const markerX = (p.location.lng - 90.4) * 1000 + canvas.width / 2
            const markerY = (23.82 - p.location.lat) * 1000 + canvas.height / 2

            const distance = Math.sqrt(Math.pow(clickX - markerX, 2) + Math.pow(clickY - markerY, 2))
            if (distance < 15) {
              setSelectedPartner(p)
            }
          })
        }
      })
    }
  }, [activeTab, partners, connectionRequests, connections, isLoaded])

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedPartner) return

    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMessages((prev) => ({
      ...prev,
      [selectedPartner.id]: [...(prev[selectedPartner.id] || []), newMessage],
    }))
    setChatMessage("")

    // Simulate response after 1 second
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        sender: selectedPartner.name,
        content: "Thanks for reaching out! I'd love to connect for a workout session.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setChatMessages((prev) => ({
        ...prev,
        [selectedPartner.id]: [...(prev[selectedPartner.id] || []), response],
      }))
    }, 1000)
  }

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    toast({
      title: "Post created",
      description: "Your post has been published to the community feed.",
    })

    setNewPost("")
    setPostImage(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPostImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleJoinGroup = (group) => {
    if (joinedGroups.includes(group.id)) {
      // Leave the group
      setJoinedGroups(joinedGroups.filter((id) => id !== group.id))
      toast({
        title: "Group left",
        description: `You have left ${group.name}.`,
      })
    } else {
      // Join the group
      setJoinedGroups([...joinedGroups, group.id])
      toast({
        title: "Group joined",
        description: `You have successfully joined ${group.name}.`,
      })
    }
  }

  const handleLikePost = (postId: number) => {
    if (likedPosts.includes(postId)) {
      // Unlike the post
      setLikedPosts(likedPosts.filter((id) => id !== postId))
      // Find the post and decrement its likes
      const updatedPosts = [...posts]
      const postIndex = updatedPosts.findIndex((post) => post.id === postId)
      if (postIndex !== -1) {
        updatedPosts[postIndex] = {
          ...updatedPosts[postIndex],
          likes: updatedPosts[postIndex].likes - 1,
        }
      }
    } else {
      // Like the post
      setLikedPosts([...likedPosts, postId])
      // Find the post and increment its likes
      const updatedPosts = [...posts]
      const postIndex = updatedPosts.findIndex((post) => post.id === postId)
      if (postIndex !== -1) {
        updatedPosts[postIndex] = {
          ...updatedPosts[postIndex],
          likes: updatedPosts[postIndex].likes + 1,
        }
      }
    }
  }

  const handleCommentPost = (postId: number) => {
    toast({
      title: "Comment feature",
      description: "Comments will be implemented in a future update.",
    })
  }

  const handleSharePost = (postId: number) => {
    toast({
      title: "Post shared",
      description: "Post has been shared to your profile.",
    })
  }

  const handleSendDirectMessage = (userId) => {
    if (!currentMessage.trim()) return

    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMessages((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMessage],
    }))
    setCurrentMessage("")

    // Simulate response after 1 second
    setTimeout(() => {
      const partner = partners.find((p) => p.id === userId)
      if (partner) {
        const response = {
          id: Date.now() + 1,
          sender: partner.name,
          content: "Thanks for your message! I'll get back to you soon.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setChatMessages((prev) => ({
          ...prev,
          [userId]: [...(prev[userId] || []), response],
        }))
      }
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">Connect with fitness partners, join groups, and share your journey.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="partners">Find Partners</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Community Feed</h2>
            <Select value={groupFilter} onValueChange={(value) => setGroupFilter(value as "all" | "joined")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="joined">My Groups Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
                    <AvatarFallback>YA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share your fitness journey..."
                      className="mb-2 resize-none"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                    />
                    {postImage && (
                      <div className="relative mb-2">
                        <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                          <img
                            src={postImage || "/placeholder.svg"}
                            alt="Post preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                            onClick={() => setPostImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <div>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span>Add Image</span>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                      <Button type="submit" disabled={!newPost.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {posts
            .filter((post) => groupFilter === "all" || joinedGroups.includes(post.group.id))
            .map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{post.user.name}</p>
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground">@{post.user.username}</p>
                            <span className="mx-1 text-muted-foreground">•</span>
                            <Link href={`/community/group/${post.group.id}`}>
                              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-secondary/50">
                                {post.group.name}
                              </Badge>
                            </Link>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{post.time}</p>
                      </div>
                      <p className="my-2">{post.content}</p>
                      {post.image && (
                        <div className="mt-2 mb-4">
                          <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt="Post"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex gap-1 ${likedPosts.includes(post.id) ? "text-red-500" : ""}`}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className={`h-4 w-4 ${likedPosts.includes(post.id) ? "fill-red-500" : ""}`} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex gap-1"
                          onClick={() => handleCommentPost(post.id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSharePost(post.id)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Find Partners</CardTitle>
                  <CardDescription>Filter by distance and interests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Distance (miles)</Label>
                      <span className="text-sm">{distance}mi</span>
                    </div>
                    <Slider value={distance} onValueChange={setDistance} max={50} step={1} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests</Label>
                    <Select value={interests} onValueChange={setInterests}>
                      <SelectTrigger id="interests">
                        <SelectValue placeholder="Select interests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Interests</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="weightlifting">Weightlifting</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="crossfit">CrossFit</SelectItem>
                        <SelectItem value="cycling">Cycling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {partners.map((partner) => (
                  <Card
                    key={partner.id}
                    className={`cursor-pointer transition-all ${selectedPartner?.id === partner.id ? "border-primary" : ""}`}
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={partner.avatar || "/placeholder.svg"} alt={partner.name} />
                          <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{partner.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {partner.distance}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Card className="h-[400px] overflow-hidden">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={14}
                    center={center}
                    options={options}
                    onClick={() => setSelectedMarker(null)}
                    onLoad={onMapLoad}
                  >
                    {partners.map((partner) => (
                      <Marker
                        key={partner.id}
                        position={{
                          lat: partner.location.lat,
                          lng: partner.location.lng,
                        }}
                        onClick={() => {
                          setSelectedMarker(partner)
                          setSelectedPartner(partner)
                        }}
                      />
                    ))}

                    {selectedMarker && (
                      <InfoWindow
                        position={{
                          lat: selectedMarker.location.lat,
                          lng: selectedMarker.location.lng,
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="p-2 text-black">
                          <h3 className="font-medium">{selectedMarker.name}</h3>
                          <p className="text-sm">{selectedMarker.distance}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    {loadError ? (
                      <div className="text-center space-y-3">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-lg font-medium">Map unavailable</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {loadError.includes("BillingNotEnabledMapError")
                            ? "Google Maps requires billing to be enabled on your Google Cloud account."
                            : "There was an error loading the map."}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {partners.map((partner) => (
                            <div
                              key={partner.id}
                              className={`p-3 border rounded-md cursor-pointer ${selectedPartner?.id === partner.id ? "border-primary bg-primary/5" : "border-border"}`}
                              onClick={() => setSelectedPartner(partner)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={partner.avatar || "/placeholder.svg"} alt={partner.name} />
                                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{partner.name}</p>
                                  <p className="text-xs text-muted-foreground">{partner.distance}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        <p>Loading map...</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {selectedPartner && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{selectedPartner.name}</CardTitle>
                        <CardDescription>{selectedPartner.distance}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{selectedPartner.rating}</span>
                        <span className="text-xs text-muted-foreground">({selectedPartner.reviews})</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedPartner.avatar || "/placeholder.svg"} alt={selectedPartner.name} />
                        <AvatarFallback>{selectedPartner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Level: {selectedPartner.level}</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPartner.interests.map((interest, index) => (
                            <Badge key={index} variant="secondary">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm">{selectedPartner.bio}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" onClick={() => setChatOpen(true)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => handleConnectionRequest(selectedPartner.id)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "none" &&
                          "Connect"}
                        {getConnectionStatus(selectedPartner.id, connectionRequests, connections) ===
                          "pending-outgoing" && "Request Sent"}
                        {getConnectionStatus(selectedPartner.id, connectionRequests, connections) ===
                          "pending-incoming" && "Accept Request"}
                        {getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "connected" &&
                          "Connected"}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Workout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Chat Dialog */}
          <Dialog open={chatOpen} onOpenChange={setChatOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Chat with {selectedPartner?.name}</DialogTitle>
                <DialogDescription>Send a message to connect and plan a workout</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col h-[300px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {!selectedPartner ||
                  !chatMessages[selectedPartner.id] ||
                  chatMessages[selectedPartner.id].length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages[selectedPartner.id].map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 text-right mt-1">{message.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Fitness Groups</h2>
              <p className="text-sm text-muted-foreground">
                Join local groups to connect with like-minded fitness enthusiasts
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                className="pl-8"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {joinedGroups.length > 0 && (
            <>
              <h3 className="text-lg font-medium mt-6 mb-3">My Groups</h3>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {groups
                  .filter(
                    (group) =>
                      joinedGroups.includes(group.id) &&
                      (group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
                        group.description.toLowerCase().includes(groupSearchQuery.toLowerCase())),
                  )
                  .map((group) => (
                    <Link href={`/community/group/${group.id}`} key={group.id}>
                      <Card className="overflow-hidden border-primary/50 cursor-pointer">
                        <div className="aspect-video relative bg-muted">
                          <img
                            src={group.image || "/placeholder.svg"}
                            alt={group.name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                            <div className="flex items-center text-xs text-white/80">
                              <Users className="mr-1 h-3 w-3" />
                              <span>{group.members} members</span>
                              <span className="mx-2">•</span>
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{group.location}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm mb-4">{group.description}</p>
                          <div className="bg-muted rounded-md p-2 mb-4">
                            <p className="text-xs font-medium">Next Event</p>
                            <p className="text-sm">{group.nextEvent}</p>
                          </div>
                          <Button variant="default" className="w-full" onClick={() => handleJoinGroup(group)}>
                            Leave Group
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
              <div className="border-t border-border my-6"></div>
              <h3 className="text-lg font-medium mt-6 mb-3">Discover Groups</h3>
            </>
          )}

          {groups.filter((group) => !joinedGroups.includes(group.id)).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groups
                .filter(
                  (group) =>
                    !joinedGroups.includes(group.id) &&
                    (group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
                      group.description.toLowerCase().includes(groupSearchQuery.toLowerCase())),
                )
                .map((group) => (
                  <Link href={`/community/group/${group.id}`} key={group.id}>
                    <Card className="overflow-hidden cursor-pointer">
                      <div className="aspect-video relative bg-muted">
                        <img
                          src={group.image || "/placeholder.svg"}
                          alt={group.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                          <div className="flex items-center text-xs text-white/80">
                            <Users className="mr-1 h-3 w-3" />
                            <span>{group.members} members</span>
                            <span className="mx-2">•</span>
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{group.location}</span>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm mb-4">{group.description}</p>
                        <div className="bg-muted rounded-md p-2 mb-4">
                          <p className="text-xs font-medium">Next Event</p>
                          <p className="text-sm">{group.nextEvent}</p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => handleJoinGroup(group)}>
                          Join Group
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            joinedGroups.length > 0 && (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">You've joined all available groups!</h3>
                <p className="text-muted-foreground mb-4">
                  Check back later for new groups or try a different search term.
                </p>
              </div>
            )
          )}
        </TabsContent>

        {/* Rankings Tab */}
        <TabsContent value="rankings" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Community Rankings</h2>
              <p className="text-sm text-muted-foreground">See who's leading the fitness community this week</p>
            </div>
            <Select defaultValue="weekly">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Rankings</SelectItem>
                <SelectItem value="monthly">Monthly Rankings</SelectItem>
                <SelectItem value="alltime">All-time Rankings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {rankings.slice(0, 3).map((user) => (
              <Card
                key={user.id}
                className={`border-${user.rank === 1 ? "yellow" : user.rank === 2 ? "gray" : "amber"}-500/50`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-gray-400" : "bg-amber-700"
                        } text-white font-bold`}
                      >
                        {user.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={user.user.avatar || "/placeholder.svg"} alt={user.user.name} />
                        <AvatarFallback>{user.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy
                        className={`h-4 w-4 ${
                          user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-gray-400" : "text-amber-700"
                        }`}
                      />
                      <span className="font-bold">{user.points}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{user.user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Progress</span>
                        <span>{user.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-gray-400" : "bg-amber-700"
                          }`}
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Achievements</p>
                      <div className="flex flex-wrap gap-1">
                        {user.achievements.map((achievement, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top performers in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rankings.map((user) => (
                  <div key={user.id} className={`flex items-center p-3 rounded-md ${user.rank <= 3 ? "bg-muted" : ""}`}>
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        user.rank === 1
                          ? "bg-yellow-500"
                          : user.rank === 2
                            ? "bg-gray-400"
                            : user.rank === 3
                              ? "bg-amber-700"
                              : "bg-secondary"
                      } text-white text-xs font-bold mr-3`}
                    >
                      {user.rank}
                    </div>
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user.user.avatar || "/placeholder.svg"} alt={user.user.name} />
                      <AvatarFallback>{user.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.user.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{user.achievements[0]}</span>
                        {user.achievements.length > 1 && <span> +{user.achievements.length - 1} more</span>}
                      </div>
                    </div>
                    <div className="font-bold">{user.points}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Full Leaderboard
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Floating Chat System */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {/* Chat Panel */}
        {isChatPanelOpen && (
          <div className="w-80 bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col mb-2">
            <div className="border-b p-3 flex justify-between items-center">
              <h3 className="font-medium">Chats</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsChatPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {activeChatUser ? (
              <>
                <div className="border-b p-2 flex items-center">
                  <Button variant="ghost" size="sm" className="mr-2" onClick={() => setActiveChatUser(null)}>
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage
                      src={partners.find((p) => p.id === activeChatUser)?.avatar || "/placeholder.svg"}
                      alt={partners.find((p) => p.id === activeChatUser)?.name || "User"}
                    />
                    <AvatarFallback>
                      {partners.find((p) => p.id === activeChatUser)?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {partners.find((p) => p.id === activeChatUser)?.name || "User"}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 h-60 space-y-3">
                  {(chatMessages[activeChatUser] || []).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    (chatMessages[activeChatUser] || []).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 text-right mt-1">{message.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t p-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendDirectMessage(activeChatUser)
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={() => handleSendDirectMessage(activeChatUser)}
                      disabled={!currentMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="overflow-y-auto max-h-80">
                <div className="p-3 border-b">
                  <p className="text-sm text-muted-foreground">Connected Users</p>
                </div>
                {connections.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">No connections yet</p>
                    <p className="text-xs mt-1">Connect with users to start chatting</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {connections.map((connection) => {
                      const partnerId = connection.user1 === 1 ? connection.user2 : connection.user1
                      const partner = partners.find((p) => p.id === partnerId)
                      if (!partner) return null

                      return (
                        <div
                          key={connection.id}
                          className="p-2 hover:bg-accent cursor-pointer flex items-center"
                          onClick={() => setActiveChatUser(partnerId)}
                        >
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={partner.avatar || "/placeholder.svg"} alt={partner.name} />
                            <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{partner.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {chatMessages[partnerId] && chatMessages[partnerId].length > 0
                                ? chatMessages[partnerId][chatMessages[partnerId].length - 1].content.substring(0, 20) +
                                  "..."
                                : "Start a conversation"}
                            </p>
                          </div>
                          {chatMessages[partnerId] && chatMessages[partnerId].length > 0 && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Add James as a default connection for demo purposes */}
                    <div
                      className="p-2 hover:bg-accent cursor-pointer flex items-center"
                      onClick={() => setActiveChatUser(3)}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage
                          src={partners.find((p) => p.id === 3)?.avatar || "/placeholder.svg"}
                          alt="James Wilson"
                        />
                        <AvatarFallback>J</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">James Wilson</p>
                        <p className="text-xs text-muted-foreground">
                          {chatMessages[3] && chatMessages[3].length > 0
                            ? chatMessages[3][chatMessages[3].length - 1].content.substring(0, 20) + "..."
                            : "Start a conversation"}
                        </p>
                      </div>
                      {chatMessages[3] && chatMessages[3].length > 0 && (
                        <div className="ml-auto">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat Button */}
        <Button
          className="rounded-full h-12 w-12 shadow-lg flex items-center justify-center"
          onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
        >
          {isChatPanelOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          <span className="sr-only">Toggle chat</span>
        </Button>
      </div>
    </div>
  )
}
