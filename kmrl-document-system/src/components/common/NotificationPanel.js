// Notification Panel Component
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  Close,
  Circle,
  CheckCircle,
  Warning,
  Info,
  Error,
} from '@mui/icons-material';

import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from '../../store/slices/notificationsSlice';

const NotificationPanel = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications());
    }
  }, [open, dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_approval':
        return <CheckCircle color="success" />;
      case 'deadline_reminder':
        return <Warning color="warning" />;
      case 'system_alert':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Notifications ({unreadCount})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {unreadCount > 0 && (
          <Box mb={2}>
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              variant="outlined"
            >
              Mark All as Read
            </Button>
          </Box>
        )}

        <Divider />

        <List sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {notifications.filter(n => !n.isRead).length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No new notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          ) : (
            notifications.filter(n => !n.isRead).map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderLeft: notification.isRead ? 'none' : '4px solid',
                  borderColor: `${getPriorityColor(notification.priority)}.main`,
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.priority}
                        size="small"
                        color={getPriorityColor(notification.priority)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                      {!notification.isRead && (
                        <Button
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ mt: 1 }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Box>
                  }
                />
                {!notification.read && (
                  <Circle color="primary" sx={{ fontSize: 8, ml: 1 }} />
                )}
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;