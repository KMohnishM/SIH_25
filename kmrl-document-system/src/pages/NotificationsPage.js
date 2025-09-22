// Notifications Page Component
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Badge,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  NotificationsActive,
  NotificationsOff,
  Search,
  MoreVert,
  Delete,
  DoneAll,
  Done,
  Schedule,
  Warning,
  Info,
  CheckCircle,
  Description,
  Person,
  Settings,
  Refresh,
  Clear,
} from '@mui/icons-material';

import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateNotificationSettings,
} from '../store/slices/notificationsSlice';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  
  const {
    notifications,
    unreadCount,
    error,
    settings,
  } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [settingsDialog, setSettingsDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ role: user?.role }));
  }, [dispatch, user?.role]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
    setActionMenu(null);
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications({ role: user?.role }));
  };

  const handleSettingsUpdate = (newSettings) => {
    dispatch(updateNotificationSettings(newSettings));
    setSettingsDialog(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_approval':
        return <CheckCircle color="success" />;
      case 'document_uploaded':
        return <Description color="primary" />;
      case 'deadline_reminder':
        return <Schedule color="warning" />;
      case 'system_alert':
        return <Warning color="error" />;
      case 'user_mention':
        return <Person color="info" />;
      default:
        return <Info color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'document_approval':
        return 'success';
      case 'document_uploaded':
        return 'primary';
      case 'deadline_reminder':
        return 'warning';
      case 'system_alert':
        return 'error';
      case 'user_mention':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.read) ||
                         (statusFilter === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const groupedNotifications = {
    today: filteredNotifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.timestamp);
      return notifDate.toDateString() === today.toDateString();
    }),
    yesterday: filteredNotifications.filter(n => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const notifDate = new Date(n.timestamp);
      return notifDate.toDateString() === yesterday.toDateString();
    }),
    older: filteredNotifications.filter(n => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const notifDate = new Date(n.timestamp);
      return notifDate < twoDaysAgo;
    }),
  };

  const NotificationItem = ({ notification }) => (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        borderLeft: notification.read ? 'none' : '4px solid',
        borderColor: `${getNotificationColor(notification.type)}.main`,
        mb: 1,
        borderRadius: 1,
      }}
    >
      <ListItemIcon>
        <Badge variant="dot" invisible={notification.read} color="primary">
          {getNotificationIcon(notification.type)}
        </Badge>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
              {notification.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatTimeAgo(notification.timestamp)}
            </Typography>
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {notification.message}
            </Typography>
            <Box display="flex" gap={0.5} mt={1}>
              <Chip
                label={notification.type.replace('_', ' ')}
                size="small"
                color={getNotificationColor(notification.type)}
                variant="outlined"
              />
              {notification.priority && (
                <Chip
                  label={notification.priority}
                  size="small"
                  color={notification.priority === 'high' ? 'error' : 'default'}
                  variant="outlined"
                />
              )}
            </Box>
          </>
        }
      />
      
      <ListItemSecondaryAction>
        <Box display="flex" gap={0.5}>
          {!notification.read && (
            <IconButton size="small" onClick={() => handleMarkAsRead(notification.id)}>
              <Done />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              setActionMenu(e.currentTarget);
              setSelectedNotification(notification);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );

  const SettingsDialog = () => {
    if (!user) {
      return null; // or <CircularProgress />
    }
    return (
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography variant="h6" gutterBottom>
              Email Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.document_approval}
                  onChange={(e) =>
                    handleSettingsUpdate({
                      ...settings,
                      email: { ...settings.email, document_approval: e.target.checked },
                    })
                  }
                />
              }
              label="Document Approvals"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.deadline_reminders}
                  onChange={(e) =>
                    handleSettingsUpdate({
                      ...settings,
                      email: { ...settings.email, deadline_reminders: e.target.checked },
                    })
                  }
                />
              }
              label="Deadline Reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.system_alerts}
                  onChange={(e) =>
                    handleSettingsUpdate({
                      ...settings,
                      email: { ...settings.email, system_alerts: e.target.checked },
                    })
                  }
                />
              }
              label="System Alerts"
            />
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Push Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.push.enabled}
                  onChange={(e) =>
                    handleSettingsUpdate({
                      ...settings,
                      push: { ...settings.push, enabled: e.target.checked },
                    })
                  }
                />
              }
              label="Enable Push Notifications"
            />
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Frequency
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Digest Frequency</InputLabel>
              <Select
                value={settings.digest_frequency}
                onChange={(e) =>
                  handleSettingsUpdate({
                    ...settings,
                    digest_frequency: e.target.value,
                  })
                }
              >
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4">
            Notifications
          </Typography>
          <Badge badgeContent={unreadCount} color="primary">
            <NotificationsActive />
          </Badge>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button onClick={handleRefresh} startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button onClick={() => setSettingsDialog(true)} startIcon={<Settings />}>
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} startIcon={<DoneAll />}>
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="document_approval">Document Approval</MenuItem>
                <MenuItem value="document_uploaded">Document Uploaded</MenuItem>
                <MenuItem value="deadline_reminder">Deadline Reminder</MenuItem>
                <MenuItem value="system_alert">System Alert</MenuItem>
                <MenuItem value="user_mention">User Mention</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              {filteredNotifications.length} notifications
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : 'Failed to load notifications'}
        </Alert>
      )}

      {/* Notifications List */}
      <Paper sx={{ overflow: 'hidden' }}>
        {filteredNotifications.length === 0 ? (
          <Box p={4} textAlign="center">
            <NotificationsOff sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No notifications found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You\'re all caught up!'}
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Today */}
            {groupedNotifications.today.length > 0 && (
              <Box>
                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Today
                  </Typography>
                </Box>
                <List sx={{ pt: 0 }}>
                  {groupedNotifications.today.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </List>
              </Box>
            )}

            {/* Yesterday */}
            {groupedNotifications.yesterday.length > 0 && (
              <Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Yesterday
                  </Typography>
                </Box>
                <List sx={{ pt: 0 }}>
                  {groupedNotifications.yesterday.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </List>
              </Box>
            )}

            {/* Older */}
            {groupedNotifications.older.length > 0 && (
              <Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Older
                  </Typography>
                </Box>
                <List sx={{ pt: 0 }}>
                  {groupedNotifications.older.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={() => setActionMenu(null)}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem
            onClick={() => {
              handleMarkAsRead(selectedNotification.id);
              setActionMenu(null);
            }}
          >
            <ListItemIcon><Done /></ListItemIcon>
            <ListItemText>Mark as Read</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleDelete(selectedNotification?.id);
          }}
        >
          <ListItemIcon><Delete /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <SettingsDialog />
    </Box>
  );
};

export default NotificationsPage;