import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';
import notificationService from '../services/notifications';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up notifications when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      notificationService.connect(state.user);
    } else {
      notificationService.disconnect();
    }

    return () => {
      notificationService.disconnect();
    };
  }, [state.isAuthenticated, state.user]);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.checkAuth();
      
      if (response.data.authenticated && response.data.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Login (redirect to Discord OAuth)
  const login = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/discord`;
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      notificationService.disconnect();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, clear local state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      notificationService.disconnect();
      toast.error('Logout failed, but you have been logged out locally');
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      return response.data.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      if (error.response?.status === 401) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
      throw error;
    }
  };

  // Update user role (admin only)
  const updateUserRole = async (userId, role) => {
    try {
      const response = await authAPI.updateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      return response.data;
    } catch (error) {
      const message = apiUtils.getErrorMessage(error);
      toast.error(`Failed to update user role: ${message}`);
      throw error;
    }
  };

  // Delete user (owner only)
  const deleteUser = async (userId) => {
    try {
      await authAPI.deleteUser(userId);
      toast.success('User deleted successfully');
    } catch (error) {
      const message = apiUtils.getErrorMessage(error);
      toast.error(`Failed to delete user: ${message}`);
      throw error;
    }
  };

  // Get all users (admin only)
  const getAllUsers = async (page = 1, limit = 20) => {
    try {
      const response = await authAPI.getAllUsers(page, limit);
      return response.data;
    } catch (error) {
      const message = apiUtils.getErrorMessage(error);
      toast.error(`Failed to fetch users: ${message}`);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific permission
  const hasPermission = (requiredRole) => {
    if (!state.user || !state.isAuthenticated) {
      return false;
    }
    return apiUtils.hasPermission(state.user.role, requiredRole);
  };

  // Check if user can access specific report type
  const canAccessReportType = (reportType) => {
    if (!state.user || !state.isAuthenticated) {
      return false;
    }

    const permissions = {
      'support': ['bug_report', 'feedback'],
      'moderator': ['player_report', 'bug_report', 'feedback'],
      'admin': ['player_report', 'bug_report', 'feedback'],
      'owner': ['player_report', 'bug_report', 'feedback']
    };

    return permissions[state.user.role]?.includes(reportType) || false;
  };

  // Get user's display name
  const getUserDisplayName = (user = state.user) => {
    if (!user) return 'Unknown User';
    return user.discriminator 
      ? `${user.username}#${user.discriminator}`
      : user.username;
  };

  // Get user's avatar URL
  const getUserAvatarUrl = (user = state.user) => {
    if (!user || !user.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${(user?.discriminator || 0) % 5}.png`;
    }
    return `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=128`;
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      'support': 'text-blue-600 bg-blue-100',
      'moderator': 'text-green-600 bg-green-100',
      'admin': 'text-purple-600 bg-purple-100',
      'owner': 'text-red-600 bg-red-100',
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    const names = {
      'support': 'Support',
      'moderator': 'Moderator',
      'admin': 'Administrator',
      'owner': 'Owner',
    };
    return names[role] || role;
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    logout,
    refreshUser,
    updateUserRole,
    deleteUser,
    getAllUsers,
    clearError,
    
    // Utilities
    hasPermission,
    canAccessReportType,
    getUserDisplayName,
    getUserAvatarUrl,
    getRoleColor,
    getRoleDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return (props) => {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-discord-500 hover:bg-discord-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (requiredRole && !hasPermission(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Required role: {requiredRole}
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthContext;