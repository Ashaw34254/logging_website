import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle different error status codes
    if (response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      toast.error('Your session has expired. Please log in again.');
    } else if (response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (response?.status === 404) {
      toast.error('The requested resource was not found.');
    } else if (response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (response?.status >= 500) {
      toast.error('Server error occurred. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Check authentication status
  checkAuth: () => api.get('/auth/check'),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/user'),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get all users (admin only)
  getAllUsers: (page = 1, limit = 20) => 
    api.get(`/auth/users?page=${page}&limit=${limit}`),
  
  // Update user role (admin only)
  updateUserRole: (userId, role) => 
    api.patch(`/auth/users/${userId}/role`, { role }),
  
  // Delete user (owner only)
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
};

// Reports API
export const reportsAPI = {
  // Get all reports with filtering
  getAllReports: (filters = {}, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      )
    });
    return api.get(`/reports?${params}`);
  },
  
  // Get specific report
  getReport: (id) => api.get(`/reports/${id}`),
  
  // Get user's own reports
  getUserReports: (page = 1, limit = 20) => 
    api.get(`/reports/user/mine?page=${page}&limit=${limit}`),
  
  // Create new report
  createReport: (reportData, files = []) => {
    const formData = new FormData();
    
    // Add report data
    Object.keys(reportData).forEach(key => {
      if (reportData[key] != null) {
        formData.append(key, reportData[key]);
      }
    });
    
    // Add files
    files.forEach(file => {
      formData.append('attachments', file);
    });
    
    return api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Submit report (public endpoint)
  submitReport: (reportData, files = []) => {
    const formData = new FormData();
    
    Object.keys(reportData).forEach(key => {
      if (reportData[key] != null) {
        formData.append(key, reportData[key]);
      }
    });
    
    files.forEach(file => {
      formData.append('attachments', file);
    });
    
    return api.post('/reports/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Update report status
  updateReportStatus: (id, status, notes = '') => 
    api.patch(`/reports/${id}/status`, { status, notes }),
  
  // Assign report
  assignReport: (id, handledBy) => 
    api.patch(`/reports/${id}/assign`, { handled_by: handledBy }),
  
  // Add attachment
  addAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/reports/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Download attachment
  downloadAttachment: (reportId, attachmentId) => 
    api.get(`/reports/${reportId}/attachments/${attachmentId}`, {
      responseType: 'blob',
    }),
  
  // Reopen report
  reopenReport: (id, reason) => 
    api.post(`/reports/${id}/reopen`, { reason }),
  
  // Delete report (admin only)
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
  
  // Get report statistics
  getReportStats: (dateFrom, dateTo) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    return api.get(`/analytics/reports?${params}`);
  },
  
  // Get staff performance
  getStaffPerformance: (dateFrom, dateTo) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    return api.get(`/analytics/staff?${params}`);
  },
  
  // Get trend data
  getTrendData: (dateFrom, dateTo) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    return api.get(`/analytics/trends?${params}`);
  },
  
  // Get analytics by period
  getAnalyticsByPeriod: (period = 'month') => 
    api.get(`/analytics/period?period=${period}`),
  
  // Get public statistics
  getPublicStats: () => api.get('/analytics/public'),
  
  // Export reports
  exportReports: (format = 'csv', filters = {}) => {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      )
    });
    return api.get(`/analytics/export/reports?${params}`, {
      responseType: 'blob',
    });
  },
  
  // Generate automated report
  generateAutomatedReport: (period) => 
    api.get(`/analytics/export/automated/${period}`),
};

// Utility functions
export const apiUtils = {
  // Handle file download
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  
  // Format error message
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  // Check if user has permission
  hasPermission: (userRole, requiredRole) => {
    const roleHierarchy = {
      'support': 1,
      'moderator': 2,
      'admin': 3,
      'owner': 4
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },
  
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Format date
  formatDate: (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },
  
  // Get relative time
  getRelativeTime: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }
};

export default api;