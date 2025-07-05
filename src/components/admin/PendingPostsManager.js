import React, { useState, useEffect } from "react";
import { Eye, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { 
  getPendingPosts, 
  approvePost, 
  rejectPost, 
  deletePostByAdmin, 
  bulkApproveRejectPosts 
} from "../../services/firebase";
import { useModal } from "../../contexts/ModalContext";

// Individual post card component
const PostCard = ({ post, isSelected, onSelect, onPreview, onApprove, onReject, onDelete, actionLoading, formatDate }) => (
  <article className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg overflow-hidden h-full">
    <div className="p-4 flex flex-col h-full">
      {/* Header with checkbox and status */}
      <div className="flex items-start justify-between mb-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded">
          Pending Review
        </span>
      </div>

      {/* Featured image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-32 object-cover rounded mb-3"
        />
      )}

      {/* Post title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {post.title}
      </h3>

      {/* Post excerpt */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
      </p>

      {/* Category tag */}
      {post.category && (
        <div className="mb-4">
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
            {post.category}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Author and date info */}
      <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <img
            src={post.author?.photoURL || "/default-avatar.png"}
            alt={post.author?.displayName}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{post.author?.displayName}</span>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Submitted: {formatDate(post.submittedAt)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onPreview}
          className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-1" /> Preview
        </button>
        
        <button
          onClick={onApprove}
          disabled={actionLoading}
          className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <CheckCircle className="w-4 h-4 mr-1" /> Approve
        </button>
        
        <button
          onClick={onReject}
          disabled={actionLoading}
          className="flex-1 bg-yellow-600 text-white text-sm py-2 px-3 rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <XCircle className="w-4 h-4 mr-1" /> Reject
        </button>
        
        <button
          onClick={onDelete}
          disabled={actionLoading}
          className="bg-red-600 text-white text-sm py-2 px-3 rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </article>
);

const PendingPostsManager = ({ user }) => {
  // Modal notifications
  const { showSuccess, showError, confirmDelete } = useModal();
  
  // Data state
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection and bulk actions
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Rejection modal state
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [postToReject, setPostToReject] = useState(null);
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);

  // Load pending posts on component mount
  useEffect(() => {
    loadPendingPosts();
  }, []);

  // Fetch all pending posts from Firebase
  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      const posts = await getPendingPosts();
      setPendingPosts(posts);
    } catch (error) {
      showError("Failed to load pending posts");
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Handle individual post selection
  const handleSelectPost = (postId) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  // Toggle select all posts
  const handleSelectAll = () => {
    if (selectedPosts.size === pendingPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(pendingPosts.map(post => post.id)));
    }
  };

  // Approve a single post
  const handleApprovePost = async (postId) => {
    try {
      setActionLoading(true);
      await approvePost(postId, user.uid);
      await loadPendingPosts();
      setSelectedPosts(new Set());
      showSuccess("Post approved successfully!");
    } catch (error) {
      showError("Failed to approve post");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject a single post with reason
  const handleRejectPost = async (postId, reason = "") => {
    try {
      setActionLoading(true);
      await rejectPost(postId, user.uid, reason);
      await loadPendingPosts();
      setSelectedPosts(new Set());
      setShowRejectModal(false);
      setRejectionReason("");
      setPostToReject(null);
      showSuccess("Post rejected");
    } catch (error) {
      showError("Failed to reject post");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a post permanently
  const handleDeletePost = async (postId) => {
    confirmDelete(async () => {
      try {
        setActionLoading(true);
        await deletePostByAdmin(postId, user.uid);
        await loadPendingPosts();
        setSelectedPosts(new Set());
        showSuccess("Post deleted");
      } catch (error) {
        showError("Failed to delete post");
      } finally {
        setActionLoading(false);
      }
    }, "this post");
  };

  // Handle bulk actions on selected posts
  const handleBulkAction = async () => {
    if (selectedPosts.size === 0) {
      showError("Please select at least one post.");
      return;
    }

    if (bulkAction === "reject" && !rejectionReason.trim()) {
      showError("Please provide a rejection reason for bulk rejection.");
      return;
    }

    try {
      setActionLoading(true);
      const postIds = Array.from(selectedPosts);
      
      if (bulkAction === "approve" || bulkAction === "reject") {
        await bulkApproveRejectPosts(postIds, bulkAction, user.uid, rejectionReason);
        showSuccess(`${selectedPosts.size} posts ${bulkAction}d successfully!`);
      }
      
      await loadPendingPosts();
      setSelectedPosts(new Set());
      setBulkAction("");
      setRejectionReason("");
    } catch (error) {
      showError(`Failed to ${bulkAction} posts`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open rejection modal for individual post
  const openRejectModal = (postId) => {
    setPostToReject(postId);
    setShowRejectModal(true);
  };

  // Open preview modal for post content
  const handlePreviewPost = (post) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Posts</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
      {/* Header with bulk actions */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Pending Posts ({pendingPosts.length})
          </h2>
          
          {/* Bulk Actions Bar */}
          {selectedPosts.size > 0 && (
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm"
              >
                <option value="">Bulk Action</option>
                <option value="approve">Approve Selected</option>
                <option value="reject">Reject Selected</option>
              </select>
              
              {bulkAction === "reject" && (
                <input
                  type="text"
                  placeholder="Rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded text-sm w-40"
                />
              )}
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || actionLoading}
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Processing..." : "Apply"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {pendingPosts.length > 0 ? (
          <>
            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === pendingPosts.length && pendingPosts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Select All ({selectedPosts.size} selected)
                </span>
              </label>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {pendingPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  isSelected={selectedPosts.has(post.id)}
                  onSelect={() => handleSelectPost(post.id)}
                  onPreview={() => handlePreviewPost(post)}
                  onApprove={() => handleApprovePost(post.id)}
                  onReject={() => openRejectModal(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                  actionLoading={actionLoading}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        ) : (
          // Empty state
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending posts</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All posts have been reviewed.</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reject Post</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Please provide a reason for rejecting this post (optional):
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setPostToReject(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectPost(postToReject, rejectionReason)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? "Rejecting..." : "Reject Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors" />
            </button>

            {/* Modal content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header image */}
              {previewPost.imageUrl && (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={previewPost.imageUrl}
                    alt={previewPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {previewPost.title}
                </h1>

                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src={previewPost.author?.photoURL || "/default-avatar.png"}
                      alt={previewPost.author?.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{previewPost.author?.displayName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDate(previewPost.submittedAt)}</span>
                  </div>

                  {previewPost.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {previewPost.category}
                    </span>
                  )}
                </div>

                {/* Post content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: previewPost.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPostsManager;
