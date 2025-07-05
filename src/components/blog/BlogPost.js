import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getBlogPostBySlug, 
  getCommentsByPost, 
  addComment, 
  toggleLike, 
  isPostLiked,
  toggleSavePost,
  isPostSaved,
  canEditPost,
  canDeletePost,
  deleteBlogPostWithPermission,
  onAuthStateChangedEnhanced
} from "../../services/firebase";
import { useModal } from "../../contexts/ModalContext";

const BlogPost = () => {
  const { showSuccess, showError, confirmDelete } = useModal();
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // User and post state
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Comment form state
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Post interaction state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingPost, setLikingPost] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  // Listen for user authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChangedEnhanced(setUser);
    return () => unsubscribe();
  }, []);

  // Load post data when slug or user changes
  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug, user]);

  // Fetch post data and user interactions
  const loadPost = async () => {
    try {
      const postData = await getBlogPostBySlug(slug);
      if (!postData) {
        navigate("/blogs");
        return;
      }
      
      setPost(postData);
      setLikeCount(postData.likes || 0);
      
      // Check if current user has liked/saved this post
      if (user) {
        const [isLiked, isSaved] = await Promise.all([
          isPostLiked(postData.id, user.uid),
          isPostSaved(postData.id, user.uid)
        ]);
        setLiked(isLiked);
        setSaved(isSaved);
      } else {
        setLiked(false);
        setSaved(false);
      }
      
      // Load comments for this post
      const commentsData = await getCommentsByPost(postData.id);
      setComments(commentsData);
      
    } catch (error) {
      console.error("Error loading post:", error);
      showError("Error loading post. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike functionality
  const handleLike = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    if (likingPost) return; // Prevent multiple clicks
    setLikingPost(true);

    try {
      const newLikedState = await toggleLike(post.id, user.uid);
      setLiked(newLikedState);
      
      // Update like count
      if (newLikedState) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showError("Error updating like. Please try again.");
    } finally {
      setLikingPost(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/");
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(post.id, { content: newComment }, user.uid);
      const updatedComments = await getCommentsByPost(post.id);
      setComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      showError("Error adding comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle save/unsave functionality
  const handleSave = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    if (savingPost) return; // Prevent multiple clicks
    setSavingPost(true);

    try {
      const newSavedState = await toggleSavePost(post.id, user.uid);
      setSaved(newSavedState);
      
      // Show feedback and navigate if saved
      if (newSavedState) {
        showSuccess("Post saved successfully! Redirecting to your saved posts...");
        setTimeout(() => {
          navigate("/saved-posts");
        }, 1000);
      } else {
        showSuccess("Post removed from saved posts.");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      showError("Error saving post. Please try again.");
    } finally {
      setSavingPost(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!user || !post) return;
    
    confirmDelete(async () => {
      try {
        await deleteBlogPostWithPermission(post.id, user);
        showSuccess("Post deleted successfully");
        navigate("/blogs");
      } catch (error) {
        console.error("Error deleting post:", error);
        showError("Error deleting post: " + error.message);
      }
    }, "this post");
  };

  // Format Firebase timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show not found message
  if (!post) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Close button - positioned at the top right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/blogs")}
              className="inline-flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to blog list"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Title and action buttons */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {post.title}
              </h1>
            </div>
            
            {/* Edit/Delete buttons for authorized users */}
            {user && (canEditPost(user.role, post.authorId, user.uid) || canDeletePost(user.role, post.authorId, user.uid)) && (
              <div className="flex space-x-3 flex-shrink-0">
                {canEditPost(user.role, post.authorId, user.uid) && (
                  <button
                    onClick={() => navigate(`/edit-post/${post.id}`)}
                    className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
                {canDeletePost(user.role, post.authorId, user.uid) && (
                  <button
                    onClick={handleDeletePost}
                    className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Author and meta info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={post.author?.photoURL || "/default-avatar.png"}
                alt={post.author?.displayName}
                className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  {post.author?.displayName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {post.category && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {likeCount}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                  {comments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Featured image */}
          {post.imageUrl && (
            <div className="mb-8">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          
          {/* Article content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <div 
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.75'
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Like and save buttons */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLike}
                disabled={likingPost}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  liked 
                    ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800" 
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <svg 
                  className={`w-5 h-5 mr-2 ${likingPost ? 'animate-spin' : ''}`} 
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  {likingPost ? (
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  )}
                </svg>
                {likingPost ? "Updating..." : (liked ? "Liked" : "Like")} ({likeCount})
              </button>

              {user && (
                <button
                  onClick={handleSave}
                  disabled={savingPost}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    saved 
                      ? "bg-blue-600 text-white" 
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  <svg 
                    className={`w-5 h-5 mr-2 ${savingPost ? 'animate-spin' : ''}`} 
                    fill={saved ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    {savingPost ? (
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    ) : (
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
                    )}
                  </svg>
                  {savingPost ? "Saving..." : (saved ? "Saved" : "Save")}
                </button>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Comments header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                </svg>
                Comments ({comments.length})
              </h3>
            </div>
            
            <div className="p-6">
              {/* Comment form for logged-in users */}
              {user ? (
                <form onSubmit={handleAddComment} className="mb-8">
                  <div className="flex space-x-4">
                    <img
                      src={user.photoURL || "/default-avatar.png"}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          disabled={submittingComment || !newComment.trim()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {submittingComment ? "Posting..." : "Post Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                // Sign-in prompt for guests
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Join the Discussion</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to leave a comment</p>
                  <button 
                    onClick={() => navigate("/")} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <img
                      src="/default-avatar.png"
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty state when no comments */}
                {comments.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments yet</h4>
                    <p className="text-gray-600 dark:text-gray-400">Be the first to start the conversation!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogPost;
