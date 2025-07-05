import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Edit, Trash2, FileText } from "lucide-react";
import { 
  getBlogPosts, 
  canEditPost, 
  canDeletePost, 
  deleteBlogPostWithPermission, 
  onAuthStateChangedEnhanced 
} from "../../services/firebase";
import { useModal } from "../../contexts/ModalContext";

const BlogList = () => {
  const { showSuccess, showError, confirmDelete } = useModal();
  
  // User and posts state
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state for search and category
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Available categories for filtering
  const categories = [
    "technology",
    "lifestyle", 
    "business",
    "health",
    "travel",
    "food",
    "other"
  ];

  // Listen for user authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChangedEnhanced(setUser);
    return () => unsubscribe();
  }, []);

  // Load posts when component mounts or user changes
  useEffect(() => {
    loadPosts();
  }, [user]);

  // Fetch all blog posts from Firebase
  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsList = await getBlogPosts();
      setPosts(postsList);
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Format Firebase timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Handle post deletion with confirmation
  const handleDeletePost = async (postId) => {
    if (!user) return;
    
    confirmDelete(async () => {
      try {
        await deleteBlogPostWithPermission(postId, user);
        setPosts(prev => prev.filter(p => p.id !== postId));
        showSuccess("Post deleted successfully");
      } catch (error) {
        console.error("Error deleting post:", error);
        showError("Error deleting post: " + error.message);
      }
    }, "this post");
  };

  // Show loading spinner while fetching posts
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Page header */}
      <div className="w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest Blog Posts</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Discover amazing content from our community</p>
      </div>

      {/* Search and filter controls */}
      <div className="w-full mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        {/* Category filter dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts grid or empty state */}
      {filteredPosts.length > 0 ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
              {/* Post featured image */}
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
                  {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
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
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Edit/Delete buttons for authorized users */}
                {user && (canEditPost(user.role, post.authorId, user.uid) || canDeletePost(user.role, post.authorId, user.uid)) && (
                  <div className="mt-4 flex justify-end space-x-2">
                    {canEditPost(user.role, post.authorId, user.uid) && (
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 text-sm font-medium rounded transition-colors"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    )}
                    {canDeletePost(user.role, post.authorId, user.uid) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 text-sm font-medium rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        // Empty state when no posts match filters
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {selectedCategory ? `No posts found in "${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}" category` : "No posts found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm && selectedCategory ? 
              `Try adjusting your search criteria or browse other categories.` :
              searchTerm ? 
              "Try adjusting your search term." :
              selectedCategory ?
              "No posts have been published in this category yet." :
              "Get started by creating the first post."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
