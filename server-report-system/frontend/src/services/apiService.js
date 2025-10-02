import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  // Auth methods
  async login(discordCode) {
    return this.post('/auth/discord/callback', { code: discordCode });
  }

  async logout() {
    const response = await this.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Report methods
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/reports${queryString ? '?' + queryString : ''}`);
  }

  async getReport(id) {
    return this.get(`/reports/${id}`);
  }

  async createReport(reportData) {
    return this.post('/reports', reportData);
  }

  async updateReport(id, reportData) {
    return this.put(`/reports/${id}`, reportData);
  }

  async deleteReport(id) {
    return this.delete(`/reports/${id}`);
  }

  async uploadReportAttachment(reportId, file) {
    const formData = new FormData();
    formData.append('attachment', file);
    
    return this.post(`/reports/${reportId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async assignReport(reportId, assigneeId) {
    return this.patch(`/reports/${reportId}/assign`, { assigneeId });
  }

  async updateReportStatus(reportId, status, notes = '') {
    return this.patch(`/reports/${reportId}/status`, { status, notes });
  }

  // User methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/users${queryString ? '?' + queryString : ''}`);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async updateUserRole(id, role) {
    return this.patch(`/users/${id}/role`, { role });
  }

  // Analytics methods
  async getDashboardAnalytics() {
    return this.get('/analytics/dashboard');
  }

  async getReportStats(period = '30d') {
    return this.get(`/analytics/reports?period=${period}`);
  }

  async getUserStats(period = '30d') {
    return this.get(`/analytics/users?period=${period}`);
  }

  async exportReports(format = 'csv', filters = {}) {
    const params = new URLSearchParams({ format, ...filters });
    return this.get(`/analytics/export?${params.toString()}`, {
      responseType: format === 'pdf' ? 'blob' : 'json',
    });
  }

  // Public methods (no auth required)
  async getPublicStats() {
    return this.get('/public/stats');
  }

  // Health check
  async checkHealth() {
    return this.get('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;