import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";

export function Reports() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching feedbacks from server...');

      const res = await axios.get('http://localhost:5000/api/admin/feedback');
      console.log('Received feedback data:', res.data);

      setFeedbacks(res.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err.response?.data?.error || 'Failed to fetch feedbacks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Delete feedback by feedback_id
  const handleDelete = async (feedbackId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this feedback?');
    if (!confirmDelete) return;

    try {
      setDeleting(feedbackId);
      console.log(`Deleting feedback with ID: ${feedbackId}`);

      const response = await axios.delete(`http://localhost:5000/api/admin/feedback/${feedbackId}`);
      console.log('Delete response:', response.data);

      // Remove the deleted feedback from the state
      setFeedbacks((prev) => prev.filter((fb) => fb.feedback_id !== feedbackId));

      // Show success message
      alert('Feedback deleted successfully');

    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert(err.response?.data?.error || 'Error deleting feedback. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Feedbacks</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFeedbacks}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading feedbacks...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedbacks found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">User</th>
                    <th className="border px-4 py-2 text-left">Feedback</th>
                    <th className="border px-4 py-2 text-left">Submitted At</th>
                    <th className="border px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb) => (
                    <tr key={fb.feedback_id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">
                        <div className="font-medium">{fb.username}</div>
                        <div className="text-sm text-gray-500">ID: {fb.user_id}</div>
                      </td>
                      <td className="border px-4 py-2">{fb.feedback_message}</td>
                      <td className="border px-4 py-2">{new Date(fb.time_stamp).toLocaleString()}</td>
                      <td className="border px-4 py-2 text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(fb.feedback_id)}
                          disabled={deleting === fb.feedback_id}
                        >
                          {deleting === fb.feedback_id ? (
                            <span className="animate-pulse">Deleting...</span>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}