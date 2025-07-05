import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, BookOpen } from "lucide-react";
import { getSavedPosts, onAuthStateChangedEnhanced } from "../../services/firebase";
import { useModal } from "../../contexts/ModalContext";

const SavedPosts = () => {
  const { showError } = useModal();
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChangedEnhanced(setUser);
    return () => unsubscribe();
  }, []);

  // Fetch user's saved posts from Firebase
  const fetchSavedPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const posts = await getSavedPosts(user.uid);
      setSavedPosts(posts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      showError("Failed to load your saved posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load saved posts when user changes
  useEffect(() => {
    fetchSavedPosts();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please Log In</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          You need to be logged in to view your saved posts.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Saved Posts
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your bookmarked articles ({savedPosts.length})
        </p>
      </div>

      {savedPosts.length > 0 ? (
        // Grid of saved posts
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {savedPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Featured image */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                {/* Category and date */}
                <div className="flex items-center justify-between mb-3">
                  {post.category && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                {/* Post title */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* Post excerpt */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {post.excerpt || 
                    post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                </p>

                {/* Author and engagement stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author?.photoURL || "/default-avatar.png"}
                      alt={post.author?.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {post.author?.displayName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments || 0}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        // Empty state when no saved posts
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No saved posts yet
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Start bookmarking articles you want to read later!
          </p>
          <div className="mt-6">
            <Link
              to="/blogs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Posts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
