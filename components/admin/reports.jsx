import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { toast } from "@/hooks/use-toast";
import {
  Trash2,
  RefreshCw,
  Search,
  MessageSquare,
  Calendar,
  User,
  Loader2
} from "lucide-react";

export function Reports() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching feedbacks from server...');

      const res = await axios.get('http://localhost:5000/api/admin/feedback');
      console.log('Received feedback data:', res.data);

      setFeedbacks(res.data);
      toast({
        title: "Feedbacks Updated",
        description: `Successfully loaded ${res.data.length} feedback items`,
      });
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err.response?.data?.error || 'Failed to fetch feedbacks. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load feedback data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Filter feedbacks based on search term
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (feedback.username?.toLowerCase().includes(searchLower) || false) ||
      (feedback.feedback_message?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Open delete confirmation dialog
  const openDeleteDialog = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteDialogOpen(true);
  };

  // Delete feedback by feedback_id
  const handleDelete = async () => {
    if (!feedbackToDelete) return;

    try {
      setDeleting(feedbackToDelete.feedback_id);
      console.log(`Deleting feedback with ID: ${feedbackToDelete.feedback_id}`);

      const response = await axios.delete(`http://localhost:5000/api/admin/feedback/${feedbackToDelete.feedback_id}`);
      console.log('Delete response:', response.data);

      // Remove the deleted feedback from the state
      setFeedbacks((prev) => prev.filter((fb) => fb.feedback_id !== feedbackToDelete.feedback_id));

      // Show success message
      toast({
        title: "Feedback Deleted",
        description: "The feedback has been successfully removed",
      });

    } catch (err) {
      console.error('Error deleting feedback:', err);
      toast({
        title: "Error",
        description: err.response?.data?.error || 'Error deleting feedback. Please try again.',
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedbacks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchFeedbacks}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            User Feedbacks
          </CardTitle>
          <CardDescription>
            View and manage user feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Loading feedback data...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No feedbacks match your search" : "No feedbacks found"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="w-[40%]">Feedback</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((fb) => (
                    <TableRow key={fb.feedback_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </Badge>
                          <div>
                            <div className="font-medium">{fb.username}</div>
                            <div className="text-xs text-muted-foreground">ID: {fb.user_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-h-20 overflow-y-auto">
                          {fb.feedback_message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{formatDate(fb.time_stamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(fb)}
                          disabled={deleting === fb.feedback_id}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          {deleting === fb.feedback_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}