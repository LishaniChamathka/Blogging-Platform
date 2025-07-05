import React, { useState, useEffect } from "react";
import { X, User, Mail, Shield, Globe, MapPin, FileText } from "lucide-react";
import { updateUserProfile, onAuthStateChangedEnhanced } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../contexts/ModalContext";

const EditProfile = ({ isModal = false, isOpen = true, onClose }) => {
  const { showSuccess, showError } = useModal();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    bio: "",
    website: "",
    location: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChangedEnhanced((userData) => {
      if (userData) {
        setUser(userData);
        setFormData({
          displayName: userData.displayName || "",
          email: userData.email || "",
          bio: userData.bio || "",
          website: userData.website || "",
          location: userData.location || ""
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        bio: formData.bio,
        website: formData.website,
        location: formData.location
      });
      showSuccess("Profile updated successfully!");
      
      if (isModal && onClose) {
        onClose();
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate("/dashboard");
    }
  };

  // Early return for modal when not open
  if (isModal && !isOpen) return null;

  // Loading state
  if (loading) {
    const loadingContent = (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01003F] dark:border-blue-400"></div>
      </div>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            {loadingContent}
          </div>
        </div>
      );
    }
    return loadingContent;
  }

  // Authentication check
  if (!user) {
    const authContent = (
      <div className="text-center">
        <h2 className={`${isModal ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white`}>
          Authentication Required
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Please log in to edit your profile.</p>
        {isModal && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#01003F] dark:bg-blue-700 text-white rounded-md hover:bg-blue-800 dark:hover:bg-blue-800"
          >
            Close
          </button>
        )}
      </div>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md border border-gray-200 dark:border-gray-700">
            {authContent}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        {authContent}
      </div>
    );
  }

  // Form content
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Section */}
      <div className={`flex items-center space-x-6 ${isModal ? 'p-4 bg-gray-50 dark:bg-gray-700 rounded-lg' : ''}`}>
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt={user.displayName}
          className={`${isModal ? 'w-16 h-16 border-4 border-white dark:border-gray-600 shadow-md' : 'w-20 h-20'} rounded-full object-cover`}
        />
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Picture</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isModal ? 'Managed through your Google account' : 'Your profile picture is managed through your Google account'}
          </p>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className={`${isModal ? 'flex items-center' : 'block'} text-sm font-medium text-gray-700 dark:text-gray-300 mb-2`}>
          {isModal && <User className="w-4 h-4 mr-2" />}
          Display Name
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleInputChange}
          className={`w-full ${isModal ? 'px-4 py-3' : 'px-3 py-2'} border border-gray-300 dark:border-gray-600 ${isModal ? 'rounded-lg focus:ring-2 focus:ring-[#01003F] dark:focus:ring-blue-400 focus:border-[#01003F] dark:focus:border-blue-400' : 'rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'} bg-white dark:bg-gray-${isModal ? '700' : '800'} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
          placeholder="Your display name"
        />
      </div>

      {/* Email (Read-only) */}
      <div>
        <label htmlFor="email" className={`${isModal ? 'flex items-center' : 'block'} text-sm font-medium text-gray-700 dark:text-gray-300 mb-2`}>
          {isModal && <Mail className="w-4 h-4 mr-2" />}
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          readOnly
          className={`w-full ${isModal ? 'px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-600' : 'px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700'} border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400`}
          placeholder="your@email.com"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={`${isModal ? 'flex items-center' : 'block'} text-sm font-medium text-gray-700 dark:text-gray-300 mb-2`}>
          {isModal && <FileText className="w-4 h-4 mr-2" />}
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={3}
          className={`w-full ${isModal ? 'px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#01003F] dark:focus:ring-blue-400 focus:border-[#01003F] dark:focus:border-blue-400' : 'px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-${isModal ? '700' : '800'} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none`}
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Role Display */}
      <div>
        <label className={`${isModal ? 'flex items-center' : 'block'} text-sm font-medium text-gray-700 dark:text-gray-300 mb-2`}>
          {isModal && <Shield className="w-4 h-4 mr-2" />}
          Account Role
        </label>
        <div className={`${isModal ? 'px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg' : 'px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md'} border border-gray-300 dark:border-gray-600`}>
          <span className={`text-sm font-medium text-[#01003F] dark:text-${isModal ? 'blue-400' : 'white'} capitalize`}>
            {user.role}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Role is managed by administrators</p>
      </div>
    </form>
  );

  // Action buttons
  const actionButtons = (
    <div className={`flex justify-end space-x-4 ${isModal ? '' : 'pt-6'}`}>
      <button
        type="button"
        onClick={handleCancel}
        className={`px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-${isModal ? '200' : '300'} ${isModal ? 'rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600' : 'bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`}
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={saving}
        className={`px-6 py-2 bg-[#01003F] dark:bg-blue-700 text-white ${isModal ? 'rounded-lg' : 'rounded-md'} hover:bg-blue-800 dark:hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center`}
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );

  // Modal layout
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Update your personal information</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {formContent}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            {actionButtons}
          </div>
        </div>
      </div>
    );
  }

  // Page layout
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your personal information</p>
        </div>

        {formContent}
        {actionButtons}
      </div>
    </div>
  );
};

export default EditProfile;
