"use client"
import axios from "axios"
import { useState, useEffect, useCallback } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  MessageSquare,
  Heart,
  MapPin,
  ImageIcon,
  Send,
  Trophy,
  Users,
  Calendar,
  Filter,
  ChevronRight,
  MessageCircle,
  X,
  Search,
  User as UserIcon,
  Loader,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Upload
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ScrollArea } from "./ui/scroll-area"

// Maps location constants
const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

// Default center (will be updated with user's location)
const defaultCenter = {
  lat: 23.8103, // Dhaka coordinates
  lng: 90.4125,
}

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
}

// Connect with people
const connectionRequestsData = [
  { id: 2, status: "pending", sender: 1, receiver: 2, timestamp: "Just now" }, // Example - outgoing to Emma
]
const connectionsData = [
  { id: 3, user1: 1, user2: 3, timestamp: "Yesterday" }, // Example - already connected with James
]

// Define types for connection-related data
interface ConnectionRequest {
  id: number;
  status: string;
  sender: number;
  receiver: number;
  timestamp: string;
}

interface Connection {
  id: number;
  user1: number;
  user2: number;
  timestamp: string;
}



// Default partners data structure (will be replaced with API data)
const defaultPartners = [
  {
    id: 1,
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    location: { lat: 23.8103, lng: 90.4125 }, // Dhaka coordinates
    distance: "2.5 miles away",
    interests: ["Running", "Weightlifting", "Yoga"],
    level: "Intermediate",
    bio: "Fitness enthusiast looking for running partners on weekends.",
  }
]

// Default post data structure
const defaultPosts = [
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
  }
]

// Default group data structure
const defaultGroups = [
  {
    id: 1,
    name: "Morning Runners Club",
    members: 128,
    description: "Group for early morning runners. We organize weekly group runs.",
    image: "/placeholder.svg?height=100&width=100",
    location: "Dhaka, Bangladesh",

  }
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

  // Google Maps API loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  useEffect(() => {
    if (loadError) {
      console.error("Google Maps loading error:", loadError)
    }
  }, [loadError])

  const [activeTab, setActiveTab] = useState("feed")
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  // Map state
  const [map, setMap] = useState<any>(null)
  const [newPost, setNewPost] = useState("")
  const [postImage, setPostImage] = useState<any>(null)
  const [distance, setDistance] = useState([10])
  const [interests, setInterests] = useState("all")
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [joinedGroups, setJoinedGroups] = useState<number[]>([1]) // Start with one group joined
  const [groupFilter, setGroupFilter] = useState<"all" | "joined" | "myPosts">("all")
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [newGroupLocation, setNewGroupLocation] = useState("")
  const [newGroupImage, setNewGroupImage] = useState<any>(null)
  const [connectionRequests, setConnectionRequests] = useState(connectionRequestsData)
  const [connections, setConnections] = useState(connectionsData)
  const [selectedMarker, setSelectedMarker] = useState<any>(null) // map marker selector
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [activeChatUser, setActiveChatUser] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<Record<string | number, any[]>>({})
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  // const [isApplyingFilters, setIsApplyingFilters] = useState(false) // Commented out as it's not currently used
  const [userLocation, setUserLocation] = useState(defaultCenter)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // State for edit and delete functionality
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)

  // State for disconnect partner confirmation
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false)
  const [disconnectingPartnerId, setDisconnectingPartnerId] = useState<number | null>(null)

  // State for comments functionality
  const [postComments, setPostComments] = useState<Record<number, any[]>>({})
  const [expandedComments, setExpandedComments] = useState<number[]>([])
  const [commentContent, setCommentContent] = useState<Record<number, string>>({})
  const [isLoadingComments, setIsLoadingComments] = useState<Record<number, boolean>>({})
  const [editingComment, setEditingComment] = useState<any>(null)
  const [editCommentContent, setEditCommentContent] = useState("")
  const [isCommentEditDialogOpen, setIsCommentEditDialogOpen] = useState(false)
  const [isCommentDeleteDialogOpen, setIsCommentDeleteDialogOpen] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)

  // State for notification counts
  const [unreadMessages, setUnreadMessages] = useState<Record<number, number>>({})
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)
  const [pendingConnectionRequests, setPendingConnectionRequests] = useState(0)

  // State for real-time functionality
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null)
  const [lastConnectionRequestTimestamp, setLastConnectionRequestTimestamp] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // State for posts, groups, and partners from API
  const [posts, setPosts] = useState<any[]>(defaultPosts)
  const [groups, setGroups] = useState<any[]>(defaultGroups)
  const [partners, setPartners] = useState<any[]>(defaultPartners)

  // Get current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("fitfaat_user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setCurrentUser(userData)
        console.log(userData)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // check connection between current user and partner
  const getConnectionStatus = (
    partnerId: number,
    connectionRequests: ConnectionRequest[],
    connections: Connection[]
  ): "connected" | "pending-outgoing" | "pending-incoming" | "none" => {
    const userId = currentUser?.user_id;

    if (!userId) return "none";

    // Check if already connected
    const existingConnection = connections.find(
      (c) => (c.user1 === userId && c.user2 === partnerId) || (c.user1 === partnerId && c.user2 === userId),
    )
    if (existingConnection) return "connected"

    // Check for pending requests
    const outgoingRequest = connectionRequests.find(
      (r) => r.sender === userId && r.receiver === partnerId && r.status === "pending",
    )
    if (outgoingRequest) return "pending-outgoing"

    const incomingRequest = connectionRequests.find(
      (r) => r.sender === partnerId && r.receiver === userId && r.status === "pending",
    )
    if (incomingRequest) return "pending-incoming"

    return "none"
  }

  // Fetch partners from API when filters change
  useEffect(() => {
    if (activeTab === "partners") {
      fetchPartners();
    }
  }, [distance, interests]);

  // Fetch partners when the page loads
  useEffect(() => {
    if (currentUser) {
      fetchPartners();
    }
  }, [currentUser]);

  // Function to calculate bounds for all markers
  const calculateBounds = (locations: Array<{ location: { lat: number, lng: number } }>) => {
    if (!locations || locations.length === 0 || !google || !google.maps) return null;

    const bounds = new google.maps.LatLngBounds();

    // Add user location to bounds
    bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));

    // Add all partner locations to bounds
    locations.forEach(item => {
      if (item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number') {
        bounds.extend(new google.maps.LatLng(item.location.lat, item.location.lng));
      }
    });

    return bounds;
  };

  // Function to fetch partners with filters
  const fetchPartners = async () => {
    setIsLoadingPartners(true);
    try {
      // Always try to get geolocation regardless of active tab
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newUserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            // Update state with the new location
            setUserLocation(newUserLocation);
            setMapCenter(newUserLocation);

            // Update the user's location in the database
            try {
              await axios.post(`http://localhost:5000/community/updateLocation`, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }, {
                withCredentials: true
              });

              console.log("Location updated successfully");
            } catch (locationError) {
              console.error("Error updating location:", locationError);
            }

            // Now fetch partners with the updated location
            fetchPartnersWithFilters();
          },
          (error) => {
            // Create a more user-friendly error message based on the error code
            let errorMessage = "Geolocation error";

            if (error.code === 1) {
              errorMessage = "Location access denied. Please enable location services in your browser settings.";
            } else if (error.code === 2) {
              errorMessage = "Location unavailable. Please try again later.";
            } else if (error.code === 3) {
              errorMessage = "Location request timed out. Please try again later.";
            }

            // Log the detailed error for debugging
            console.error(`Geolocation error (${error.code}): ${errorMessage}`, error);

            // Show a toast notification to inform the user
            toast({
              title: "Location Error",
              description: errorMessage,
              variant: "destructive"
            });

            // Continue with fetching partners even if geolocation fails
            fetchPartnersWithFilters();
          },
          { timeout: 10000 }
        );
      } else {
        // If geolocation is not available in the browser
        console.error("Geolocation is not supported by this browser");

        // Show a toast notification to inform the user
        toast({
          title: "Location Not Available",
          description: "Geolocation is not supported by your browser. Some features may be limited.",
          variant: "destructive"
        });

        // Continue with fetching partners with default location
        fetchPartnersWithFilters();
      }
    } catch (error) {
      console.error("Error in fetchPartners:", error);

      // Show a toast notification for the general error
      toast({
        title: "Error",
        description: "Failed to fetch partners. Please try again later.",
        variant: "destructive"
      });

      setIsLoadingPartners(false);
    }
  }


  const fetchPartnersWithFilters = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/community/fetchPartners`, {
        params: {
          distance: distance[0], // Get the first value from the distance array
          interest: interests
        },
        withCredentials: true
      });

      if (response.data && Array.isArray(response.data)) {
        const partnersData = response.data;
        setPartners(partnersData);

        // Calculate bounds for all markers if we have partners and Google Maps is loaded
        if (isLoaded && partnersData.length > 0 && google && google.maps && map) {
          // Wait for the next render cycle to ensure partners state is updated
          setTimeout(() => {
            const bounds = calculateBounds(partnersData);
            if (bounds) {
              // Fit the map to the bounds
              map.fitBounds(bounds);

              // If there's only one marker (just the user), zoom out a bit
              if (partnersData.length === 0) {
                map.setZoom(14); // Default zoom level for single marker
              }
            }
          }, 0);
        }
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: "Error",
        description: "Failed to load partners. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPartners(false);
    }
  }

  // Function to handle filter application - used when Apply button is clicked
  // This is kept for future use if an Apply button is added to the UI
  /*
  const handleApplyFilters = () => {
    setIsApplyingFilters(true);

    // Use the helper function directly to avoid triggering geolocation again
    fetchPartnersWithFilters().then(() => {
      setIsApplyingFilters(false);

      toast({
        title: "Filters applied",
        description: `Showing partners within ${distance[0]} miles${interests !== 'all' ? ` interested in ${interests}` : ''}`,
      });
    }).catch(error => {
      console.error("Error applying filters:", error);
      setIsApplyingFilters(false);

      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive"
      });
    });
  }
  */


  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/community/fetchAllPosts");
        if (response.data && Array.isArray(response.data)) {
          setPosts(response.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get("http://localhost:5000/community/fetchAllGroups");
        if (response.data && Array.isArray(response.data)) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  // Fetch user's joined groups
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await axios.get("http://localhost:5000/community/userGroups", {
          withCredentials: true
        });
        if (response.data && Array.isArray(response.data)) {
          setJoinedGroups(response.data);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
        // If there's an error (like user not authenticated), we'll keep the default joined groups
      }
    };

    fetchUserGroups();
  }, []);

  // Fetch user's liked posts
  useEffect(() => {
    const fetchUserLikes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/community/userLikes", {
          withCredentials: true
        });
        if (response.data && Array.isArray(response.data)) {
          setLikedPosts(response.data);
        }
      } catch (error) {
        console.error("Error fetching user likes:", error);
        // If there's an error, we'll keep the default liked posts state
      }
    };

    fetchUserLikes();
  }, []);

  // Fetch connection requests and connections
  useEffect(() => {
    const fetchConnectionData = async () => {
      try {
        // Fetch connection requests
        const requestsResponse = await axios.get("http://localhost:5000/community/connectionRequests", {
          withCredentials: true
        });

        if (requestsResponse.data && Array.isArray(requestsResponse.data)) {
          const requests = requestsResponse.data.map((req: any) => ({
            id: req.id,
            sender: req.sender.id,
            receiver: req.user?.id || currentUser?.user_id,
            status: "pending",
            timestamp: req.timestamp
          }));

          setConnectionRequests(requests);

          // Get the latest connection request timestamp for future polling
          if (requestsResponse.data.length > 0) {
            const latestTimestamp = requestsResponse.data.reduce((latest: string, req: any) => {
              const reqTime = req.timestamp;
              return reqTime > latest ? reqTime : latest;
            }, "");

            setLastConnectionRequestTimestamp(latestTimestamp);
          }

          // Count pending incoming connection requests for notification
          const incomingRequests = requests.filter(
            req => req.receiver === currentUser?.user_id && req.status === "pending"
          );
          setPendingConnectionRequests(incomingRequests.length);

          // Update total unread count
          const messageCount = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
          setTotalUnreadCount(messageCount + incomingRequests.length);
        }

        // Fetch connections
        const connectionsResponse = await axios.get("http://localhost:5000/community/connections", {
          withCredentials: true
        });

        if (connectionsResponse.data && Array.isArray(connectionsResponse.data)) {
          setConnections(connectionsResponse.data.map((conn: any) => ({
            id: conn.id,
            user1: currentUser?.user_id,
            user2: conn.user.id,
            timestamp: conn.timestamp
          })));
        }
      } catch (error) {
        console.error("Error fetching connection data:", error);
      }
    };

    if (currentUser) {
      fetchConnectionData();
    }
  }, [currentUser, unreadMessages]);

  // Function to fetch new messages
  const fetchNewMessages = useCallback(async () => {
    try {
      // Add timestamp parameter to only fetch messages after the last fetch
      const params = lastMessageTimestamp ? { since: lastMessageTimestamp } : {};

      const response = await axios.get("http://localhost:5000/community/conversations", {
        withCredentials: true,
        params
      });

      if (response.data && Array.isArray(response.data)) {
        // If we have new messages, update the conversations
        if (response.data.length > 0) {
          // Get the latest timestamp from the messages
          const latestTimestamp = response.data.reduce((latest: string, conv: any) => {
            const msgTime = conv.lastMessage.sent_at;
            return msgTime > latest ? msgTime : latest;
          }, lastMessageTimestamp || "");

          // Update the timestamp for the next poll
          setLastMessageTimestamp(latestTimestamp);

          // Update conversations
          setConversations(prevConversations => {
            // Create a map of existing conversations for easy lookup
            const existingConvMap = new Map(
              prevConversations.map(conv => [conv.partner.id, conv])
            );

            // Update or add new conversations
            response.data.forEach((newConv: any) => {
              existingConvMap.set(newConv.partner.id, newConv);
            });

            // Convert back to array and sort by last message time
            return Array.from(existingConvMap.values())
              .sort((a, b) =>
                new Date(b.lastMessage.sent_at).getTime() -
                new Date(a.lastMessage.sent_at).getTime()
              );
          });

          // Process unread messages
          let newUnreadMessages: Record<number, number> = { ...unreadMessages };

          response.data.forEach((conversation: any) => {
            if (conversation.unreadCount && conversation.unreadCount > 0) {
              newUnreadMessages[conversation.partner.id] = conversation.unreadCount;
            }
          });

          // Calculate total unread messages
          const totalUnread = Object.values(newUnreadMessages).reduce((sum, count) => sum + count, 0);

          setUnreadMessages(newUnreadMessages);

          // Update total unread count (messages + connection requests)
          setTotalUnreadCount(totalUnread + pendingConnectionRequests);

          // If the active chat user has new messages, fetch them
          if (activeChatUser && response.data.some((conv: any) => conv.partner.id === activeChatUser)) {
            // Use the existing fetchMessages function from the useEffect below
            const fetchMessages = async (partnerId: number) => {
              if (!partnerId || !currentUser) return;
              setIsLoadingMessages(true);
              try {
                const response = await axios.get(`http://localhost:5000/community/messages/${partnerId}`, {
                  withCredentials: true
                });
                if (response.data && Array.isArray(response.data)) {
                  setChatMessages(prev => ({
                    ...prev,
                    [partnerId]: response.data
                  }));
                }
              } catch (error) {
                console.error(`Error fetching messages for partner ${partnerId}:`, error);
              } finally {
                setIsLoadingMessages(false);
              }
            };
            fetchMessages(activeChatUser);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching new messages:", error);
    }
  }, [lastMessageTimestamp, activeChatUser, currentUser, pendingConnectionRequests, unreadMessages]);

  // Function to fetch new connection requests
  const fetchNewConnectionRequests = useCallback(async () => {
    try {
      // Add timestamp parameter to only fetch requests after the last fetch
      const params = lastConnectionRequestTimestamp ? { since: lastConnectionRequestTimestamp } : {};

      const response = await axios.get("http://localhost:5000/community/connectionRequests", {
        withCredentials: true,
        params
      });

      if (response.data && Array.isArray(response.data)) {
        // If we have new requests, update the state
        if (response.data.length > 0) {
          // Get the latest timestamp from the requests
          const latestTimestamp = response.data.reduce((latest: string, req: any) => {
            const reqTime = req.timestamp;
            return reqTime > latest ? reqTime : latest;
          }, lastConnectionRequestTimestamp || "");

          // Update the timestamp for the next poll
          setLastConnectionRequestTimestamp(latestTimestamp);

          // Update connection requests
          setConnectionRequests(prevRequests => {
            // Create a map of existing requests for easy lookup
            const existingReqMap = new Map(
              prevRequests.map(req => [`${req.sender}-${req.receiver}`, req])
            );

            // Update or add new requests
            response.data.forEach((newReq: any) => {
              existingReqMap.set(`${newReq.sender}-${newReq.receiver}`, newReq);
            });

            // Convert back to array
            return Array.from(existingReqMap.values());
          });

          // Count pending incoming requests
          const incomingRequests = response.data.filter(
            (req: any) => req.receiver === currentUser?.user_id && req.status === "pending"
          );

          if (incomingRequests.length > 0) {
            setPendingConnectionRequests(prev => prev + incomingRequests.length);
            setTotalUnreadCount(prev => prev + incomingRequests.length);

            // Show notification for new connection requests
            toast({
              title: "New Connection Request",
              description: "You have received a new connection request.",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching new connection requests:", error);
    }
  }, [lastConnectionRequestTimestamp, currentUser]);

  // Fetch chat conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/community/conversations", {
          withCredentials: true
        });

        if (response.data && Array.isArray(response.data)) {
          setConversations(response.data);

          // Get the latest message timestamp for future polling
          if (response.data.length > 0) {
            const latestTimestamp = response.data.reduce((latest: string, conv: any) => {
              const msgTime = conv.lastMessage.sent_at;
              return msgTime > latest ? msgTime : latest;
            }, "");

            setLastMessageTimestamp(latestTimestamp);
          }

          // Check for unread messages in each conversation
          let newUnreadMessages: Record<number, number> = {};
          let totalUnread = 0;

          response.data.forEach((conversation: any) => {
            if (conversation.unreadCount && conversation.unreadCount > 0) {
              newUnreadMessages[conversation.partner.id] = conversation.unreadCount;
              totalUnread += conversation.unreadCount;
            }
          });

          setUnreadMessages(newUnreadMessages);

          // Update total unread count (messages + connection requests)
          setTotalUnreadCount(totalUnread + pendingConnectionRequests);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, pendingConnectionRequests]);

  // Fetch messages when a chat is opened
  useEffect(() => {
    const fetchMessages = async (partnerId: number) => {
      if (!partnerId || !currentUser) return;

      setIsLoadingMessages(true);

      try {
        const response = await axios.get(`http://localhost:5000/community/messages/${partnerId}`, {
          withCredentials: true
        });

        if (response.data && Array.isArray(response.data)) {
          setChatMessages(prev => ({
            ...prev,
            [partnerId]: response.data
          }));
        }
      } catch (error) {
        console.error(`Error fetching messages for partner ${partnerId}:`, error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };

    // Fetch messages when selected partner changes
    if (selectedPartner) {
      fetchMessages(selectedPartner.id);
    }

    // Fetch messages when active chat user changes
    if (activeChatUser) {
      fetchMessages(activeChatUser);
    }

  }, [selectedPartner, activeChatUser, currentUser]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Only set up polling if user is logged in
    if (!currentUser) return;

    console.log("Setting up real-time polling");

    // Start polling every 5 seconds
    const interval = setInterval(() => {
      fetchNewMessages();
      fetchNewConnectionRequests();
    }, 5000); // 5 seconds interval

    // Store the interval ID for cleanup
    setPollingInterval(interval);

    // Clean up on unmount
    return () => {
      console.log("Cleaning up real-time polling");
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentUser, fetchNewMessages, fetchNewConnectionRequests]);



  // Callback for when the map loads
  const onMapLoad = useCallback((map: any) => {
    setMap(map)

    // If we already have partners, fit the map to show all markers
    if (partners.length > 0 && google && google.maps) {
      const bounds = calculateBounds(partners);
      if (bounds) {
        map.fitBounds(bounds);
      }
    }
  }, [partners])



  const handleConnectionRequest = async (partnerId: number, action: 'send' | 'accept' | 'reject' = 'send') => {
    const status = getConnectionStatus(partnerId, connectionRequests, connections)

    try {
      if (action === 'reject') {
        // Find the request
        const request = connectionRequests.find(
          (req) => req.sender === partnerId && req.receiver === currentUser?.user_id
        );

        if (request) {
          // Reject the request
          const response = await axios.post(
            "http://localhost:5000/community/respondToConnectionRequest",
            {
              requestId: request.id,
              action: "reject"
            },
            { withCredentials: true }
          );

          if (response.data.success) {
            // Update local state
            setConnectionRequests(connectionRequests.filter(
              (req) => !(req.sender === partnerId && req.receiver === currentUser?.user_id)
            ));

            // Update notification counts
            setPendingConnectionRequests(prev => Math.max(prev - 1, 0));
            setTotalUnreadCount(prev => Math.max(prev - 1, 0));

            toast({
              title: "Request rejected",
              description: "You have rejected the connection request.",
            });

            // Add notification to chat if in chat with this partner
            if (selectedPartner && selectedPartner.id === partnerId) {
              const notificationMessage = {
                id: Date.now(),
                sender: "system",
                content: "You rejected the connection request.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }

              setChatMessages((prev) => ({
                ...prev,
                [partnerId]: [...(prev[partnerId] || []), notificationMessage],
              }));

              // Close the chat dialog if open
              if (chatOpen) {
                setChatOpen(false);
              }
            }
          }
        }
        return;
      }

      if (status === "none" && action === 'send') {
        // Send connection request
        const response = await axios.post(
          "http://localhost:5000/community/sendConnectionRequest",
          { receiverId: partnerId },
          { withCredentials: true }
        );

        if (response.data.success) {
          // Add the request to local state
          const newRequest = {
            id: response.data.request_id,
            status: "pending",
            sender: currentUser?.user_id,
            receiver: partnerId,
            timestamp: "Just now",
          }
          setConnectionRequests([...connectionRequests, newRequest])

          toast({
            title: "Connection request sent",
            description: "Your request has been sent to the user.",
          })

          // Add notification to chat
          if (selectedPartner && selectedPartner.id === partnerId) {
            const notificationMessage = {
              id: Date.now(),
              sender: "system",
              content: "You sent a connection request to this user.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }

            setChatMessages((prev) => ({
              ...prev,
              [partnerId]: [...(prev[partnerId] || []), notificationMessage],
            }))
          }
        }
      } else if (status === "pending-incoming" && action === 'accept') {
        // Find the request ID
        const request = connectionRequests.find(
          (req) => req.sender === partnerId && req.receiver === currentUser?.user_id
        );

        if (!request) {
          throw new Error("Request not found");
        }

        // Accept connection request
        const response = await axios.post(
          "http://localhost:5000/community/respondToConnectionRequest",
          {
            requestId: request.id,
            action: "accept"
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          // Update local state
          const updatedRequests = connectionRequests.filter(
            (req) => !(req.sender === partnerId && req.receiver === currentUser?.user_id)
          );
          setConnectionRequests(updatedRequests);

          const newConnection = {
            id: Date.now(),
            user1: currentUser?.user_id,
            user2: partnerId,
            timestamp: "Just now",
          }
          setConnections([...connections, newConnection]);

          // Update notification counts
          setPendingConnectionRequests(prev => Math.max(prev - 1, 0));
          setTotalUnreadCount(prev => Math.max(prev - 1, 0));

          toast({
            title: "Connection request accepted",
            description: "You are now connected with the user.",
          })

          // Add notification to chat
          if (selectedPartner && selectedPartner.id === partnerId) {
            const notificationMessage = {
              id: Date.now(),
              sender: "system",
              content: "You accepted the connection request. You are now connected!",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }

            setChatMessages((prev) => ({
              ...prev,
              [partnerId]: [...(prev[partnerId] || []), notificationMessage],
            }))
          }
        }
      } else if (status === "connected") {
        toast({
          title: "Already connected",
          description: "You are already connected with this user.",
        })
      } else if (status === "pending-outgoing") {
        toast({
          title: "Request pending",
          description: "Your connection request is still pending.",
        })
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
      toast({
        title: "Error",
        description: "Failed to process connection request. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to show disconnect confirmation dialog
  const handleDisconnectPartner = (partnerId: number) => {
    setDisconnectingPartnerId(partnerId);
    setIsDisconnectDialogOpen(true);
  }

  // Function to confirm and execute partner disconnection
  const handleConfirmDisconnect = async () => {
    if (!disconnectingPartnerId) return;

    try {
      // Call the API to disconnect
      const response = await axios.post(
        "http://localhost:5000/community/disconnectPartner",
        { partnerId: disconnectingPartnerId },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove the connection from local state
        const updatedConnections = connections.filter(
          (conn) => !((conn.user1 === currentUser?.user_id && conn.user2 === disconnectingPartnerId) ||
            (conn.user1 === disconnectingPartnerId && conn.user2 === currentUser?.user_id))
        );
        setConnections(updatedConnections);

        toast({
          title: "Disconnected",
          description: "You have disconnected from this user.",
        });

        // Add notification to chat
        if (selectedPartner && selectedPartner.id === disconnectingPartnerId) {
          const notificationMessage = {
            id: Date.now(),
            sender: "system",
            content: "You have disconnected from this user.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }

          setChatMessages((prev) => ({
            ...prev,
            [disconnectingPartnerId]: [...(prev[disconnectingPartnerId] || []), notificationMessage],
          }));
        }
      }
    } catch (error) {
      console.error("Error disconnecting partner:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect from this user. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Close the dialog and reset state
      setIsDisconnectDialogOpen(false);
      setDisconnectingPartnerId(null);
    }
  }

  // Mock map implementation - only used if Google Maps fails to load


  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedPartner) return

    // Check connection status
    const status = getConnectionStatus(selectedPartner.id, connectionRequests, connections)

    // If users are not connected, show a system message
    if (status !== "connected") {
      // Create a temporary message to show immediately
      const tempMessage = {
        id: Date.now(),
        sender: "me",
        content: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMessages((prev) => ({
        ...prev,
        [selectedPartner.id]: [...(prev[selectedPartner.id] || []), tempMessage],
      }))
      setChatMessage("")

      // Add appropriate system message based on connection status
      setTimeout(() => {
        let systemMessage;

        if (status === "none") {
          systemMessage = {
            id: Date.now() + 1,
            sender: "system",
            content: "You're not connected with this user yet. Would you like to send a connection request?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionButtons: true
          }
        } else if (status === "pending-outgoing") {
          systemMessage = {
            id: Date.now() + 1,
            sender: "system",
            content: "You've already sent a connection request to this user. Waiting for them to accept.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        } else if (status === "pending-incoming") {
          systemMessage = {
            id: Date.now() + 1,
            sender: "system",
            content: "This user has sent you a connection request. Accept to connect with them.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        }

        if (systemMessage) {
          setChatMessages((prev) => ({
            ...prev,
            [selectedPartner.id]: [...(prev[selectedPartner.id] || []), systemMessage],
          }))
        }
      }, 500)

      return;
    }

    // For connected users, send the message to the API
    try {
      // Optimistically add the message to the UI
      const tempMessage = {
        id: Date.now(),
        sender: "me",
        content: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMessages((prev) => ({
        ...prev,
        [selectedPartner.id]: [...(prev[selectedPartner.id] || []), tempMessage],
      }))

      // Clear the input field
      setChatMessage("")

      // Send the message to the API
      const response = await axios.post(
        "http://localhost:5000/community/sendMessage",
        {
          receiverId: selectedPartner.id,
          content: chatMessage
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the conversations list with the new message
        setConversations(prevConversations => {
          // Find the conversation with this partner
          const updatedConversations = [...prevConversations];
          const conversationIndex = updatedConversations.findIndex(
            conv => conv.partner.id === selectedPartner.id
          );

          if (conversationIndex !== -1) {
            // Update the last message
            updatedConversations[conversationIndex] = {
              ...updatedConversations[conversationIndex],
              lastMessage: {
                content: chatMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                sent_at: new Date().toISOString()
              }
            };

            // Move this conversation to the top
            const conversation = updatedConversations.splice(conversationIndex, 1)[0];
            updatedConversations.unshift(conversation);
          }

          return updatedConversations;
        });
      } else {
        // If the API call fails, show an error
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    try {
      // Default to the first group if user hasn't joined any groups
      const groupId = joinedGroups.length > 0 ? joinedGroups[0] : 1;

      // Show loading toast
      toast({
        title: "Creating post...",
        description: "Your post is being uploaded.",
      });

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

      if (response.data.success) {
        // Create a temporary post to show immediately
        const tempPost = {
          id: response.data.postId,
          user: {
            name: currentUser?.first_name + " " + currentUser?.last_name || "You",
            avatar: currentUser?.profile_picture || "/placeholder.svg",
            username: currentUser?.username || "you"
          },
          content: newPost,
          image: response.data.imageUrl || postImage, // Use the server-returned image URL
          likes: 0,
          comments: 0,
          time: "Just now",
          group: {
            id: groupId,
            name: groups.find(g => g.id === groupId)?.name || "Your Group"
          }
        };

        // Add the new post to the beginning of the posts array
        setPosts([tempPost, ...posts]);

        toast({
          title: "Post created",
          description: "Your post has been published to the community feed.",
        });

        // Refresh posts after a short delay to get the server-formatted data
        setTimeout(async () => {
          try {
            const postsResponse = await axios.get("http://localhost:5000/community/fetchAllPosts");
            if (postsResponse.data && Array.isArray(postsResponse.data)) {
              setPosts(postsResponse.data);
            }
          } catch (refreshError) {
            console.error("Error refreshing posts:", refreshError);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }

    setNewPost("")
    setPostImage(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          setPostImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleJoinGroup = async (group: any) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/community/joinGroup",
        {
          groupId: group.id
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        if (response.data.joined) {
          // Join the group
          setJoinedGroups([...joinedGroups, group.id]);
          toast({
            title: "Group joined",
            description: `You have successfully joined ${group.name}.`,
          });
        } else {
          // Leave the group
          setJoinedGroups(joinedGroups.filter((id) => id !== group.id));
          toast({
            title: "Group left",
            description: `You have left ${group.name}.`,
          });
        }
      }
    } catch (error) {
      console.error("Error joining/leaving group:", error);

      // Fallback to client-side state change if API fails
      if (joinedGroups.includes(group.id)) {
        // Leave the group
        setJoinedGroups(joinedGroups.filter((id) => id !== group.id));
        toast({
          title: "Group left",
          description: `You have left ${group.name}.`,
        });
      } else {
        // Join the group
        setJoinedGroups([...joinedGroups, group.id]);
        toast({
          title: "Group joined",
          description: `You have successfully joined ${group.name}.`,
        });
      }
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/community/createGroup",
        {
          name: newGroupName,
          description: newGroupDescription,
          location: newGroupLocation,
          imageUrl: newGroupImage
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Add the new group to the groups list
        if (response.data.group) {
          setGroups([response.data.group, ...groups]);
          // Add the group to joined groups
          setJoinedGroups([...joinedGroups, response.data.group.id]);
        } else {
          // Refresh groups after a short delay to get the server-formatted data
          setTimeout(async () => {
            try {
              const groupsResponse = await axios.get("http://localhost:5000/community/fetchAllGroups");
              if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
                setGroups(groupsResponse.data);
              }

              const userGroupsResponse = await axios.get("http://localhost:5000/community/userGroups", {
                withCredentials: true
              });
              if (userGroupsResponse.data && Array.isArray(userGroupsResponse.data)) {
                setJoinedGroups(userGroupsResponse.data);
              }
            } catch (refreshError) {
              console.error("Error refreshing groups:", refreshError);
            }
          }, 1000);
        }

        // Reset form and close modal
        setNewGroupName("");
        setNewGroupDescription("");
        setNewGroupLocation("");
        setNewGroupImage(null);
        setCreateGroupOpen(false);

        toast({
          title: "Success",
          description: "Group created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleLikePost = async (postId: number) => {
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

      if (response.data.success) {
        if (response.data.liked) {
          // Like the post
          setLikedPosts([...likedPosts, postId]);
          // Find the post and increment its likes
          const updatedPosts = [...posts];
          const postIndex = updatedPosts.findIndex((post) => post.id === postId);
          if (postIndex !== -1) {
            updatedPosts[postIndex] = {
              ...updatedPosts[postIndex],
              likes: updatedPosts[postIndex].likes + 1,
            };
            setPosts(updatedPosts);
          }
        } else {
          // Unlike the post
          setLikedPosts(likedPosts.filter((id) => id !== postId));
          // Find the post and decrement its likes
          const updatedPosts = [...posts];
          const postIndex = updatedPosts.findIndex((post) => post.id === postId);
          if (postIndex !== -1) {
            updatedPosts[postIndex] = {
              ...updatedPosts[postIndex],
              likes: updatedPosts[postIndex].likes - 1,
            };
            setPosts(updatedPosts);
          }
        }
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);

      // Fallback to client-side state change if API fails
      if (likedPosts.includes(postId)) {
        // Unlike the post
        setLikedPosts(likedPosts.filter((id) => id !== postId));
        // Find the post and decrement its likes
        const updatedPosts = [...posts];
        const postIndex = updatedPosts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            likes: updatedPosts[postIndex].likes - 1,
          };
          setPosts(updatedPosts);
        }
      } else {
        // Like the post
        setLikedPosts([...likedPosts, postId]);
        // Find the post and increment its likes
        const updatedPosts = [...posts];
        const postIndex = updatedPosts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            likes: updatedPosts[postIndex].likes + 1,
          };
          setPosts(updatedPosts);
        }
      }
    }
  }





  // Function to handle post edit
  const handleEditPost = (post: any) => {
    setEditingPost(post)
    setEditPostContent(post.content)
    setIsEditDialogOpen(true)
  }

  // Function to save edited post
  const handleSaveEdit = async () => {
    if (!editingPost || !editPostContent.trim()) return

    try {
      const response = await axios.put(
        `http://localhost:5000/community/post/${editingPost.id}`,
        { content: editPostContent },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Update the post in the local state
        const updatedPosts = posts.map(post =>
          post.id === editingPost.id ? response.data.post : post
        )

        setPosts(updatedPosts)

        toast({
          title: "Post updated",
          description: "Your post has been updated successfully.",
        })

        // Close the dialog and reset state
        setIsEditDialogOpen(false)
        setEditingPost(null)
        setEditPostContent("")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to handle post delete confirmation
  const handleDeletePost = (postId: number) => {
    setDeletingPostId(postId)
    setIsDeleteDialogOpen(true)
  }

  // Function to confirm post deletion
  const handleConfirmDelete = async () => {
    if (!deletingPostId) return

    try {
      const response = await axios.delete(
        `http://localhost:5000/community/post/${deletingPostId}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        // Remove the post from the local state
        const updatedPosts = posts.filter(post => post.id !== deletingPostId)
        setPosts(updatedPosts)

        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive"
      })
    } finally {
      // Close the dialog and reset state
      setIsDeleteDialogOpen(false)
      setDeletingPostId(null)
    }
  }

  // Function to toggle comments visibility
  const toggleComments = async (postId: number) => {
    // Check if comments are already expanded
    if (expandedComments.includes(postId)) {
      // Collapse comments
      setExpandedComments(expandedComments.filter(id => id !== postId))
      return
    }

    // Expand comments
    setExpandedComments([...expandedComments, postId])

    // If we don't have comments for this post yet, fetch them
    if (!postComments[postId]) {
      setIsLoadingComments(prev => ({ ...prev, [postId]: true }))

      try {
        const response = await axios.get(`http://localhost:5000/community/comments/${postId}`)
        // Only show approved comments (admin_mod is null or 'Approved')
        const approvedComments = response.data.filter(
          (comment: any) => comment.adminMod === undefined ||
                           comment.adminMod === null ||
                           comment.adminMod === 'Approved'
        )
        setPostComments(prev => ({ ...prev, [postId]: approvedComments }))
      } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error)
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingComments(prev => ({ ...prev, [postId]: false }))
      }
    }
  }

  // Function to handle comment submission
  const handleAddComment = async (postId: number) => {
    const content = commentContent[postId]

    if (!content || !content.trim()) return

    try {
      const response = await axios.post(
        "http://localhost:5000/community/comments",
        { postId, content },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Add the new comment to the local state
        const newComment = response.data.comment

        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }))

        // Clear the input field
        setCommentContent(prev => ({ ...prev, [postId]: "" }))

        // Update the comments count in the post
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, comments: (post.comments || 0) + 1 }
              : post
          )
        )
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to handle comment edit
  const handleEditComment = (comment: any) => {
    setEditingComment(comment)
    setEditCommentContent(comment.content)
    setIsCommentEditDialogOpen(true)
  }

  // Function to save edited comment
  const handleSaveCommentEdit = async () => {
    if (!editingComment || !editCommentContent.trim()) return

    try {
      const response = await axios.put(
        `http://localhost:5000/community/comments/${editingComment.id}`,
        { content: editCommentContent },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Update the comment in the local state
        const updatedComment = response.data.comment
        const postId = updatedComment.postId

        setPostComments(prev => ({
          ...prev,
          [postId]: prev[postId].map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        }))

        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully.",
        })

        // Close the dialog and reset state
        setIsCommentEditDialogOpen(false)
        setEditingComment(null)
        setEditCommentContent("")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to handle comment delete
  const handleDeleteComment = (commentId: number, _postId: number) => {
    // We don't use postId here, but we keep it as a parameter for consistency
    setDeletingCommentId(commentId)
    setIsCommentDeleteDialogOpen(true)
  }

  // Function to confirm comment deletion
  const handleConfirmCommentDelete = async () => {
    if (!deletingCommentId) return

    try {
      const response = await axios.delete(
        `http://localhost:5000/community/comments/${deletingCommentId}`,
        { withCredentials: true }
      )

      if (response.data.success) {
        // Find which post this comment belongs to
        let postId: number | null = null

        for (const [pid, comments] of Object.entries(postComments)) {
          if (comments.some(c => c.id === deletingCommentId)) {
            postId = parseInt(pid)
            break
          }
        }

        if (postId) {
          // Remove the comment from the local state
          setPostComments(prev => ({
            ...prev,
            [postId]: prev[postId].filter(comment => comment.id !== deletingCommentId)
          }))

          // Update the comments count in the post
          setPosts(prev =>
            prev.map(post =>
              post.id === postId
                ? { ...post, comments: Math.max((post.comments || 0) - 1, 0) }
                : post
            )
          )
        }

        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      })
    } finally {
      // Close the dialog and reset state
      setIsCommentDeleteDialogOpen(false)
      setDeletingCommentId(null)
    }
  }

  const handleSendDirectMessage = async (userId: number) => {
    if (!currentMessage.trim()) return

    // Check connection status
    const status = getConnectionStatus(userId, connectionRequests, connections)

    const partner = partners.find((p: any) => p.id === userId)
    if (!partner) return

    // If users are not connected, show a system message
    if (status !== "connected") {
      // Create a temporary message to show immediately
      const tempMessage = {
        id: Date.now(),
        sender: "me",
        content: currentMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMessages((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] || []), tempMessage],
      }))
      setCurrentMessage("")

      // Add appropriate system message based on connection status
      setTimeout(() => {
        let systemMessage;

        if (status === "none") {
          systemMessage = {
            id: Date.now() + 1,
            sender: "system",
            content: "You're not connected with this user yet. Would you like to send a connection request?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionButtons: true
          }
        } else if (status === "pending-outgoing") {
          systemMessage = {
            id: Date.now() + 1,
            sender: "system",
            content: "You've already sent a connection request to this user. Waiting for them to accept.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        } else if (status === "pending-incoming") {
          systemMessage = {
            id: Date.now() + 1,
            sender: "system",
            content: "This user has sent you a connection request. Accept to connect with them.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionButtons: true
          }
        }

        if (systemMessage) {
          setChatMessages((prev) => ({
            ...prev,
            [userId]: [...(prev[userId] || []), systemMessage],
          }))
        }
      }, 500)

      return;
    }

    // For connected users, send the message to the API
    try {
      // Optimistically add the message to the UI
      const tempMessage = {
        id: Date.now(),
        sender: "me",
        content: currentMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMessages((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] || []), tempMessage],
      }))

      // Clear the input field
      setCurrentMessage("")

      // Send the message to the API
      const response = await axios.post(
        "http://localhost:5000/community/sendMessage",
        {
          receiverId: userId,
          content: currentMessage
        },
        { withCredentials: true }
      );

      if (!response.data.success) {
        // If the API call fails, show an error
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">Connect with fitness partners, join groups, and share your journey.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="partners">Find Partners</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Community Feed</h2>
              {groupFilter === "myPosts" && (
                <Badge variant="secondary" className="ml-2">
                  Showing your posts only
                </Badge>
              )}
              {groupFilter === "joined" && (
                <Badge variant="secondary" className="ml-2">
                  Showing posts from your groups
                </Badge>
              )}
            </div>
            <Select value={groupFilter} onValueChange={(value) => setGroupFilter(value as "all" | "joined" | "myPosts")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="joined">My Groups Only</SelectItem>
                <SelectItem value="myPosts">My Posts Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={currentUser?.profile_picture || "/placeholder.svg?height=40&width=40"}
                      alt={currentUser?.first_name || "User"}
                    />
                    <AvatarFallback>
                      {currentUser?.first_name ? currentUser.first_name.charAt(0) : "U"}
                    </AvatarFallback>
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
                            src={postImage && typeof postImage === 'string' && postImage.startsWith('/uploads')
                              ? `http://localhost:5000${postImage}` // Server-side image path
                              : (postImage || "/placeholder.svg")} // Base64 or fallback
                            alt="Post preview"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Preview image failed to load:", postImage);
                              e.currentTarget.src = "/placeholder.svg";
                            }}
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

          {(() => {
            const filteredPosts = posts.filter((post) => {
              if (groupFilter === "all") return true;
              if (groupFilter === "joined") return joinedGroups.includes(post.group.id);
              if (groupFilter === "myPosts") {
                // Check if the post was created by the current user
                return currentUser && post.user &&
                  (post.user.username === currentUser.username ||
                    post.user.name === `${currentUser.first_name} ${currentUser.last_name}`);
              }
              return true;
            });

            if (filteredPosts.length === 0) {
              return (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {groupFilter === "myPosts" ? (
                        <>
                          <UserIcon className="h-12 w-12 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">You haven't created any posts yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Share your fitness journey with the community by creating your first post above.
                          </p>
                        </>
                      ) : groupFilter === "joined" ? (
                        <>
                          <Users className="h-12 w-12 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">No posts in your groups</h3>
                          <p className="text-muted-foreground mb-4">
                            Join more groups or be the first to post in your current groups.
                          </p>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">No posts available</h3>
                          <p className="text-muted-foreground mb-4">
                            Check back later for new posts or create your own.
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return filteredPosts.map((post) => (
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
                            {post.edited && (
                              <>
                                <span className="mx-1 text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">edited</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{post.time}</p>

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
                              onError={(e) => {
                                console.error("Image failed to load:", post.image);
                                e.currentTarget.src = "/placeholder.svg";
                              }}
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
                          onClick={() => toggleComments(post.id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </Button>

                      </div>

                      {/* Comments Section */}
                      {expandedComments.includes(post.id) && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-medium mb-3">Comments</h4>

                          {/* Comments List */}
                          <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                            {isLoadingComments[post.id] ? (
                              <div className="flex justify-center py-4">
                                <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : postComments[post.id]?.length > 0 ? (
                              postComments[post.id].map((comment) => (
                                <div key={comment.id} className="flex gap-2 group">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted p-2 rounded-md">
                                      <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium">{comment.user.name}</p>

                                        {/* Show edit/delete options for user's own comments */}
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
                                                  onClick={() => handleDeleteComment(comment.id, post.id)}
                                                >
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                      </div>
                                      <p className="text-sm">{comment.content}</p>
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
                          {currentUser && (
                            <div className="flex gap-2 mt-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={currentUser.profile_picture || "/placeholder.svg"}
                                  alt={`${currentUser.first_name} ${currentUser.last_name}`}
                                />
                                <AvatarFallback>{currentUser.first_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={commentContent[post.id] || ""}
                                  onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(post.id);
                                    }
                                  }}
                                  className="text-sm min-h-[60px] resize-none"
                                />
                                <div className="flex justify-end mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddComment(post.id)}
                                    disabled={!commentContent[post.id]?.trim()}
                                  >
                                    Comment
                                  </Button>
                                </div>
                              </div>
                            </div>


                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
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
                      <Label>Distance (km)</Label>
                      <span className="text-sm">{distance} km</span>
                    </div>
                    <Slider value={distance} onValueChange={setDistance} max={20} step={1} />
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


                </CardContent>
              </Card>
              <ScrollArea className="h-[26.375rem] w-84 rounded-md border">

                <div className="space-y-2">
                  {isLoadingPartners ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Finding fitness partners near you...</p>
                    </div>
                  ) : partners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No partners found</h3>
                      <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-4">
                        Try adjusting your filters or increasing the distance to find more fitness partners.
                      </p>
                    </div>
                  ) : (
                    partners.map((partner) => (
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
                    ))
                  )}
                </div>
              </ScrollArea>

            </div>

            {/* Google Map Canvas*/}

            <div className="md:col-span-2 space-y-4">
              <div className="relative">
                <Card className="h-[400px] overflow-hidden">
                  {isLoaded ? (
                    <>
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={14}
                        center={mapCenter}
                        options={options}
                        onClick={() => setSelectedMarker(null)}
                        onLoad={onMapLoad}
                      >
                        {isLoadingPartners ? (
                          // Don't show markers while loading
                          null
                        ) : (
                          partners.map((partner) => (
                            <Marker
                              key={partner.id}
                              position={{
                                lat: partner.location.lat,
                                lng: partner.location.lng,
                              }}
                              onClick={() => {
                                console.log(partner)
                                setSelectedMarker(partner)
                                setSelectedPartner(partner)
                              }}
                            />
                          ))
                        )}

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

                      {/* Map controls */}
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => {
                            if (map && userLocation) {
                              map.panTo(userLocation);
                              map.setZoom(14);
                            }
                          }}
                          title="Center map on your location"
                        >
                          <MapPin className="h-4 w-4 text-primary" />
                        </Button>

                        {partners.length > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white"
                            onClick={() => {
                              if (map && partners.length > 0) {
                                const bounds = calculateBounds(partners);
                                if (bounds) {
                                  map.fitBounds(bounds);
                                }
                              }
                            }}
                            title="Show all partners on map"
                          >
                            <Users className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6">
                      {loadError ? (
                        <div className="text-center space-y-3">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-lg font-medium">Map unavailable</p>
                          <p className="text-sm text-muted-foreground max-w-md">
                            {loadError.toString().includes("BillingNotEnabledMapError")
                              ? "Google Maps requires billing to be enabled on your Google Cloud account."
                              : "There was an error loading the map."}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {isLoadingPartners ? (
                              <div className="col-span-2 flex flex-col items-center justify-center py-4">
                                <Loader className="h-6 w-6 animate-spin text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Loading partners...</p>
                              </div>
                            ) : partners.length === 0 ? (
                              <div className="col-span-2 flex flex-col items-center justify-center py-4">
                                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No partners found</p>
                              </div>
                            ) : (
                              partners.map((partner) => (
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
                              ))
                            )}
                          </div>
                        </div>
                      ) : isLoadingPartners ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p>Finding fitness partners near you...</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mr-2"></div>
                          <p>Loading map...</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {selectedPartner && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{selectedPartner.name}</CardTitle>
                        <CardDescription>{selectedPartner.distance}</CardDescription>
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
                          {selectedPartner.interests.map((interest: string, index: number) => (
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

                    <div className="space-y-3">
                      {getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "pending-incoming" && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm mb-2">
                            <strong>{selectedPartner.name}</strong> sent you a connection request
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleConnectionRequest(selectedPartner.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleConnectionRequest(selectedPartner.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => setChatOpen(true)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Button>

                        {getConnectionStatus(selectedPartner.id, connectionRequests, connections) !== "pending-incoming" && (
                          <>
                            {getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "connected" ? (
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDisconnectPartner(selectedPartner.id)}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => handleConnectionRequest(selectedPartner.id)}
                                disabled={getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "pending-outgoing"}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                {getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "none" &&
                                  "Connect"}
                                {getConnectionStatus(selectedPartner.id, connectionRequests, connections) ===
                                  "pending-outgoing" && "Request Sent"}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
                  {isLoadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !selectedPartner ||
                    !chatMessages[selectedPartner.id] ||
                    chatMessages[selectedPartner.id].length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages[selectedPartner.id].map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me"
                            ? "justify-end"
                            : message.sender === "system"
                              ? "justify-center"
                              : "justify-start"
                          }`}
                      >
                        {message.sender === "system" ? (
                          <div className="max-w-[90%] text-center bg-muted/50 rounded-lg px-4 py-2 text-xs text-muted-foreground">
                            <p>{message.content}</p>

                            {/* Show action buttons for connection requests if needed */}
                            {message.actionButtons && (
                              <div className="flex gap-2 justify-center mt-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs px-2"
                                  onClick={() => handleConnectionRequest(selectedPartner.id)}
                                >
                                  Send Request
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2"
                                  onClick={() => {
                                    // Add a dismissal message
                                    const dismissMessage = {
                                      id: Date.now(),
                                      sender: "system",
                                      content: "Connection suggestion dismissed",
                                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                    }

                                    setChatMessages((prev) => ({
                                      ...prev,
                                      [selectedPartner.id]: [...(prev[selectedPartner.id] || []), dismissMessage],
                                    }))
                                  }}
                                >
                                  Not Now
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === "me"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                              }`}
                          >
                            {typeof message.sender !== "string" && message.sender !== "me" && (
                              <p className="text-xs font-medium mb-1">
                                {typeof message.sender === "object" ? message.sender.name : "User"}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 text-right mt-1">{message.timestamp}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Connection request notification in chat */}
                  {selectedPartner && getConnectionStatus(selectedPartner.id, connectionRequests, connections) === "pending-incoming" && (
                    <div className="bg-muted/50 rounded-lg p-3 mt-4 text-center">
                      <p className="text-sm font-medium mb-2">
                        {selectedPartner.name} sent you a connection request
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleConnectionRequest(selectedPartner.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConnectionRequest(selectedPartner.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
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
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-8"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setCreateGroupOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>

          {/* Create Group Modal */}
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new fitness group to connect with like-minded individuals.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      placeholder="Describe your group's purpose and activities"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="groupLocation">Location</Label>
                    <Input
                      id="groupLocation"
                      placeholder="e.g., Dhaka, Bangladesh or Online"
                      value={newGroupLocation}
                      onChange={(e) => setNewGroupLocation(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="groupImage">Group Image</Label>
                    <div className="flex items-center gap-4">
                      {newGroupImage && (
                        <div className="relative w-24 h-24 rounded overflow-hidden">
                          <img
                            src={newGroupImage}
                            alt="Group preview"
                            className="object-cover w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => setNewGroupImage(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <Label
                        htmlFor="groupImageUpload"
                        className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        {newGroupImage ? "Change image" : "Upload image"}
                      </Label>
                      <Input
                        id="groupImageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target) {
                                setNewGroupImage(event.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateGroupOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                            <h3 className="text-2xl mb-2 font-semibold text-white">{group.name}</h3>
                            <div className="flex items-center text-sm text-white/80">
                              <Users className="mr-1 h-3 w-3" />
                              <span>{group.members} members</span>
                              <span className="mx-2">•</span>
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{group.location}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-m mb-4">{group.description}</p>

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
                          <h3 className="text-2xl mb-2 font-semibold text-white">{group.name}</h3>
                          <div className="flex items-center text-sm text-white/80">
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

                        <Button variant="outline" className="w-full hover:bg-primary/80" onClick={() => handleJoinGroup(group)}>
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
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-gray-400" : "bg-amber-700"
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
                        className={`h-4 w-4 ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-gray-400" : "text-amber-700"
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
                          className={`h-full ${user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-gray-400" : "bg-amber-700"
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
                      className={`flex items-center justify-center w-6 h-6 rounded-full ${user.rank === 1
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
                  {isLoadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (chatMessages[activeChatUser] || []).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    (chatMessages[activeChatUser] || []).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me"
                            ? "justify-end"
                            : message.sender === "system"
                              ? "justify-center"
                              : "justify-start"
                          }`}
                      >
                        {message.sender === "system" ? (
                          <div className="max-w-[90%] text-center bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                            <p>{message.content}</p>

                            {/* Show action buttons for connection requests if needed */}
                            {message.actionButtons && (
                              <div className="flex gap-2 justify-center mt-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-6 text-xs px-2"
                                  onClick={() => {
                                    // Handle connection request
                                    handleConnectionRequest(activeChatUser || 0, 'send');
                                  }}
                                >
                                  Send Request
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2"
                                  onClick={() => {
                                    // Add a dismissal message
                                    const dismissMessage = {
                                      id: Date.now(),
                                      sender: "system",
                                      content: "Connection suggestion dismissed",
                                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                    }

                                    setChatMessages((prev) => ({
                                      ...prev,
                                      [activeChatUser || 0]: [...(prev[activeChatUser || 0] || []), dismissMessage],
                                    }))
                                  }}
                                >
                                  Not Now
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${message.sender === "me"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                              }`}
                          >
                            {typeof message.sender !== "string" && message.sender !== "me" && (
                              <p className="text-xs font-medium mb-1">
                                {typeof message.sender === "object" ? message.sender.name : "User"}
                              </p>
                            )}
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 text-right mt-1">{message.timestamp}</p>
                          </div>
                        )}
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
                {/* Connection Requests Section */}
                {connectionRequests.filter(req => req.receiver === currentUser?.user_id).length > 0 && (
                  <>
                    <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                      <p className="text-sm font-medium text-primary">Connection Requests</p>
                      <div className="bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-bold px-1">
                        {pendingConnectionRequests}
                      </div>
                    </div>
                    <div className="divide-y">
                      {connectionRequests
                        .filter(req => req.receiver === currentUser?.user_id)
                        .map((request) => {
                          const partner = partners.find((p) => p.id === request.sender)
                          if (!partner) return null

                          return (
                            <div key={request.id} className="p-3 hover:bg-accent">
                              <div className="flex items-center mb-2">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarImage src={partner.avatar || "/placeholder.svg"} alt={partner.name} />
                                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{partner.name}</p>
                                  <p className="text-xs text-muted-foreground">Wants to connect with you</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-1">
                                <Button
                                  size="sm"
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => {
                                    handleConnectionRequest(partner.id, 'accept');
                                    // Open chat with this user after accepting
                                    setActiveChatUser(partner.id);
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => handleConnectionRequest(partner.id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </>
                )}

                {/* Chat Conversations Section */}
                <div className="p-3 border-b">
                  <p className="text-sm text-muted-foreground">Conversations</p>
                </div>

                {isLoadingMessages ? (
                  <div className="p-4 flex justify-center">
                    <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : connections.length === 0 && conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Connect with users to start chatting</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {/* Show conversations from API */}
                    {conversations.map((conversation) => {
                      const partnerId = conversation.partner.id;

                      return (
                        <div
                          key={`conversation-${partnerId}`}
                          className="p-2 hover:bg-accent flex items-center group relative"
                        >
                          <div
                            className="flex-1 flex items-center cursor-pointer"
                            onClick={() => {
                              setActiveChatUser(partnerId);

                              // Mark messages as read when opening the conversation
                              if (unreadMessages[partnerId]) {
                                // Update unread counts
                                setUnreadMessages(prev => {
                                  const newCounts = { ...prev };
                                  delete newCounts[partnerId];
                                  return newCounts;
                                });

                                // Update total count
                                setTotalUnreadCount(prevTotal => {
                                  const messageCount = prevTotal - (unreadMessages[partnerId] || 0);
                                  return Math.max(messageCount, 0);
                                });

                                // Here you would also call an API to mark messages as read in the database
                                // For example:
                                // axios.post(`http://localhost:5000/community/markAsRead/${partnerId}`, {}, { withCredentials: true });
                              }
                            }}
                          >
                            <div className="relative">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={conversation.partner.avatar || "/placeholder.svg"} alt={conversation.partner.name} />
                                <AvatarFallback>{conversation.partner.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {unreadMessages[partnerId] && unreadMessages[partnerId] > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-4 flex items-center justify-center text-[10px] font-bold px-1">
                                  {unreadMessages[partnerId] > 99 ? "99+" : unreadMessages[partnerId]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{conversation.partner.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {conversation.lastMessage.content.substring(0, 20) +
                                  (conversation.lastMessage.content.length > 20 ? "..." : "")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            {/* Disconnect button if connected */}
                            {getConnectionStatus(partnerId, connectionRequests, connections) === "connected" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDisconnectPartner(partnerId);
                                }}
                                title="Disconnect"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Show connected users that don't have conversations yet */}
                    {connections
                      .filter(connection => {
                        const partnerId = connection.user1 === currentUser?.user_id ? connection.user2 : connection.user1;
                        // Only show connections that aren't already in conversations
                        return !conversations.some(conv => conv.partner.id === partnerId);
                      })
                      .map((connection) => {
                        const partnerId = connection.user1 === currentUser?.user_id ? connection.user2 : connection.user1;
                        const partner = partners.find((p) => p.id === partnerId);
                        if (!partner) return null;

                        return (
                          <div
                            key={`connection-${connection.id}`}
                            className="p-2 hover:bg-accent flex items-center group relative"
                          >
                            <div
                              className="flex-1 flex items-center cursor-pointer"
                              onClick={() => setActiveChatUser(partnerId)}
                            >
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={partner.avatar || "/placeholder.svg"} alt={partner.name} />
                                <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{partner.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Start a conversation
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {/* Disconnect button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDisconnectPartner(partnerId);
                                }}
                                title="Disconnect"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat Button with Notification Count */}
        <div className="relative">
          <Button
            className="rounded-full h-12 w-12 shadow-lg flex items-center justify-center"
            onClick={() => {
              setIsChatPanelOpen(!isChatPanelOpen);

              // Reset unread counts when opening the chat panel
              if (!isChatPanelOpen && totalUnreadCount > 0) {
                // We don't reset the actual counts here because they'll be updated
                // when the user views specific conversations
              }
            }}
          >
            {isChatPanelOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            <span className="sr-only">Toggle chat</span>
          </Button>

          {/* Notification Badge */}
          {totalUnreadCount > 0 && !isChatPanelOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-bold px-1">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </div>
          )}
        </div>
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

      {/* Delete Post Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Delete Comment Confirmation */}
      <AlertDialog open={isCommentDeleteDialogOpen} onOpenChange={setIsCommentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCommentDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect Partner Confirmation */}
      <AlertDialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Partner?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect from this partner? You will need to send a new connection request to reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisconnect} className="bg-destructive text-destructive-foreground">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
