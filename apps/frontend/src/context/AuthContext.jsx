import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

/**
 * Authentication Context & State Management
 * -------------------------------------------
 * This Context provides application-wide access to the current user's login state,
 * stored JWT token, profile data, and methods for login, registration, and logout.
 */

// Create the Context object
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wrap this provider around the application in App.jsx so all child components
 * can access auth state via the `useAuth()` hook.
 */
export const AuthProvider = ({ children }) => {
  // State for logged-in user details (e.g. { id, name, email })
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // State for stored JWT token string
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // State for tracking initial session restore loading state
  const [loading, setLoading] = useState(true);

  /**
   * Logout method
   * Clears saved token and user state, redirecting app to unauthenticated state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Effect: On initial app load, if a token exists in localStorage,
   * verify session validity by fetching user profile from the backend API.
   */
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          const userData = response.data?.data?.user || response.data?.user || response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          // If token is invalid or expired, perform automatic logout
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, [token, logout]);

  /**
   * Login method
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Extract data from backend Fastify response structure ({ success, data: { token, user } })
      const resData = response.data?.data || response.data;
      const newToken = resData?.token;
      const userData = resData?.user;

      if (!newToken) {
        throw new Error('Authentication succeeded but no token was returned.');
      }

      // Persist authentication tokens in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  /**
   * Register method
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });

      const resData = response.data?.data || response.data;
      const newToken = resData?.token;
      const userData = resData?.user;

      if (newToken) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Register error in AuthContext:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  // Context value object containing all reactive state and methods
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom Hook: useAuth()
 * Convenient shortcut to consume AuthContext inside any functional component.
 * Usage: const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider component');
  }
  return context;
};

export default AuthContext;
