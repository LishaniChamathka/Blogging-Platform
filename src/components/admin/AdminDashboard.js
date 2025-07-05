import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, FileText, BarChart3, TrendingUp, Heart, X, Calendar, User, Tag, MessageCircle } from "lucide-react";
import { getAllUsers, getBlogPosts, updateUserRoleWithPermission, deleteBlogPostWithPermission } from "../../services/firebase";
import PendingPostsManager from "./PendingPostsManager";
import { useModal } from "../../contexts/ModalContext";

const AdminDashboard = ({ user }) => {
  // Modal and state management
  const { showSuccess, showError, confirmDelete } = useModal();
  const [searchParams] = useSearchParams();
  
  // Data states
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "pending");

  // Load admin data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, postsData] = await Promise.all([getAllUsers(), getBlogPosts()]);
        setUsers(usersData);
        setPosts(postsData);
      } catch (error) {
        showError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateUserRoleWithPermission(userId, newRole, user);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showSuccess("Role updated successfully");
    } catch (error) {
      showError("Failed to update role");
    }
  };

  const deletePost = async (postId) => {
    confirmDelete(async () => {
      try {
        await deleteBlogPostWithPermission(postId, user);
        setPosts(prev => prev.filter(p => p.id !== postId));
        showSuccess("Post deleted successfully");
      } catch (error) {
        showError("Failed to delete post");
      }
    }, "this post");
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const closeModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Stats calculations
  const stats = {
    totalUsers: users.length,
    totalPosts: posts.length,
    admins: users.filter(u => u.role === "admin").length,
    editors: users.filter(u => u.role === "editor").length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Simple stat card component
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-6 py-8 bg-white dark:bg-black min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users and posts</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats.totalUsers} 
          color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" 
        />
        <StatCard 
          icon={FileText} 
          label="Total Posts" 
          value={stats.totalPosts} 
          color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Admins" 
          value={stats.admins} 
          color="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300" 
        />
        <StatCard 
          icon={BarChart3} 
          label="Editors" 
          value={stats.editors} 
          color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300" 
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            {[
              { id: "pending", label: "Pending Posts" },
              { id: "users", label: `Users (${stats.totalUsers})` },
              { id: "posts", label: `Posts (${stats.totalPosts})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "pending" && <PendingPostsManager user={user} />}
          
          {/* Users Management Tab */}
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["User", "Email", "Role", "Joined", "Actions"].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(userItem => (
                    <tr key={userItem.id}>
                      {/* User info with avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={userItem.photoURL || "/default-avatar.png"}
                            alt={userItem.displayName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {userItem.displayName}
                          </div>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {userItem.email}
                      </td>
                      
                      {/* Role selector */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userItem.role || "reader"}
                          onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-2 py-1"
                          disabled={userItem.id === user.uid}
                        >
                          <option value="reader">Reader</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      
                      {/* Join date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(userItem.createdAt)}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {userItem.id === user.uid ? "Current User" : "Manage"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Posts Management Tab */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No posts found</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Post title */}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {post.title}
                        </h3>
                        
                        {/* Post metadata */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span>By {post.author?.displayName}</span>
                          <span>{formatDate(post.createdAt)}</span>
                          {post.category && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                              {post.category}
                            </span>
                          )}
                        </div>
                        
                        {/* Post excerpt */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                        </p>
                        
                        {/* Post stats */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span><Heart className="w-4 h-4 inline mr-1" /> {post.likes || 0}</span>
                          <span><MessageCircle className="w-4 h-4 inline mr-1" /> {post.comments || 0}</span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => openPostModal(post)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Post Details Modal */}
        {showPostModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Post Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedPost.title}</h1>
                  
                  {/* Post Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>By {selectedPost.author?.displayName || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedPost.createdAt)}</span>
                    </div>
                    {selectedPost.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                          {selectedPost.category}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{selectedPost.likes || 0} likes</span>
                    </div>
                  </div>

                  {/* Post Image */}
                  {selectedPost.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={selectedPost.imageUrl}
                        alt={selectedPost.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Post Excerpt */}
                  {selectedPost.excerpt && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Excerpt</h3>
                      <p className="text-gray-700 dark:text-gray-300 italic">{selectedPost.excerpt}</p>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Content</h3>
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>

                {/* Post Stats */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.likes || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Likes</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.comments || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comments</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.views || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.open(`/blog/${selectedPost.slug}`, '_blank')}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  View Live Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
