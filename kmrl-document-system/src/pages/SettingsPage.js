// Settings Page Component
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { updateUserProfile } from '../store/slices/authSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || '',
    bio: user?.bio || '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    documentApproval: true,
    deadlineReminders: true,
    systemAlerts: true,
    weeklyDigest: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
  });
  
  const [systemPreferences, setSystemPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    pageSize: 25,
  });

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [saveAlert, setSaveAlert] = useState({ show: false, type: 'success', message: '' });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileSave = () => {
    dispatch(updateUserProfile(profileData));
    setEditingProfile(false);
    setSaveAlert({ show: true, type: 'success', message: 'Profile updated successfully!' });
    setTimeout(() => setSaveAlert({ show: false }), 3000);
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      setSaveAlert({ show: true, type: 'error', message: 'New passwords do not match!' });
      return;
    }
    // Mock password change
    setPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    setSaveAlert({ show: true, type: 'success', message: 'Password changed successfully!' });
    setTimeout(() => setSaveAlert({ show: false }), 3000);
  };

  const handleNotificationSave = () => {
    // Mock save notification settings
    setSaveAlert({ show: true, type: 'success', message: 'Notification preferences saved!' });
    setTimeout(() => setSaveAlert({ show: false }), 3000);
  };

  const handleSecuritySave = () => {
    // Mock save security settings
    setSaveAlert({ show: true, type: 'success', message: 'Security settings updated!' });
    setTimeout(() => setSaveAlert({ show: false }), 3000);
  };

  const handleSystemSave = () => {
    // Mock save system preferences
    setSaveAlert({ show: true, type: 'success', message: 'System preferences saved!' });
    setTimeout(() => setSaveAlert({ show: false }), 3000);
  };

  const ProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              src={user?.avatar}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {user?.role} • {user?.department}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              sx={{ mt: 2 }}
            >
              Change Photo
            </Button>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Profile Information</Typography>
              <Button
                variant={editingProfile ? "outlined" : "contained"}
                startIcon={editingProfile ? <Cancel /> : <Edit />}
                onClick={() => setEditingProfile(!editingProfile)}
              >
                {editingProfile ? 'Cancel' : 'Edit'}
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={profileData.department}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!editingProfile}
                />
              </Grid>
            </Grid>
            
            {editingProfile && (
              <Box mt={3} display="flex" gap={2}>
                <Button variant="contained" onClick={handleProfileSave} startIcon={<Save />}>
                  Save Changes
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setPasswordDialog(true)}
                  startIcon={<Security />}
                >
                  Change Password
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const NotificationsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Methods
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Notifications /></ListItemIcon>
                <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><Notifications /></ListItemIcon>
                <ListItemText primary="Push Notifications" secondary="Browser push notifications" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      pushNotifications: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><Notifications /></ListItemIcon>
                <ListItemText primary="SMS Notifications" secondary="Text message alerts" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Document Approvals" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.documentApproval}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      documentApproval: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Deadline Reminders" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.deadlineReminders}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      deadlineReminders: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="System Alerts" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      systemAlerts: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Weekly Digest" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      weeklyDigest: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box mt={2}>
              <Button variant="contained" onClick={handleNotificationSave}>
                Save Preferences
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const SecurityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Two-Factor Authentication" 
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      twoFactorAuth: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Login Alerts" 
                  secondary="Get notified of new sign-ins to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      loginAlerts: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Session & Password Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Session Timeout (minutes)</InputLabel>
                    <Select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value
                      })}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Password Expiry (days)</InputLabel>
                    <Select
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        passwordExpiry: e.target.value
                      })}
                    >
                      <MenuItem value={30}>30 days</MenuItem>
                      <MenuItem value={60}>60 days</MenuItem>
                      <MenuItem value={90}>90 days</MenuItem>
                      <MenuItem value={180}>180 days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            
            <Box mt={3}>
              <Button variant="contained" onClick={handleSecuritySave}>
                Save Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Last Login" 
                  secondary="Today at 9:30 AM from 192.168.1.100"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Password Changed" 
                  secondary="15 days ago"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Profile Updated" 
                  secondary="1 month ago"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const SystemTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appearance & Language
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={systemPreferences.theme}
                    onChange={(e) => setSystemPreferences({
                      ...systemPreferences,
                      theme: e.target.value
                    })}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={systemPreferences.language}
                    onChange={(e) => setSystemPreferences({
                      ...systemPreferences,
                      language: e.target.value
                    })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="ml">Malayalam</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={systemPreferences.timezone}
                    onChange={(e) => setSystemPreferences({
                      ...systemPreferences,
                      timezone: e.target.value
                    })}
                  >
                    <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Display Preferences
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={systemPreferences.dateFormat}
                    onChange={(e) => setSystemPreferences({
                      ...systemPreferences,
                      dateFormat: e.target.value
                    })}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Items Per Page</InputLabel>
                  <Select
                    value={systemPreferences.pageSize}
                    onChange={(e) => setSystemPreferences({
                      ...systemPreferences,
                      pageSize: e.target.value
                    })}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Button variant="contained" onClick={handleSystemSave}>
                Save Preferences
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {saveAlert.show && (
        <Alert severity={saveAlert.type} sx={{ mb: 2 }}>
          {saveAlert.message}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<SettingsIcon />} label="System" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <ProfileTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <NotificationsTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <SecurityTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <SystemTab />
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;