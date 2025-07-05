import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, FileText } from "lucide-react";
import { getUserPosts, submitPostForReview } from "../../services/firebase";
import { useModal } from "../../contexts/ModalContext";

const MyPosts = ({ user }) => {
  const { showSuccess, showError } = useModal();
  
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState({});

  // Load user's posts when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadUserPosts();
    }
  }, [user?.uid]);

  // Fetch all posts for the current user
  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const userPosts = await getUserPosts(user.uid, true);
      setPosts(userPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  // Submit a draft post for admin review
  const handleSubmitForReview = async (postId) => {
    try {
      setSubmitLoading(prev => ({ ...prev, [postId]: true }));
      await submitPostForReview(postId);
      showSuccess("Post submitted for review!");
      await loadUserPosts(); // Refresh the list
    } catch (error) {
      console.error("Error submitting for review:", error);
      showError("Failed to submit post for review");
    } finally {
      setSubmitLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Format dates for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get the appropriate status badge for each post
  const getStatusBadge = (status, rejectionReason) => {
    const badges = {
      draft: (
        <div>
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded">
            Draft
          </span>
          {rejectionReason && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-xs text-red-600 dark:text-red-300">
              <strong>Rejected:</strong> {rejectionReason}
            </div>
          )}
        </div>
      ),
      pending: (
        <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded">
          Pending Review
        </span>
      ),
      approved: (
        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded">
          Published
        </span>
      )
    };

    return badges[status] || (
      <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded">
        {status}
      </span>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Posts</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
      {/* Header with post count and create button */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Posts ({posts.length})
          </h2>
          <Link
            to="/create-post"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Create New Post
          </Link>
        </div>
      </div>

      <div className="p-6">
        {posts.length > 0 ? (
          // Grid of user's posts
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex flex-col h-full"
              >
                {/* Featured image */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                
                <div className="p-4 flex flex-col flex-1">
                  {/* Status badge and date */}
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(post.status, post.rejectionReason)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>

                  {/* Post title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.status === "approved" ? (
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    ) : (
                      post.title
                    )}
                  </h3>

                  {/* Post excerpt */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                  </p>

                  {/* Category tag */}
                  {post.category && (
                    <div className="mb-3">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                  )}

                  {/* Action buttons - always at bottom */}
                  <div className="mt-auto">
                    <div className="flex space-x-2">
                      {post.status === "draft" && (
                        <>
                          <Link
                            to={`/edit-post/${post.id}`}
                            className="flex-1 bg-blue-500 text-white text-sm py-2 px-3 rounded hover:bg-blue-600 transition-colors text-center"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleSubmitForReview(post.id)}
                            disabled={submitLoading[post.id]}
                            className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {submitLoading[post.id] ? "Submitting..." : "Submit for Review"}
                          </button>
                        </>
                      )}
                      
                      {post.status === "pending" && (
                        <div className="w-full text-center text-sm text-yellow-600 dark:text-yellow-400 py-2">
                          ⏳ Waiting for admin review
                        </div>
                      )}
                      
                      {post.status === "approved" && (
                        <div className="w-full text-center text-sm text-green-600 dark:text-green-400 py-2">
                          ✅ Published and live
                        </div>
                      )}
                    </div>

                    {/* Engagement stats for published posts */}
                    {post.status === "approved" && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" /> {post.likes || 0}
                        </span>
                        <span className="flex items-center">
                          💬 {post.comments || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          // Empty state when no posts exist
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No posts yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first post.
            </p>
            <div className="mt-6">
              <Link
                to="/create-post"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Post
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
