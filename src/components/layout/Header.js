import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logOut, canCreatePosts, canAccessAdmin } from "../../services/firebase";
import NotificationDropdown from "../dashboard/NotificationDropdown";
import EditProfile from "../profile/EditProfile";
import ThemeToggle from "../ui/ThemeToggle";

const Header = ({ user }) => {
  const navigate = useNavigate();
  
  // State for mobile menu and dropdowns
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  // Close dropdowns when clicking menu items
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="bg-white dark:bg-black shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="w-59 h-12 mr-2" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/blogs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300">
              All Blogs
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition duration-300">
                  Dashboard
                </Link>
                <Link to="/saved-posts" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition duration-300">
                  Saved Posts
                </Link>
                
                {/* Show create post link for editors and admins */}
                {canCreatePosts(user.role) && (
                  <Link to="/create-post" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition duration-300">
                    Create Post
                  </Link>
                )}
                
                {/* Show admin link for admins only */}
                {canAccessAdmin(user.role) && (
                  <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition duration-300">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />
            
            {user ? (
              <>
                {/* Notifications */}
                <NotificationDropdown user={user} />
                
                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user.photoURL || "/default-avatar.png"}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300 hidden sm:block font-medium">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User dropdown menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          setIsEditProfileModalOpen(true);
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login button for non-authenticated users */
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/blogs" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                onClick={closeMenus}
              >
                All Blogs
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/saved-posts" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    onClick={closeMenus}
                  >
                    Saved Posts
                  </Link>
                  
                  {canCreatePosts(user.role) && (
                    <Link 
                      to="/create-post" 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                      onClick={closeMenus}
                    >
                      Create Post
                    </Link>
                  )}
                  
                  {canAccessAdmin(user.role) && (
                    <Link 
                      to="/admin" 
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                      onClick={closeMenus}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfile 
        isModal={true}
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
