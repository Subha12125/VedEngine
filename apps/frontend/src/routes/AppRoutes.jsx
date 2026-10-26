
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Documents from '../pages/Documents';
import Analytics from '../pages/Analytics';

/**
 * AdminRoute Component
 * Guards admin-only routes (Documents & Analytics).
 * Non-admin users & guests attempting to access these routes are redirected to /dashboard.
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Authenticating admin session..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * PublicOnlyRoute Component
 * Guards auth pages (Login, Register).
 * If user is already logged in, redirects them to /dashboard.
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Authenticating session..." fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Search Dashboard - ACCESSIBLE TO EVERYONE (GUESTS & LOGGED-IN USERS) */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Authentication Routes (For guest visitors to sign in) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Admin-Only Routes (Documents & Analytics) */}
      <Route
        path="/documents"
        element={
          <AdminRoute>
            <Documents />
          </AdminRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        }
      />

      {/* Default Fallback Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
