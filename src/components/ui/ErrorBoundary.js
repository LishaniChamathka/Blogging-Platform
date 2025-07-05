// Error boundary to catch crashes and show a friendly error page
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  // This gets called when an error happens
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // This logs the error details for debugging
  componentDidCatch(error, errorInfo) {
    console.error("Something broke in the app:", error, errorInfo);
    this.setState({ errorInfo });
  }

  // Reset the error state and try again
  handleTryAgain = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  // Reload the entire page
  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    // If something went wrong, show the error page
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            
            {/* Error icon and title */}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg 
                  className="h-8 w-8 text-red-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Oops! Something went wrong
                </h3>
              </div>
            </div>

            {/* Error message */}
            <div className="mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We're sorry, but something unexpected happened. Don't worry - your data is safe. 
                You can try refreshing the page or try again.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={this.handleRefresh}
                className="bg-[#01003F] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleTryAgain}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
              >
                Try Again
              </button>
            </div>

            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <summary className="text-sm text-red-700 dark:text-red-300 cursor-pointer font-medium">
                  Error Details (Development Only)
                </summary>
                <div className="mt-3 space-y-2">
                  <pre className="text-xs text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 p-3 rounded border overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 p-3 rounded border overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // If everything is fine, just render the children
    return this.props.children;
  }
}

export default ErrorBoundary;
