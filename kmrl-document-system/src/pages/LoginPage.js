// Login Page Component
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

import { loginUser, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '', // For demo purposes
  });

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({
      username: formData.username,
      password: formData.password,
    }));
  };

  const demoUsers = [
    { username: 'executive.user', password: 'demo123', role: 'Executive Director' },
    { username: 'maintenance.user', password: 'demo123', role: 'Maintenance Engineer' },
    { username: 'compliance.user', password: 'demo123', role: 'Compliance Officer' },
    { username: 'finance.user', password: 'demo123', role: 'Finance Officer' },
  ];

  const handleDemoLogin = (user) => {
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
    });
    dispatch(loginUser({
      username: user.username,
      password: user.password,
    }));
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                padding: 1,
                mb: 2,
              }}
            >
              <LockOutlined sx={{ color: 'white' }} />
            </Box>
            
            <Typography component="h1" variant="h4" gutterBottom>
              KMRL Document System
            </Typography>
            
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Kochi Metro Rail Limited - Document Management Platform
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {typeof error === 'string' ? error : 'Login failed. Please try again.'}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Demo Accounts
            </Typography>
            
            <Box sx={{ width: '100%' }}>
              {demoUsers.map((user) => (
                <Button
                  key={user.username}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 1 }}
                  onClick={() => handleDemoLogin(user)}
                  disabled={loading}
                >
                  {user.role}
                </Button>
              ))}
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
              Demo credentials: Any username with password "demo123"
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;