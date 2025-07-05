import Login from "../auth/Login";

const ProtectedRoute = ({ children, user, roles = [] }) => {
  // Redirect to login if user is not authenticated
  if (!user) {
    return <Login />;
  }
  
  // Check role-based access if roles are specified
  if (roles.length > 0) {
    const hasRequiredRole = user.role && roles.includes(user.role);
    
    if (!hasRequiredRole) {
      return <AccessDenied userRole={user.role} requiredRoles={roles} />;
    }
  }
  
  // User is authenticated and has required permissions
  return children;
};

// Separate component for access denied state
const AccessDenied = ({ userRole, requiredRoles }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center">
          {/* Warning icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          {/* Error message */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don't have permission to access this page.
          </p>
          
          {/* Role information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Your role:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {userRole || "None"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Required:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {requiredRoles.join(", ")}
              </span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-3">
            <button 
              onClick={handleGoBack}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={handleGoHome}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
