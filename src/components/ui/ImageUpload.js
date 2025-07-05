import React, { useState } from "react";
import { Upload, X, Image } from "lucide-react";

const ImageUpload = ({ onImageUpload, currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(currentImageUrl || "");
  
  // Show error message to user (could be replaced with toast later)
  const showUserError = (message) => {
    console.error("Image upload error:", message);
    alert(message); // Simple alert for now, can be improved with toast notifications
  };

  // Handle when user selects a file
  const handleFileSelection = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    console.log("User selected file:", selectedFile.name, `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);

    // Check if it's actually an image
    if (!selectedFile.type.startsWith('image/')) {
      showUserError('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    // Make sure image isn't too big (5MB limit)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSizeInBytes) {
      showUserError('Image is too large! Please choose an image smaller than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert image to base64 for storage and preview
      const fileReader = new FileReader();
      
      fileReader.onload = (event) => {
        const base64Image = event.target.result;
        console.log("Successfully converted image to base64");
        setImagePreview(base64Image);
        onImageUpload(base64Image);
        setIsUploading(false);
      };
      
      fileReader.onerror = () => {
        console.error("Failed to read the selected file");
        showUserError("Couldn't process the image. Please try selecting it again.");
        setIsUploading(false);
      };
      
      fileReader.readAsDataURL(selectedFile);
      
    } catch (error) {
      console.error('Unexpected error while processing image:', error);
      showUserError('Something went wrong while processing the image. Please try again.');
      setIsUploading(false);
    }
  };

  // Remove the current image
  const removeCurrentImage = () => {
    setImagePreview("");
    onImageUpload("");
    console.log("Image removed by user");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Featured Image
      </label>
      
      {/* Show image preview if we have one */}
      {imagePreview ? (
        <div className="relative group">
          <img
            src={imagePreview}
            alt="Featured image preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 transition-opacity group-hover:opacity-95"
          />
          <button
            type="button"
            onClick={removeCurrentImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors duration-200 shadow-lg"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Upload area when no image is selected */
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
              <Image className="w-full h-full" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 bg-[#01003F] dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Processing..." : "Choose Image"}
                </span>
              </label>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or drag and drop an image here
              </p>
              
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
            
            <input
              id="image-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileSelection}
              disabled={isUploading}
            />
          </div>
        </div>
      )}

      {/* Show uploading indicator */}
      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent dark:border-blue-400"></div>
          <span className="ml-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
            Processing your image...
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
