// Documents Page Component
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Pagination,
  Tooltip,
  Fab,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  FilterList,
  Upload,
  Visibility,
  GetApp,
  CheckCircle,
  Cancel,
  Add,
  Clear,
} from '@mui/icons-material';

import {
  fetchDocuments,
  setFilters,
  clearFilters,
  uploadDocument,
  approveDocument,
} from '../store/slices/documentsSlice';

const DocumentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { documents, pagination, filters, loading, error } = useSelector((state) => state.documents);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMetadata, setUploadMetadata] = useState({
    type: '',
    department: '',
    priority: 'medium',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchDocuments({ ...filters, search: searchQuery }));
  }, [dispatch, filters, searchQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
  };

  const handlePageChange = (event, page) => {
    dispatch(setFilters({ page }));
  };

  const handleFileUpload = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUploadSubmit = () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      dispatch(uploadDocument({
        formData,
        metadata: uploadMetadata
      }));
      setUploadDialog(false);
      setSelectedFiles([]);
      setUploadMetadata({
        type: '',
        department: '',
        priority: 'medium',
        description: '',
      });
    }
  };

  const handleApproval = (documentId, action) => {
    dispatch(approveDocument({
      documentId,
      action: { action, comments: `${action} by ${user?.username}` }
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const DocumentCard = ({ document }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
            {document.title}
          </Typography>
          <Box>
            <Chip
              label={document.priority}
              color={getPriorityColor(document.priority)}
              size="small"
              sx={{ mr: 0.5 }}
            />
            <Chip
              label={document.status}
              color={getStatusColor(document.status)}
              size="small"
            />
          </Box>
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {document.type} • {document.department} • {document.source}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {document.summary?.ai_summary || 'Processing document summary...'}
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
          {document.summary?.key_points?.slice(0, 3).map((point, index) => (
            <Chip
              key={index}
              label={point}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
        
        <Typography variant="caption" color="textSecondary">
          Uploaded: {new Date(document.created_at).toLocaleDateString()}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => navigate(`/documents/${document.id}`)}
        >
          View
        </Button>
        <Button
          size="small"
          startIcon={<GetApp />}
          onClick={() => window.open(document.file_path, '_blank')}
        >
          Download
        </Button>
        {document.status === 'pending' && user?.permissions?.includes('approve_documents') && (
          <>
            <Tooltip title="Approve">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleApproval(document.id, 'approve')}
              >
                <CheckCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleApproval(document.id, 'reject')}
              >
                <Cancel />
              </IconButton>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Document Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setUploadDialog(true)}
        >
          Upload Documents
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleSearch('')} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              <Button
                variant="text"
                onClick={handleClearFilters}
                size="small"
              >
                Clear All
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Filters Panel */}
        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="operations">Operations</MenuItem>
                  <MenuItem value="engineering">Engineering</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="sustainability">Sustainability</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : error.documents || error.upload || error.action || 'An error occurred'}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Document Grid */}
          <Grid container spacing={3}>
            {documents.map((document) => (
              <Grid item xs={12} md={6} lg={4} key={document.id}>
                <DocumentCard document={document} />
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {documents.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No documents found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search or filters
              </Typography>
            </Paper>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={uploadMetadata.type}
                  onChange={(e) => setUploadMetadata({...uploadMetadata, type: e.target.value})}
                >
                  <MenuItem value="safety">Safety</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={uploadMetadata.priority}
                  onChange={(e) => setUploadMetadata({...uploadMetadata, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={uploadMetadata.description}
                onChange={(e) => setUploadMetadata({...uploadMetadata, description: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={selectedFiles.length === 0 || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setUploadDialog(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default DocumentsPage;