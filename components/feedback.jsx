
"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Feedback() {
  const [message, setMessage] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all feedback on load
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Function to fetch feedback
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/feedback");
      setFeedbackList(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        { message },
        { withCredentials: true }
      );

      setSuccess(response.data.message || "Feedback submitted successfully!");
      setMessage("");

      // Refresh feedback list
      await fetchFeedback();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">Give Feedback</h2>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full h-24 p-3 border rounded-md resize-none"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className={`px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <h3 className="text-xl font-medium mt-8">User Feedback</h3>

      {loading && feedbackList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading feedback...</p>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No feedback yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((fb, index) => (
            <div key={index} className="border p-4 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">
                <strong>{fb.display_name || fb.username}</strong> ({new Date(fb.time_stamp).toLocaleString()})
              </p>
              <p className="mt-1">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

