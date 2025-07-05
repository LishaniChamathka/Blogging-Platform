import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChangedEnhanced } from "./services/firebase";
import Header from "./components/layout/Header";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import BlogList from "./components/blog/BlogList";
import CreatePost from "./components/blog/CreatePost";
import EditPost from "./components/blog/EditPost";
import BlogPost from "./components/blog/BlogPost";
import SavedPosts from "./components/blog/SavedPosts";
import AdminDashboard from "./components/admin/AdminDashboard";
import EditProfile from "./components/profile/EditProfile";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ModalProvider } from "./contexts/ModalContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const AppContent = ({ user }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {!isLoginPage && <Header user={user} />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/saved-posts" element={
          <ProtectedRoute user={user}>
            <SavedPosts user={user} />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute user={user}>
            <EditProfile user={user} />
          </ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute user={user} roles={["admin", "editor"]}>
            <CreatePost user={user} />
          </ProtectedRoute>
        } />
        <Route path="/edit-post/:id" element={
          <ProtectedRoute user={user} roles={["admin", "editor"]}>
            <EditPost user={user} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute user={user} roles={["admin"]}>
            <AdminDashboard user={user} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedEnhanced((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ModalProvider>
          <Router>
            <AppContent user={user} />
          </Router>
        </ModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

