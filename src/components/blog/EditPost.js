import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  getBlogPost, 
  updateBlogPostWithPermission, 
  canEditPost,
  onAuthStateChangedEnhanced 
} from "../../services/firebase";
import { useModal } from "../../contexts/ModalContext";
import ImageUpload from "../ui/ImageUpload";

const EditPost = () => {
  // Modal notifications
  const { showSuccess, showError } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    imageUrl: ""
  });

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

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChangedEnhanced(setUser);
    return () => unsubscribe();
  }, []);

  // Load post data when user is available
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate("/blogs");
        return;
      }

      try {
        const postData = await getBlogPost(id);
        if (!postData) {
          navigate("/blogs");
          return;
        }

        // Check edit permissions
        if (user && !canEditPost(user.role, postData.authorId, user.uid)) {
          showError("You don't have permission to edit this post");
          navigate(`/blog/${postData.slug}`);
          return;
        }

        setPost(postData);
        setFormData({
          title: postData.title || "",
          content: postData.content || "",
          excerpt: postData.excerpt || "",
          category: postData.category || "",
          tags: postData.tags ? postData.tags.join(", ") : "",
          imageUrl: postData.imageUrl || ""
        });
      } catch (error) {
        showError("Error loading post");
        navigate("/blogs");
      } finally {
        setLoading(false);
      }
    };

    if (user !== null) {
      fetchPost();
    }
  }, [id, user]);

  // Sync editor content with form data
  useEffect(() => {
    if (editor && formData.content && editor.getHTML() !== formData.content) {
      editor.commands.setContent(formData.content);
    }
  }, [editor, formData.content]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate URL-friendly slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError("You must be logged in to edit posts");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      showError("Title and content are required");
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        content: formData.content,
        excerpt: formData.excerpt.trim(),
        category: formData.category.trim(),
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        imageUrl: formData.imageUrl.trim(),
        slug: generateSlug(formData.title.trim()),
        updatedAt: new Date()
      };

      await updateBlogPostWithPermission(id, updateData, user);
      showSuccess("Post updated successfully!");
      navigate(`/blog/${updateData.slug}`);
    } catch (error) {
      showError("Error updating post: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Required</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Please log in to edit posts.</p>
      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post not found</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">The post you're trying to edit doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border dark:border-gray-700">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Post</h1>
          <p className="text-gray-600 dark:text-gray-300">Update your blog post</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your post title"
              required
            />
          </div>

          {/* Post Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., Technology, Travel"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Separate tags with commas"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <ImageUpload
              onImageUpload={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
              currentImageUrl={formData.imageUrl}
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
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-md disabled:opacity-50 transition duration-300"
            >
              {submitting ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
