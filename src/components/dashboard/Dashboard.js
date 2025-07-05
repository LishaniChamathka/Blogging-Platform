import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Bookmark, 
  Plus, 
  Settings, 
  Heart, 
  MessageCircle, 
  FileText, 
  Clock, 
  Search,
  Edit3,
  CheckCircle
} from "lucide-react";
import { getBlogPosts, canCreatePosts, canAccessAdmin } from "../../services/firebase";
import MyPosts from "./MyPosts";

const Dashboard = ({ user }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent posts when component mounts
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const posts = await getBlogPosts(5); // Get last 5 posts
        setRecentPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);

  // Helper functions
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "editor": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  // Check user permissions
  const canUserCreatePosts = canCreatePosts(user?.role);
  const canUserAccessAdmin = canAccessAdmin(user?.role);

  // Render different layouts based on user role
  if (user?.role === "reader") {
    return <ReaderDashboard user={user} recentPosts={recentPosts} loading={loading} formatDate={formatDate} getGreeting={getGreeting} />;
  }

  if (user?.role === "editor") {
    return <EditorDashboard user={user} recentPosts={recentPosts} loading={loading} formatDate={formatDate} getGreeting={getGreeting} />;
  }

  // Default dashboard for admin and other roles
  return (
    <div className="w-full px-4 py-8 bg-gray-50 dark:bg-gray-900">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.displayName}!
            </h1>
            <p className="text-blue-100 dark:text-gray-300">Welcome back to your dashboard</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
              {user?.role || "reader"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/blogs"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-600"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Browse Blogs</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Discover new content</p>
            </div>
          </div>
        </Link>

        <Link
          to="/saved-posts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-600"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <Bookmark className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Saved Posts</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">View your bookmarks</p>
            </div>
          </div>
        </Link>

        {canUserCreatePosts && (
          <Link
            to="/create-post"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-600"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <Plus className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Post</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Share your thoughts</p>
              </div>
            </div>
          </Link>
        )}

        {canUserAccessAdmin && (
          <Link
            to="/admin"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-purple-600"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <Settings className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Panel</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Manage the platform</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Recent Posts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link to="/blogs" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
              View all posts →
            </Link>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            // Posts grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {recentPosts.map((post) => (
                <article key={post.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(post.createdAt)}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                    </p>
                    
                    {/* Author and engagement */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={post.author?.photoURL || "/default-avatar.png"}
                          alt={post.author?.displayName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{post.author?.displayName}</span>
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
            // Empty state
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No posts yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first post.</p>
              {canUserCreatePosts && (
                <div className="mt-6">
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple Reader Dashboard - focused on reading experience
const ReaderDashboard = ({ user, recentPosts, loading, formatDate, getGreeting }) => {
  return (
    <div className="w-full px-4 py-8 bg-gray-50 dark:bg-gray-900">
      {/* Reader Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={user?.photoURL || "/default-avatar.png"}
            alt={user?.displayName}
            className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-700"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {getGreeting()}, {user?.displayName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Ready to discover amazing content?</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/blogs"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Browse All Posts</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Explore our content</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/saved-posts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-lg">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Saved Posts</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Your bookmarks</p>
            </div>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Latest Posts</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{recentPosts.length} available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-2" /> Latest Posts
            </h2>
            <Link to="/blogs" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              View all →
            </Link>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts.slice(0, 4).map((post) => (
                <article key={post.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      {post.category && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                          {post.category}
                        </span>
                      )}
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={post.author?.photoURL || "/default-avatar.png"}
                          alt={post.author?.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author?.displayName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" /> {post.likes || 0}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" /> {post.comments || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No posts available yet</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Check back later for new content!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Editor Dashboard - focused on content creation
const EditorDashboard = ({ user, recentPosts, loading, formatDate, getGreeting }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [myPostsLoading, setMyPostsLoading] = useState(true);

  // Fetch editor's own posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (user?.uid) {
        try {
          setMyPostsLoading(true);
          const { getUserPosts } = await import("../../services/firebase");
          const userPosts = await getUserPosts(user.uid, true); // Get all statuses
          setMyPosts(userPosts);
        } catch (error) {
          console.error("Error fetching my posts:", error);
        } finally {
          setMyPostsLoading(false);
        }
      }
    };
    
    fetchMyPosts();
  }, [user?.uid]);

  // Calculate post statistics
  const postStats = myPosts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full px-4 py-8 bg-gray-50 dark:bg-gray-900">
      {/* Editor Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={user?.photoURL || "/default-avatar.png"}
              alt={user?.displayName}
              className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-700"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {getGreeting()}, {user?.displayName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Ready to create something amazing?</p>
            </div>
          </div>
          <div className="text-right">
            <Link
              to="/create-post"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Post
            </Link>
          </div>
        </div>
      </div>

      {/* Editor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border-l-4 border-green-600">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{postStats.approved || 0}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Published Posts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border-l-4 border-yellow-600">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{postStats.pending || 0}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border-l-4 border-gray-600">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{postStats.draft || 0}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Drafts</p>
            </div>
          </div>
        </div>

        <Link 
          to="/create-post" 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border-l-4 border-blue-600 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Edit3 className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Create</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">New Article</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Content Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-6 h-6 mr-2" /> My Posts Management
          </h2>
        </div>

        <div className="p-6">
          {myPostsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <MyPosts user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
