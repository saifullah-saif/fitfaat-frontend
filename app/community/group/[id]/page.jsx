"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import {
  MessageSquare, Heart, Share2, MapPin, ImageIcon, Users, ArrowLeft, X, MoreHorizontal,
  Edit, Trash2, MoreVertical
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import { Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"


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


]

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number.parseInt(params.id)
  const [group, setGroup] = useState(null)
  const [groupPosts, setGroupPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [postFilter, setPostFilter] = useState("all")
  const [isJoined, setIsJoined] = useState(false)
  const [likedPosts, setLikedPosts] = useState([])
  const [newPost, setNewPost] = useState("")
  const [postImage, setPostImage] = useState(null)
  const [loading, setLoading] = useState(true)

  // Comment state variables
  const [postComments, setPostComments] = useState({})
  const [activeCommentSection, setActiveCommentSection] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState("")

  // Current user state
  const [currentUser, setCurrentUser] = useState(null)

  // Post edit and delete state variables
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [deletingPostId, setDeletingPostId] = useState(null)

  // Comment edit and delete dialog state variables
  const [isCommentEditDialogOpen, setIsCommentEditDialogOpen] = useState(false)
  const [isCommentDeleteDialogOpen, setIsCommentDeleteDialogOpen] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/community/group/${groupId}`, {
        withCredentials: true
      });

      const data = response.data;

      if (data.group) {
        setGroup(data.group);

        // Filter posts to only show approved ones
        const approvedPosts = data.posts ? data.posts.filter(
          post => post.admin_mod === undefined ||
                 post.admin_mod === null ||
                 post.admin_mod === 'Approved'
        ) : [];

        setGroupPosts(approvedPosts);
        setIsJoined(data.isMember);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);

      // Fallback to mock data if API fails
      const foundGroup = groups.find((g) => g.id === groupId);
      if (foundGroup) {
        setGroup(foundGroup);
        const filteredPosts = posts.filter((post) => post.group.id === groupId);
        setGroupPosts(filteredPosts);
        setIsJoined(groupId === 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    fetchCurrentUser();
  }, [groupId])

  // Filter posts based on the selected filter
  useEffect(() => {
    if (groupPosts.length > 0 && currentUser) {
      if (postFilter === "myPosts") {
        // Filter posts to show only the current user's posts
        const userPosts = groupPosts.filter(post =>
          post.user.username === currentUser.username ||
          post.user.name === `${currentUser.first_name} ${currentUser.last_name}`
        );
        setFilteredPosts(userPosts);
      } else {
        // Show all posts
        setFilteredPosts(groupPosts);
      }
    } else {
      setFilteredPosts(groupPosts);
    }
  }, [groupPosts, postFilter, currentUser]);

  // Fetch current user information
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/me", {
        withCredentials: true
      });

      if (response.data.user) {
        setCurrentUser(response.data.user);
        console.log(response.data)
        console.log(currentUser)
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };


  useEffect(() => {
    const fetchUserLikes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/community/userLikes", {
          withCredentials: true
        });

        const data = response.data;
        if (Array.isArray(data)) {
          setLikedPosts(data);
        }
      } catch (error) {
        console.error("Error fetching user likes:", error);
        // Not critical, so we don't show an error to the user
      }
    };

    fetchUserLikes();
  }, [])

  const handleJoinGroup = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/community/joinGroup",
        {
          groupId: groupId
        },
        {
          withCredentials: true
        }
      );

      const data = response.data;

      if (data.success) {
        setIsJoined(!isJoined);
        toast({
          title: isJoined ? "Group left" : "Group joined",
          description: isJoined ? `You have left ${group.name}.` : `You have successfully joined ${group.name}.`,
        });
      }
    } catch (error) {
      console.error("Error joining/leaving group:", error);

      // Fallback to client-side state change if API fails
      setIsJoined(!isJoined);
      toast({
        title: isJoined ? "Group left" : "Group joined",
        description: isJoined ? `You have left ${group.name}.` : `You have successfully joined ${group.name}.`,
      });
    }
  }

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/community/likePost",
        {
          postId
        },
        {
          withCredentials: true
        }
      );

      const data = response.data;

      if (data.success) {
        if (data.liked) {
          // Like the post
          setLikedPosts([...likedPosts, postId]);
          // Update the post likes count
          setGroupPosts(groupPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)));
        } else {
          // Unlike the post
          setLikedPosts(likedPosts.filter((id) => id !== postId));
          // Update the post likes count
          setGroupPosts(groupPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)));
        }
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);

      // Fallback to client-side state change if API fails
      if (likedPosts.includes(postId)) {
        // Unlike the post
        setLikedPosts(likedPosts.filter((id) => id !== postId));
        // Update the post likes count
        setGroupPosts(groupPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)));
      } else {
        // Like the post
        setLikedPosts([...likedPosts, postId]);
        // Update the post likes count
        setGroupPosts(groupPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)));
      }
    }
  }

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      if (activeCommentSection === postId && postComments[postId]?.length > 0) {
        setActiveCommentSection(null);
        return;
      }

      // Set active comment section
      setActiveCommentSection(postId);

      // If we already have comments for this post, no need to fetch again
      if (postComments[postId]?.length > 0) {
        return;
      }

      const response = await axios.get(`http://localhost:5000/community/comments/${postId}`, {
        withCredentials: true
      });

      // Filter comments to only show approved ones
      const approvedComments = response.data.filter(
        comment => comment.adminMod === undefined ||
                  comment.adminMod === null ||
                  comment.adminMod === 'Approved'
      );

      // Update the comments for this post
      setPostComments(prev => ({
        ...prev,
        [postId]: approvedComments
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add a new comment
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/community/comments",
        {
          postId,
          content: newComment
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Add the new comment to the comments list
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), response.data.comment]
        }));

        // Update the post's comment count
        setGroupPosts(groupPosts.map(post =>
          post.id === postId ? { ...post, comments: post.comments + 1 } : post
        ));

        // Clear the comment input
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to handle comment edit
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentContent(comment.content);
    setIsCommentEditDialogOpen(true);
  };

  // Function to save edited comment
  const handleSaveCommentEdit = async () => {
    if (!editingComment || !editCommentContent.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/community/comments/${editingComment.id}`,
        { content: editCommentContent },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the comment in the local state
        const updatedComment = response.data.comment;
        const postId = updatedComment.postId;

        setPostComments(prev => ({
          ...prev,
          [postId]: prev[postId].map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        }));

        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully.",
        });

        // Close the dialog and reset state
        setIsCommentEditDialogOpen(false);
        setEditingComment(null);
        setEditCommentContent("");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to handle comment delete
  const handleDeleteComment = (commentId) => {
    setDeletingCommentId(commentId);
    setIsCommentDeleteDialogOpen(true);
  };

  // Function to confirm comment deletion
  const handleConfirmCommentDelete = async () => {
    if (!deletingCommentId) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/community/comments/${deletingCommentId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Find which post this comment belongs to
        let postId = null;

        for (const [pid, comments] of Object.entries(postComments)) {
          if (comments.some(c => c.id === deletingCommentId)) {
            postId = parseInt(pid);
            break;
          }
        }

        if (postId) {
          // Remove the comment from the local state
          setPostComments(prev => ({
            ...prev,
            [postId]: prev[postId].filter(comment => comment.id !== deletingCommentId)
          }));

          // Update the comments count in the post
          setGroupPosts(prev =>
            prev.map(post =>
              post.id === postId
                ? { ...post, comments: Math.max((post.comments || 0) - 1, 0) }
                : post
            )
          );
        }

        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Close the dialog and reset state
      setIsCommentDeleteDialogOpen(false);
      setDeletingCommentId(null);
    }
  };

  // Handle comment button click
  const handleCommentPost = (postId) => {
    fetchComments(postId);
  }

  // Function to handle post edit
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setIsEditDialogOpen(true);
  }

  // Function to save edited post
  const handleSaveEdit = async () => {
    if (!editingPost || !editPostContent.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/community/post/${editingPost.id}`,
        { content: editPostContent },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the post in the local state
        const updatedPosts = groupPosts.map(post =>
          post.id === editingPost.id ? response.data.post : post
        );

        setGroupPosts(updatedPosts);

        // Also update filtered posts
        setFilteredPosts(filteredPosts.map(post =>
          post.id === editingPost.id ? response.data.post : post
        ));

        toast({
          title: "Post updated",
          description: "Your post has been updated successfully.",
        });

        // Close the dialog and reset state
        setIsEditDialogOpen(false);
        setEditingPost(null);
        setEditPostContent("");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Function to handle post delete confirmation
  const handleDeletePost = (postId) => {
    setDeletingPostId(postId);
    setIsDeleteDialogOpen(true);
  }

  // Function to confirm post deletion
  const handleConfirmDelete = async () => {
    if (!deletingPostId) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/community/post/${deletingPostId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove the post from the local state
        const updatedPosts = groupPosts.filter(post => post.id !== deletingPostId);
        setGroupPosts(updatedPosts);

        // Also update filtered posts
        setFilteredPosts(filteredPosts.filter(post => post.id !== deletingPostId));

        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Close the dialog and reset state
      setIsDeleteDialogOpen(false);
      setDeletingPostId(null);
    }
  }


  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    try {
      const response = await axios.post(
        "http://localhost:5000/community/createPost",
        {
          content: newPost,
          groupId: groupId,
          imageUrl: postImage
        },
        {
          withCredentials: true
        }
      );

      const data = response.data;

      if (data.success) {
        // Create a temporary post object to show immediately
        const newPostObj = {
          id: data.postId || Date.now(),
          user: {
            name: "You",
            avatar: "/placeholder.svg?height=40&width=40",
            username: "you",
          },
          content: newPost,
          image: data.imageUrl || postImage, // Use the server-returned image URL if available
          likes: 0,
          comments: 0,
          time: "Just now",
          group: {
            id: groupId,
            name: group.name,
          },
        };

        // Add the new post to the beginning of the posts array
        const updatedPosts = [newPostObj, ...groupPosts];
        setGroupPosts(updatedPosts);

        // Also update filtered posts if needed
        if (postFilter === "all" || postFilter === "myPosts") {
          setFilteredPosts([newPostObj, ...filteredPosts]);
        }

        toast({
          title: "Post created",
          description: "Your post has been published to the group.",
        });

        // Refresh the group data to get the updated post with server data
        setTimeout(() => {
          fetchGroupData();
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating post:", error);

      // Fallback to client-side state change if API fails
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
      };

      // Add the new post to the beginning of the posts array
      const updatedPosts = [newPostObj, ...groupPosts];
      setGroupPosts(updatedPosts);

      // Also update filtered posts if needed
      if (postFilter === "all" || postFilter === "myPosts") {
        setFilteredPosts([newPostObj, ...filteredPosts]);
      }

      toast({
        title: "Post created",
        description: "Your post has been published to the group.",
      });
    }

    // Reset form
    setNewPost("");
    setPostImage(null);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if file is too large (greater than 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 5MB or use the image compression option.",
          variant: "destructive"
        });
        return;
      }

      // Create a preview of the image
      const reader = new FileReader()
      reader.onload = (e) => {
        // Compress the image before setting it
        compressImage(e.target.result, file.type, (compressedImage) => {
          setPostImage(compressedImage)
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to compress images before upload
  const compressImage = (dataUrl, fileType, callback) => {
    const image = new Image();
    image.onload = function () {
      // Create a canvas element
      const canvas = document.createElement('canvas');

      // Calculate new dimensions (max 1200px width or height)
      let width = image.width;
      let height = image.height;
      const maxDimension = 1200;

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      // Get compressed image as data URL
      const quality = 0.7; // Adjust quality (0.7 = 70% quality)
      const compressedDataUrl = canvas.toDataURL(fileType, quality);

      callback(compressedDataUrl);
    };
    image.src = dataUrl;
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

          <div className="flex justify-between items-start">
            <div>
              <p className="mb-4">{group.description}</p>

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
                          src={postImage && postImage.startsWith('/uploads')
                            ? `http://localhost:5000${postImage}` // Server-side image path
                            : (postImage || "/placeholder.svg")} // Base64 or fallback
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Posts</h2>
            {postFilter === "myPosts" && (
              <Badge variant="secondary" className="ml-2">
                Showing your posts only
              </Badge>
            )}
          </div>
          <Select value={postFilter} onValueChange={(value) => setPostFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="myPosts">My Posts Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {postFilter === "myPosts" && groupPosts.length > 0 ? "You haven't posted in this group yet" : "No posts yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {postFilter === "myPosts" && groupPosts.length > 0
                ? "Create a post to share with the group!"
                : "Be the first to post in this group!"}
            </p>
            {!isJoined && <Button onClick={handleJoinGroup}>Join Group to Post</Button>}
          </div>
        ) : (
          filteredPosts.map((post) => (
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

                      {/* Show edit/delete options only for the user's own posts */}
                      {currentUser && post.user &&
                        (post.user.username === currentUser.username ||
                          post.user.name === `${currentUser.first_name} ${currentUser.last_name}`) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                    </div>
                    <p className="my-2">{post.content}</p>
                    {post.image && (
                      <div className="mt-2 mb-4">
                        <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                          <img
                            src={post.image.startsWith('/uploads')
                              ? `http://localhost:5000${post.image}` // Server-side image path
                              : (post.image || "/placeholder.svg")} // Base64 or fallback
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
                        className={`flex gap-1 ${activeCommentSection === post.id ? "bg-secondary" : ""}`}
                        onClick={() => handleCommentPost(post.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>

                    </div>

                    {/* Comment Section */}
                    {activeCommentSection === post.id && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Comments</h4>

                        {/* Comment List */}
                        <div className="space-y-3 mb-4">
                          {postComments[post.id]?.length > 0 ? (
                            postComments[post.id].map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-muted p-2 rounded-md">
                                    <div className="flex justify-between items-start">
                                      <div className="flex flex-row gap-1">
                                        <p className="text-xs font-medium">{comment.user.name}</p>
                                        <p className="text-xs text-muted-foreground">@{comment.user.username}</p>

                                      </div>

                                      {/* Comment Actions (Edit/Delete) - Only show for the comment owner */}
                                      {currentUser && comment.user &&
                                        (comment.user.username === currentUser.username ||
                                          comment.user.name === `${currentUser.first_name} ${currentUser.last_name}`) && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreVertical className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDeleteComment(comment.id)}
                                              >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                    </div>

                                    {/* Comment Content */}
                                    <p className="text-sm mt-1">{comment.content}</p>

                                    <div className="flex justify-between items-center mt-1">
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                      {comment.isEdited && (
                                        <p className="text-xs text-muted-foreground">edited</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                          )}
                        </div>

                        {/* Add Comment Form */}
                        <div className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/placeholder.svg?height=24&width=24" alt="Your avatar" />
                            <AvatarFallback>YA</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Add a comment..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              className="text-sm min-h-[60px] resize-none"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newComment.trim()}
                              >
                                Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post content below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Edit your post..."
              className="resize-none"
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editPostContent.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={isCommentEditDialogOpen} onOpenChange={setIsCommentEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
            <DialogDescription>
              Make changes to your comment below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Edit your comment..."
              className="resize-none"
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCommentEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCommentEdit} disabled={!editCommentContent.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirmation Dialog */}
      <Dialog open={isCommentDeleteDialogOpen} onOpenChange={setIsCommentDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCommentDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmCommentDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
