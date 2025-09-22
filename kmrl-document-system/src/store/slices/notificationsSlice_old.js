// Notifications Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsService } from '../../services/apiServices';

// Mock data
const mockNotifications = [
  {
    id: 'notif-1',
    type: 'document_action',
    title: 'Document Approved',
    message: 'Safety Protocol v2.1 has been approved',
    documentId: 'doc-1',
    timestamp: '2024-12-12T10:30:00Z',
    isRead: false,
    priority: 'medium',
    department: 'Safety',
    actionRequired: false
  },
  {
    id: 'notif-2',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Dec 15, 2024 from 2:00 AM to 4:00 AM',
    timestamp: '2024-12-12T08:00:00Z',
    isRead: false,
    priority: 'high',
    actionRequired: false
  },
  {
    id: 'notif-3',
    type: 'document_action',
    title: 'Review Required',
    message: 'Emergency Response Plan requires your review',
    documentId: 'doc-3',
    timestamp: '2024-12-11T16:45:00Z',
    isRead: true,
    priority: 'high',
    department: 'Operations',
    actionRequired: true
  },
  {
    id: 'notif-4',
    type: 'comment',
    title: 'New Comment',
    message: 'John Smith commented on Training Manual v3.0',
    documentId: 'doc-2',
    timestamp: '2024-12-11T14:20:00Z',
    isRead: true,
    priority: 'low',
    department: 'Training',
    actionRequired: false
  }
];

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let filteredNotifications = [...mockNotifications];
    
    // Apply filters
    if (params.type && params.type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === params.type);
    }
    
    if (params.priority && params.priority !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.priority === params.priority);
    }
    
    if (params.unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }
    
    if (params.department && params.department !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.department === params.department);
    }
    
    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      notifications: filteredNotifications,
      total: filteredNotifications.length,
      unreadCount: filteredNotifications.filter(n => !n.isRead).length
    };
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return notificationId;
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return settings;
  }
);

// Initial state
const initialState = {
  notifications: [],
  loading: false,
  error: null,
  total: 0,
  unreadCount: 0,
  filters: {
    type: 'all',
    priority: 'all',
    department: 'all',
    unreadOnly: false
  },
  settings: {
    email: {
      document_approval: true,
      deadline_reminders: true,
      system_updates: true,
      comments: true
    },
    push: {
      document_approval: true,
      deadline_reminders: true,
      system_updates: false,
      comments: true
    },
    frequency: 'immediate' // immediate, daily, weekly
  },
  wsConnection: null
};

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.total += 1;
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setWsConnection: (state, action) => {
      state.wsConnection = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.total = action.payload.total;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          notification => notification.id !== action.payload
        );
        state.total -= 1;
      })
      // Update notification settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      });
  }
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  setFilters,
  setWsConnection,
  clearError
} = notificationsSlice.actions;

export default notificationsSlice.reducer;