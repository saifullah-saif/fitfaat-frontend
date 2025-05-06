"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Heart, Share2, MapPin, ImageIcon, Users, ArrowLeft, X, MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  {
    id: 4,
    user: {
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "emmar",
    },
    content: "Early morning run today was amazing! The sunrise was absolutely beautiful. Who else is joining tomorrow?",
    image: "/placeholder.svg?height=300&width=500",
    likes: 31,
    comments: 7,
    time: "1 day ago",
    group: {
      id: 1,
      name: "Morning Runners Club",
    },
  },
  {
    id: 5,
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "davidk",
    },
    content: "Just tried this amazing vegan protein shake recipe. DM me if you want the details!",
    likes: 27,
    comments: 15,
    time: "2 days ago",
    group: {
      id: 2,
      name: "Vegan Fitness",
    },
  },
]

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number.parseInt(params.id)
  const [group, setGroup] = useState(null)
  const [groupPosts, setGroupPosts] = useState([])
  const [isJoined, setIsJoined] = useState(false)
  const [likedPosts, setLikedPosts] = useState([])
  const [newPost, setNewPost] = useState("")
  const [postImage, setPostImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rsvpStatus, setRsvpStatus] = useState(null) // null, 'interested', or 'going'
  const [eventRequestOpen, setEventRequestOpen] = useState(false)
  const [eventRequest, setEventRequest] = useState({ title: "", date: "", description: "" })

  useEffect(() => {
    // Simulate loading the group data
    const foundGroup = groups.find((g) => g.id === groupId)
    if (foundGroup) {
      setGroup(foundGroup)
      // Filter posts for this group
      const filteredPosts = posts.filter((post) => post.group.id === groupId)
      setGroupPosts(filteredPosts)

      // Check if user has joined this group (for demo, we'll say group 1 is joined)
      setIsJoined(groupId === 1)
    }
    setLoading(false)
  }, [groupId])

  const handleJoinGroup = () => {
    setIsJoined(!isJoined)
    toast({
      title: isJoined ? "Group left" : "Group joined",
      description: isJoined ? `You have left ${group.name}.` : `You have successfully joined ${group.name}.`,
    })
  }

  const handleLikePost = (postId) => {
    if (likedPosts.includes(postId)) {
      // Unlike the post
      setLikedPosts(likedPosts.filter((id) => id !== postId))
      // Update the post likes count
      setGroupPosts(groupPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)))
    } else {
      // Like the post
      setLikedPosts([...likedPosts, postId])
      // Update the post likes count
      setGroupPosts(groupPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    }
  }

  const handleCommentPost = (postId) => {
    toast({
      title: "Comment feature",
      description: "Comments will be implemented in a future update.",
    })
  }

  const handleSharePost = (postId) => {
    toast({
      title: "Post shared",
      description: "Post has been shared to your profile.",
    })
  }

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    // Create a new post
    const newPostObj = {
      id: Date.now(),
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "you",
      },
      content: newPost,
      image: postImage,
      likes: 0,
      comments: 0,
      time: "Just now",
      group: {
        id: groupId,
        name: group.name,
      },
    }

    // Add the new post to the beginning of the posts array
    setGroupPosts([newPostObj, ...groupPosts])

    toast({
      title: "Post created",
      description: "Your post has been published to the group.",
    })

    // Reset form
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

  const handleEventRequestSubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Event request submitted",
      description: "Your event request has been sent to the group administrators for review.",
    })
    setEventRequestOpen(false)
    setEventRequest({ title: "", date: "", description: "" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-muted-foreground mb-6">The group you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/community">Back to Community</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-4xl mx-auto w-full">
      <Link href="/community" className="flex items-center text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Community
      </Link>

      {/* Group Header */}
      <div className="bg-card rounded-lg overflow-hidden border mb-6">
        <div className="aspect-video relative bg-muted">
          <img
            src={group.image || "/placeholder.svg?height=300&width=600"}
            alt={group.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            <div className="flex items-center text-sm text-white/80 mt-2">
              <Users className="mr-1 h-4 w-4" />
              <span>{group.members} members</span>
              <span className="mx-2">•</span>
              <MapPin className="mr-1 h-4 w-4" />
              <span>{group.location}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Group Information</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="ml-2">Group Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEventRequestOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleJoinGroup}>
                  {isJoined ? (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Leave Group
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Join Group
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Event Request Dialog */}
          <Dialog open={eventRequestOpen} onOpenChange={setEventRequestOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request New Event</DialogTitle>
                <DialogDescription>Submit your event idea to the group administrators for review.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEventRequestSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      placeholder="Morning Run at Gulshan Park"
                      value={eventRequest.title}
                      onChange={(e) => setEventRequest({ ...eventRequest, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-date">Proposed Date & Time</Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={eventRequest.date}
                      onChange={(e) => setEventRequest({ ...eventRequest, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Describe your event idea..."
                      value={eventRequest.description}
                      onChange={(e) => setEventRequest({ ...eventRequest, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEventRequestOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="flex justify-between items-start">
            <div>
              <p className="mb-4">{group.description}</p>
              <div className="bg-muted rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Next Event</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={rsvpStatus === "interested" ? "default" : "outline"}
                      className={`text-xs px-2 py-1 h-auto ${rsvpStatus === "interested" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                      onClick={() => {
                        setRsvpStatus(rsvpStatus === "interested" ? null : "interested")
                        toast({
                          title: rsvpStatus === "interested" ? "Removed interest" : "Marked as interested",
                          description:
                            rsvpStatus === "interested"
                              ? "You're no longer marked as interested in this event."
                              : "You've been marked as interested in this event.",
                        })
                      }}
                    >
                      Interested
                    </Button>
                    <Button
                      size="sm"
                      variant={rsvpStatus === "going" ? "default" : "outline"}
                      className={`text-xs px-2 py-1 h-auto ${rsvpStatus === "going" ? "bg-green-500 hover:bg-green-600" : ""}`}
                      onClick={() => {
                        setRsvpStatus(rsvpStatus === "going" ? null : "going")
                        toast({
                          title: rsvpStatus === "going" ? "Removed RSVP" : "RSVP confirmed",
                          description:
                            rsvpStatus === "going"
                              ? "You're no longer marked as going to this event."
                              : "You've confirmed that you're going to this event.",
                        })
                      }}
                    >
                      Going
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{group.nextEvent}</p>
                {rsvpStatus && (
                  <div className="mt-2 text-xs">
                    <span className={`font-medium ${rsvpStatus === "interested" ? "text-blue-500" : "text-green-500"}`}>
                      You're {rsvpStatus === "interested" ? "interested in" : "going to"} this event
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Form - Only show if joined */}
      {isJoined && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
                  <AvatarFallback>YA</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={`Share something with ${group.name}...`}
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
      )}

      {/* Group Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Posts</h2>

        {groupPosts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to post in this group!</p>
            {!isJoined && <Button onClick={handleJoinGroup}>Join Group to Post</Button>}
          </div>
        ) : (
          groupPosts.map((post) => (
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
                          <p className="text-xs text-muted-foreground">{post.time}</p>
                        </div>
                      </div>
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
          ))
        )}
      </div>
    </div>
  )
}
