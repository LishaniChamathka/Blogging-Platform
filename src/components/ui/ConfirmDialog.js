import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger" 
}) => {
  // Don't show anything if dialog isn't open
  if (!isOpen) return null;

  // Get button styles based on how dangerous/important the action is
  const getConfirmationStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white',
          iconColor: 'text-red-500 dark:text-red-400'
        };
      case 'warning':
        return {
          confirmButton: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white',
          iconColor: 'text-orange-500 dark:text-orange-400'
        };
      default: // info/normal
        return {
          confirmButton: 'bg-[#01003F] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
          iconColor: 'text-[#01003F] dark:text-blue-400'
        };
    }
  };

  const confirmStyles = getConfirmationStyles();

  // Handle the confirm action and close the dialog
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full p-6 border dark:border-gray-700">
        
        {/* Header with warning icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
              <AlertTriangle className={`w-5 h-5 ${confirmStyles.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Confirmation message */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons - Cancel and Confirm */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${confirmStyles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
