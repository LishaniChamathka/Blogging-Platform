import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createBlogPostWithPermission, submitPostForReview } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useModal } from "../../contexts/ModalContext";
import ImageUpload from "../ui/ImageUpload";

const CreatePost = ({ user }) => {
  // Modal notifications
  const { showSuccess, showError } = useModal();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    imageUrl: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [savedPostId, setSavedPostId] = useState(null);
  const [error, setError] = useState("");

  // Rich text editor setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, content: html }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4'
      }
    }
  });

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save post as draft
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const slug = slugify(formData.title, { lower: true, strict: true });
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        category: formData.category,
        tags: tagsArray,
        imageUrl: formData.imageUrl,
        slug,
        author: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };

      const postId = await createBlogPostWithPermission(postData, user);
      setSavedPostId(postId);
      showSuccess("Post saved as draft successfully!");
      
    } catch (error) {
      setError(`Failed to save draft: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit post for admin review
  const handleSubmitForReview = async () => {
    if (!savedPostId) {
      setError("Please save as draft first");
      return;
    }

    setSubmitLoading(true);
    setError("");

    try {
      await submitPostForReview(savedPostId);
      showSuccess("Post submitted for admin review!");
      navigate("/dashboard");
    } catch (error) {
      setError("Error submitting for review: " + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create New Post</h1>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveDraft} className="space-y-6">
            {/* Post Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter post title"
                required
              />
            </div>

            {/* Post Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select a category</option>
                <option value="technology">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="react, javascript, web development"
              />
            </div>

            {/* Featured Image */}
            <div>
              <ImageUpload
                onImageUpload={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
                currentImageUrl={formData.imageUrl}
              />
            </div>

            {/* Post Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt (optional)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Brief description of your post..."
              />
            </div>

            {/* Post Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  {[
                    { label: 'Bold', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
                    { label: 'Italic', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
                    { label: 'H1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }) },
                    { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
                    { label: 'H3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
                    { label: '• List', action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
                    { label: '1. List', action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
                    { label: 'Code', action: () => editor?.chain().focus().toggleCodeBlock().run(), active: editor?.isActive('codeBlock') },
                  ].map((button) => (
                    <button
                      key={button.label}
                      type="button"
                      onClick={button.action}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        button.active 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
                
                {/* Editor Content */}
                <div className="bg-white dark:bg-gray-800 min-h-[300px] text-gray-900 dark:text-white p-4">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6">
              {/* Status Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
                  {error}
                </div>
              )}
              
              {savedPostId && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
                  ✅ Post saved as draft! You can now submit it for review.
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-3 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 disabled:opacity-50 transition duration-300"
                >
                  {loading ? "Saving..." : "Save as Draft"}
                </button>
                
                {savedPostId && (
                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={submitLoading}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 transition duration-300"
                  >
                    {submitLoading ? "Submitting..." : "Submit for Review"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreatePost;
