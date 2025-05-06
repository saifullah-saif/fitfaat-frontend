"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
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
} from "lucide-react"

// Mock data for all content
const allContentData = [
  {
    id: 1,
    type: "post",
    title: "My Fitness Journey",
    content: "I've been working out for 3 months now and I'm seeing great results! Here's what I've learned...",
    author: {
      id: 101,
      name: "Sarah Ahmed",
      avatar: "/abstract-geometric-sa.png",
    },
    group: "Morning Runners Club",
    createdAt: "2023-09-10T14:30:00",
    likes: 24,
    comments: 8,
    status: "approved",
  },
  {
    id: 2,
    type: "comment",
    content: "This is really inspiring! I'm just starting my fitness journey.",
    author: {
      id: 102,
      name: "Rahul Sharma",
      avatar: "/abstract-rs.png",
    },
    parentContent: "My Fitness Journey",
    createdAt: "2023-09-10T15:45:00",
    likes: 5,
    status: "approved",
  },
  {
    id: 3,
    type: "post",
    title: "Healthy Meal Prep Ideas",
    content: "Here are some easy meal prep ideas that have helped me stay on track with my nutrition goals...",
    author: {
      id: 103,
      name: "Fatima Khan",
      avatar: "/abstract-fk.png",
    },
    group: "Nutrition & Diet",
    createdAt: "2023-09-11T09:15:00",
    likes: 42,
    comments: 15,
    status: "approved",
  },
  {
    id: 4,
    type: "comment",
    content: "I disagree with this approach. It's not sustainable for most people.",
    author: {
      id: 104,
      name: "Ahmed Hassan",
      avatar: "/abstract-geometric-AH.png",
    },
    parentContent: "Healthy Meal Prep Ideas",
    createdAt: "2023-09-11T10:30:00",
    likes: 2,
    status: "flagged",
    flagReason: "Potentially misleading information",
  },
  {
    id: 5,
    type: "post",
    title: "Weight Training Tips for Beginners",
    content: "If you're new to weight training, here are some tips to help you get started safely...",
    author: {
      id: 105,
      name: "Imran Ali",
      avatar: "/placeholder.svg?key=jfnm4",
    },
    group: "Strength Training 101",
    createdAt: "2023-09-12T16:20:00",
    likes: 36,
    comments: 12,
    status: "pending",
  },
]

// Mock data for reported content
const reportedContentData = [
  {
    id: 101,
    contentId: 4,
    type: "comment",
    content: "I disagree with this approach. It's not sustainable for most people.",
    author: {
      id: 104,
      name: "Ahmed Hassan",
      avatar: "/abstract-geometric-AH.png",
    },
    reportedBy: {
      id: 103,
      name: "Fatima Khan",
      avatar: "/abstract-fk.png",
    },
    reportReason: "Spreading misinformation",
    reportedAt: "2023-09-11T11:15:00",
    status: "pending",
  },
  {
    id: 102,
    contentId: 6,
    type: "post",
    title: "Controversial Diet Plan",
    content: "I've been following this extreme diet plan and lost 10kg in just 2 weeks...",
    author: {
      id: 106,
      name: "Zainab Malik",
      avatar: "/placeholder.svg?key=vggwv",
    },
    reportedBy: {
      id: 107,
      name: "Dr. Kabir Ahmed",
      avatar: "/stylized-ka-symbol.png",
    },
    reportReason: "Promoting unhealthy/dangerous practices",
    reportedAt: "2023-09-13T08:45:00",
    status: "pending",
  },
  {
    id: 103,
    contentId: 7,
    type: "comment",
    content: "This workout is terrible. Anyone who follows this is going to get injured.",
    author: {
      id: 108,
      name: "Tariq Rahman",
      avatar: "/abstract-geometric-tr.png",
    },
    reportedBy: {
      id: 109,
      name: "Nadia Islam",
      avatar: "/placeholder.svg?key=acwnu",
    },
    reportReason: "Harassment/bullying",
    reportedAt: "2023-09-14T14:20:00",
    status: "pending",
  },
]

// Mock data for automated flags
const automatedFlagsData = [
  {
    id: 201,
    contentId: 8,
    type: "comment",
    content: "This is ***** ridiculous. Who would even try this workout?",
    author: {
      id: 110,
      name: "Kamal Hasan",
      avatar: "/abstract-geometric-kh.png",
    },
    flaggedAt: "2023-09-15T09:30:00",
    flagReason: "Potential profanity",
    status: "pending",
  },
  {
    id: 202,
    contentId: 9,
    type: "post",
    title: "Quick Weight Loss Supplements",
    content: "I've found these amazing supplements that helped me lose weight fast without exercise...",
    author: {
      id: 111,
      name: "Sadia Begum",
      avatar: "/stylized-letter-sb.png",
    },
    flaggedAt: "2023-09-15T11:45:00",
    flagReason: "Potential spam/promotional content",
    status: "pending",
  },
  {
    id: 203,
    contentId: 10,
    type: "comment",
    content: "You should try this diet pill I'm selling. DM me for details.",
    author: {
      id: 112,
      name: "Rafiq Ahmed",
      avatar: "/abstract-geometric-RA.png",
    },
    flaggedAt: "2023-09-16T10:15:00",
    flagReason: "Potential spam/promotional content",
    status: "pending",
  },
]

export function ContentModeration() {
  const [activeTab, setActiveTab] = useState("all-content")
  const [searchQuery, setSearchQuery] = useState("")
  const [contentTypeFilter, setContentTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [allContent, setAllContent] = useState(allContentData)
  const [reportedContent, setReportedContent] = useState(reportedContentData)
  const [automatedFlags, setAutomatedFlags] = useState(automatedFlagsData)
  const [selectedContent, setSelectedContent] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editedContent, setEditedContent] = useState({ title: "", content: "" })

  // Filter content based on search query and filters
  const filteredAllContent = allContent.filter((content) => {
    const matchesSearch =
      content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.author.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = contentTypeFilter === "all" || content.type === contentTypeFilter
    const matchesStatus = statusFilter === "all" || content.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Filter reported content based on search query
  const filteredReportedContent = reportedContent.filter((report) => {
    return (
      report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportReason.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Filter automated flags based on search query
  const filteredAutomatedFlags = automatedFlags.filter((flag) => {
    return (
      flag.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      flag.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.flagReason.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Handle viewing content details
  const handleViewContent = (content) => {
    setSelectedContent(content)
    setIsViewDialogOpen(true)
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
  const saveEditedContent = () => {
    // Update content in the appropriate list
    const updatedContent = allContent.map((item) => {
      if (item.id === selectedContent.id) {
        return {
          ...item,
          title: selectedContent.type === "post" ? editedContent.title : item.title,
          content: editedContent.content,
        }
      }
      return item
    })

    setAllContent(updatedContent)
    setIsEditDialogOpen(false)

    toast({
      title: "Content updated",
      description: "The content has been successfully updated.",
    })
  }

  // Handle deleting content
  const handleDeleteContent = (content) => {
    setSelectedContent(content)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete content
  const confirmDeleteContent = () => {
    // Remove content from the appropriate list
    const updatedContent = allContent.filter((item) => item.id !== selectedContent.id)
    setAllContent(updatedContent)

    // Also remove from reported content if it exists there
    const updatedReportedContent = reportedContent.filter((item) => item.contentId !== selectedContent.id)
    setReportedContent(updatedReportedContent)

    // Also remove from automated flags if it exists there
    const updatedAutomatedFlags = automatedFlags.filter((item) => item.contentId !== selectedContent.id)
    setAutomatedFlags(updatedAutomatedFlags)

    setIsDeleteDialogOpen(false)

    toast({
      title: "Content deleted",
      description: "The content has been successfully deleted.",
    })
  }

  // Handle approving content
  const handleApproveContent = (content) => {
    // Update content status
    const updatedContent = allContent.map((item) => {
      if (item.id === content.id) {
        return { ...item, status: "approved" }
      }
      return item
    })

    setAllContent(updatedContent)

    // Remove from reported content if it exists there
    const updatedReportedContent = reportedContent.filter((item) => item.contentId !== content.id)
    setReportedContent(updatedReportedContent)

    // Remove from automated flags if it exists there
    const updatedAutomatedFlags = automatedFlags.filter((item) => item.contentId !== content.id)
    setAutomatedFlags(updatedAutomatedFlags)

    toast({
      title: "Content approved",
      description: "The content has been approved and is now visible to users.",
    })
  }

  // Handle rejecting content
  const handleRejectContent = (content) => {
    // Update content status
    const updatedContent = allContent.map((item) => {
      if (item.id === content.id) {
        return { ...item, status: "rejected" }
      }
      return item
    })

    setAllContent(updatedContent)

    // Remove from reported content if it exists there
    const updatedReportedContent = reportedContent.filter((item) => item.contentId !== content.id)
    setReportedContent(updatedReportedContent)

    // Remove from automated flags if it exists there
    const updatedAutomatedFlags = automatedFlags.filter((item) => item.contentId !== content.id)
    setAutomatedFlags(updatedAutomatedFlags)

    toast({
      title: "Content rejected",
      description: "The content has been rejected and is no longer visible to users.",
    })
  }

  // Handle resolving a report
  const handleResolveReport = (report, action) => {
    // Update the content status based on the action
    const updatedContent = allContent.map((item) => {
      if (item.id === report.contentId) {
        return { ...item, status: action === "approve" ? "approved" : "rejected" }
      }
      return item
    })

    setAllContent(updatedContent)

    // Remove the report from the list
    const updatedReportedContent = reportedContent.filter((item) => item.id !== report.id)
    setReportedContent(updatedReportedContent)

    toast({
      title: action === "approve" ? "Report dismissed" : "Content removed",
      description:
        action === "approve"
          ? "The report has been dismissed and the content approved."
          : "The reported content has been removed.",
    })
  }

  // Handle resolving an automated flag
  const handleResolveFlag = (flag, action) => {
    // Update the content status based on the action
    const updatedContent = allContent.map((item) => {
      if (item.id === flag.contentId) {
        return { ...item, status: action === "approve" ? "approved" : "rejected" }
      }
      return item
    })

    setAllContent(updatedContent)

    // Remove the flag from the list
    const updatedAutomatedFlags = automatedFlags.filter((item) => item.id !== flag.id)
    setAutomatedFlags(updatedAutomatedFlags)

    toast({
      title: action === "approve" ? "Content approved" : "Content removed",
      description:
        action === "approve"
          ? "The flagged content has been reviewed and approved."
          : "The flagged content has been removed.",
    })
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex gap-1">
            <Flag className="h-3.5 w-3.5" />
            <span>{reportedContent.length} Reported</span>
          </Badge>
          <Badge variant="outline" className="flex gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{automatedFlags.length} Flagged</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-content">All Content</TabsTrigger>
          <TabsTrigger value="reported-content">Reported Content</TabsTrigger>
          <TabsTrigger value="automated-flags">Automated Flags</TabsTrigger>
        </TabsList>

        {/* All Content Tab */}
        <TabsContent value="all-content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User-Generated Content</CardTitle>
              <CardDescription>View and manage all user-generated content across the platform</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {filteredAllContent.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No content found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAllContent.map((content) => (
                        <TableRow key={content.id}>
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

        {/* Reported Content Tab */}
        <TabsContent value="reported-content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reported Content</CardTitle>
              <CardDescription>Review content that has been reported by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="hidden md:table-cell">Reported At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReportedContent.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No reported content found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReportedContent.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[300px] truncate">
                              {report.type === "post" ? report.title : report.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {report.type === "post" ? (
                                <FileText className="mr-1 h-3 w-3" />
                              ) : (
                                <MessageSquare className="mr-1 h-3 w-3" />
                              )}
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={report.reportedBy.avatar || "/placeholder.svg"}
                                  alt={report.reportedBy.name}
                                />
                                <AvatarFallback>{report.reportedBy.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[100px]">{report.reportedBy.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">{report.reportReason}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(report.reportedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewContent(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                                onClick={() => handleResolveReport(report, "approve")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                onClick={() => handleResolveReport(report, "reject")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
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

        {/* Automated Flags Tab */}
        <TabsContent value="automated-flags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Flags</CardTitle>
              <CardDescription>Review content that has been automatically flagged by the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Flag Reason</TableHead>
                      <TableHead className="hidden md:table-cell">Flagged At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAutomatedFlags.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No flagged content found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAutomatedFlags.map((flag) => (
                        <TableRow key={flag.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[300px] truncate">
                              {flag.type === "post" ? flag.title : flag.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {flag.type === "post" ? (
                                <FileText className="mr-1 h-3 w-3" />
                              ) : (
                                <MessageSquare className="mr-1 h-3 w-3" />
                              )}
                              {flag.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={flag.author.avatar || "/placeholder.svg"} alt={flag.author.name} />
                                <AvatarFallback>{flag.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[100px]">{flag.author.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">{flag.flagReason}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(flag.flaggedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewContent(flag)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                                onClick={() => handleResolveFlag(flag, "approve")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                onClick={() => handleResolveFlag(flag, "reject")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
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
            <DialogDescription>Detailed information about the selected content</DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.type === "post" && (
                <div>
                  <h3 className="text-lg font-semibold">{selectedContent.title}</h3>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Avatar>
                  <AvatarImage
                    src={selectedContent.author?.avatar || selectedContent.reportedBy?.avatar}
                    alt={selectedContent.author?.name || selectedContent.reportedBy?.name}
                  />
                  <AvatarFallback>
                    {(selectedContent.author?.name || selectedContent.reportedBy?.name).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedContent.author?.name || selectedContent.reportedBy?.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        selectedContent.createdAt || selectedContent.reportedAt || selectedContent.flaggedAt,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Content</h4>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
              </div>

              {selectedContent.reportReason && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Report Reason</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedContent.reportReason}</p>
                  </div>
                </div>
              )}

              {selectedContent.flagReason && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Flag Reason</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedContent.flagReason}</p>
                  </div>
                </div>
              )}

              {selectedContent.reportedBy && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Reported By</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={selectedContent.reportedBy.avatar || "/placeholder.svg"}
                        alt={selectedContent.reportedBy.name}
                      />
                      <AvatarFallback>{selectedContent.reportedBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedContent.reportedBy.name}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      handleDeleteContent(selectedContent)
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      handleEditContent(selectedContent)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
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
