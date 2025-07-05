import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const AlertDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  variant = "info", 
  buttonText = "OK"
}) => {
  // Don't render anything if the dialog isn't open
  if (!isOpen) return null;

  // Get the right styles and icon based on the message type
  const getAlertStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />,
          iconBg: 'bg-green-50 dark:bg-green-900/20',
          titleColor: 'text-green-800 dark:text-green-300',
          buttonStyle: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
        };
      case 'error':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />,
          iconBg: 'bg-red-50 dark:bg-red-900/20',
          titleColor: 'text-red-800 dark:text-red-300',
          buttonStyle: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-orange-500 dark:text-orange-400" />,
          iconBg: 'bg-orange-50 dark:bg-orange-900/20',
          titleColor: 'text-orange-800 dark:text-orange-300',
          buttonStyle: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
        };
      default: // info
        return {
          icon: <Info className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
          iconBg: 'bg-blue-50 dark:bg-blue-900/20',
          titleColor: 'text-blue-800 dark:text-blue-300',
          buttonStyle: 'bg-[#01003F] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
        };
    }
  };

  const alertStyles = getAlertStyles();

  // Default titles for each variant if none provided
  const getDefaultTitle = () => {
    if (title) return title;
    
    switch (variant) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return 'Information';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full p-6 border dark:border-gray-700">
        
        {/* Header with icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${alertStyles.iconBg}`}>
              {alertStyles.icon}
            </div>
            <h3 className={`text-lg font-semibold ${alertStyles.titleColor}`}>
              {getDefaultTitle()}
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

        {/* Message content */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* OK button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg transition-colors font-medium text-white ${alertStyles.buttonStyle}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
