// Dashboard Page Component
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Description,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';

import { fetchDashboardOverview } from '../store/slices/dashboardSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { overview, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (user?.role) {
      dispatch(fetchDashboardOverview({ role: user.role }));
    }
  }, [dispatch, user?.role]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load dashboard: {typeof error === 'string' ? error : 'An error occurred'}
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value || 0}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const AlertCard = ({ alert }) => (
    <ListItem>
      <ListItemIcon>
        {alert.type === 'compliance_deadline' && <Schedule color="warning" />}
        {alert.type === 'urgent_approval' && <Warning color="error" />}
        {alert.type === 'system_alert' && <TrendingUp color="info" />}
      </ListItemIcon>
      <ListItemText
        primary={alert.title}
        secondary={
          <Box>
            <Box component="span" color="text.secondary" fontSize="0.875rem">
              {alert.description}
            </Box>
            <Chip
              label={alert.priority}
              size="small"
              color={alert.priority === 'high' ? 'error' : 'warning'}
              sx={{ mt: 0.5, ml: 1 }}
            />
          </Box>
        }
      />
    </ListItem>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username}
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {user?.role} • {user?.department}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Documents"
            value={overview.statistics?.total_documents}
            icon={<Description />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={overview.statistics?.pending_approvals}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Urgent Items"
            value={overview.statistics?.urgent_items}
            icon={<Warning />}
            color="error"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Compliance Due"
            value={overview.statistics?.compliance_deadline_approaching}
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Documents
              </Typography>
              {overview.recent_documents?.length > 0 ? (
                <List>
                  {overview.recent_documents.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.title}
                        secondary={
                          <Box>
                            <Box component="span" color="text.secondary" fontSize="0.875rem">
                              {doc.type} • {new Date(doc.created_at).toLocaleDateString()}
                            </Box>
                            <Chip
                              label={doc.priority}
                              size="small"
                              color={doc.priority === 'high' ? 'error' : 'default'}
                              sx={{ mt: 0.5, ml: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No recent documents
                </Typography>
              )}
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/documents')}
              >
                View All Documents
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alerts & Notifications
              </Typography>
              {overview.alerts?.length > 0 ? (
                <List>
                  {overview.alerts.slice(0, 5).map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No active alerts
                </Typography>
              )}
              <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;