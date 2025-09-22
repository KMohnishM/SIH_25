// Authentication API Service
import apiClient from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    // Backend expects form data for OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('authToken');
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },
};

// Documents API Service
export const documentsService = {
  // Get documents with filters
  getDocuments: async (params = {}) => {
    // Remove filters with value 'all' or empty string
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        filteredParams[key] = params[key];
      }
    });
    const response = await apiClient.get('/documents', { params: filteredParams });
    return response.data;
  },

  // Get single document details
  getDocument: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  // Upload single document
  uploadDocument: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('summary', metadata.summary || '');
    formData.append('type', metadata.type);
    formData.append('department', metadata.department);
    formData.append('priority', metadata.priority || 'medium');
    
    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update document
  updateDocument: async (documentId, updateData) => {
    const response = await apiClient.put(`/documents/${documentId}`, updateData);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Approve document
  approveDocument: async (documentId, comments = '') => {
    const response = await apiClient.post(`/documents/${documentId}/approve`, {
      comments: comments
    });
    return response.data;
  },

  // Reject document
  rejectDocument: async (documentId, comments = '') => {
    const response = await apiClient.post(`/documents/${documentId}/reject`, {
      comments: comments
    });
    return response.data;
  },

  // Get workflow history
  getWorkflowHistory: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}/workflow`);
    return response.data;
  },

  // Download document
  downloadDocument: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}/download`);
    return response.data;
  },

  // Get document preview
  getDocumentPreview: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}/preview`);
    return response.data;
  },

  // Request revision
  requestRevision: async (documentId, revisionData) => {
    const response = await apiClient.post(`/documents/${documentId}/request-revision`, revisionData);
    return response.data;
  },
};

// Comments API Service
export const commentsService = {
  // Get document comments
  getDocumentComments: async (documentId, params = {}) => {
    const response = await apiClient.get(`/documents/${documentId}/comments`, { params });
    return response.data;
  },

  // Add comment to document
  addComment: async (documentId, commentData) => {
    const response = await apiClient.post(`/documents/${documentId}/comments`, commentData);
    return response.data;
  },

  // Update comment
  updateComment: async (commentId, updateData) => {
    const response = await apiClient.put(`/comments/${commentId}`, updateData);
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};

// Notifications API Service
export const notificationsService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get notification settings
  getSettings: async () => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings
  updateSettings: async (settings) => {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  },
};

// Dashboard API Service
export const dashboardService = {
  // Get dashboard overview
  getOverview: async (params = {}) => {
    const response = await apiClient.get('/dashboard/overview', { params });
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (params = {}) => {
    const response = await apiClient.get('/dashboard/analytics', { params });
    return response.data;
  },
};

// Users API Service (Admin)
export const usersService = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Create user
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, updateData) => {
    const response = await apiClient.put(`/users/${userId}`, updateData);
    return response.data;
  },

  // Deactivate user
  deactivateUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },
};