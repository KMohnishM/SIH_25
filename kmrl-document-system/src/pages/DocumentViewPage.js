// Document View Page Component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  Grid,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';

// ...existing code...

import {
  ArrowBack,
  GetApp,
  Share,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Comment,
  Highlight,
  ZoomIn,
  ZoomOut,
  Print,
  Email,
  StarBorder,
  Star,
  Description,
  CalendarToday,
  Person,
  Business,
  ExpandMore,
  Visibility,
  MoreVert,
} from '@mui/icons-material';

import {
  fetchDocument,
  approveDocument,
  rejectDocument,
  bookmarkDocument,
} from '../store/slices/documentsSlice';
import { commentsService } from '../services/apiServices';

const DocumentViewPage = () => {
  const { id } = useParams();
  console.log('DocumentViewPage: requested document id:', id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentDocument, loading, error } = useSelector((state) => state.documents);
  const { user } = useSelector((state) => state.auth);

  // Move all hooks to the top before any conditional returns
  const [commentDialog, setCommentDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [zoom, setZoom] = useState(100);
  const [actionMenu, setActionMenu] = useState(null);
  const [highlightMode, setHighlightMode] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchDocument(id));
    }
  }, [id, dispatch]);

  // Debug: log currentDocument
  console.log('DocumentViewPage: currentDocument:', currentDocument);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentDocument) {
    return null; // or a placeholder/message
  }

  const handleApprove = () => {
    dispatch(approveDocument({ id, comments: approvalComments, approver: user?.name }));
    setApprovalDialog(false);
    setApprovalComments('');
  };

  const handleReject = () => {
    dispatch(rejectDocument({ id, comments: approvalComments, approver: user?.name }));
    setApprovalDialog(false);
    setApprovalComments('');
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await commentsService.addComment(id, {
          content: newComment,
          position: null // No position for general comments
        });
        setNewComment('');
        setCommentDialog(false);
        // Refresh document to get updated comments
        dispatch(fetchDocument(id));
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleBookmark = () => {
    dispatch(bookmarkDocument(id));
  };

  const handleDownload = () => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = currentDocument?.file_url || '#';
    link.download = currentDocument?.title || 'document.pdf';
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentDocument?.title,
        text: currentDocument?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const canApprove = () => {
    return user?.role === 'admin' || user?.role === 'approver';
  };

  const canEdit = () => {
    return user?.role === 'admin' || currentDocument?.uploaded_by === user?.name;
  };

  // Removed duplicate loading check since it's already handled above
  
  if (error?.document && !currentDocument) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error.document === 'string' ? error.document : 'Document not found'}
        </Alert>
        <Button onClick={() => navigate('/documents')} startIcon={<ArrowBack />}>
          Back to Documents
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/documents')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {currentDocument.title}
          </Typography>
          <IconButton onClick={handleBookmark} color={currentDocument.bookmarked ? 'primary' : 'default'}>
            {currentDocument.bookmarked ? <Star /> : <StarBorder />}
          </IconButton>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={handleDownload} startIcon={<GetApp />}>
            Download
          </Button>
          <Button variant="outlined" onClick={handleShare} startIcon={<Share />}>
            Share
          </Button>
          {canEdit() && (
            <Button variant="outlined" startIcon={<Edit />}>
              Edit
            </Button>
          )}
          <IconButton onClick={(e) => setActionMenu(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Document Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" gap={1} mb={2}>
              <Chip
                label={currentDocument.status}
                color={getStatusColor(currentDocument.status)}
                variant="filled"
              />
              <Chip
                label={`${currentDocument.priority} priority`}
                color={getPriorityColor(currentDocument.priority)}
                variant="outlined"
              />
              <Chip
                label={currentDocument.type}
                variant="outlined"
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {currentDocument.summary}
            </Typography>

            {currentDocument.ocr_highlights && currentDocument.ocr_highlights.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Key Information Extracted
                </Typography>
                {currentDocument.ocr_highlights.map((highlight, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{highlight.type}:</strong> {highlight.text}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}
          </Paper>

          {/* Document Viewer */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Document Viewer</Typography>
              <Box display="flex" gap={1} alignItems="center">
                <IconButton onClick={() => setZoom(Math.max(50, zoom - 25))}>
                  <ZoomOut />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                  {zoom}%
                </Typography>
                <IconButton onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn />
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <IconButton 
                  color={highlightMode ? 'primary' : 'default'}
                  onClick={() => setHighlightMode(!highlightMode)}
                >
                  <Highlight />
                </IconButton>
                <IconButton onClick={() => window.print()}>
                  <Print />
                </IconButton>
              </Box>
            </Box>
            
            {/* Document Preview */}
            <Box
              sx={{
                height: 600,
                bgcolor: 'white',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center top',
                overflow: 'auto',
              }}
            >
              {currentDocument.file_type === 'pdf' ? (
                <Box sx={{ flex: 1, p: 3, bgcolor: 'grey.50' }}>
                  <Box sx={{ bgcolor: 'white', p: 4, minHeight: '100%', boxShadow: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                      {currentDocument.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      This is a mock preview of the document content. In a real implementation, this would show the actual PDF content using a PDF viewer library like react-pdf or PDF.js.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {currentDocument.summary}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Document Type: {currentDocument.type.toUpperCase()}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Department: {currentDocument.department}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Status: {currentDocument.status.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
                      File: {currentDocument.file_path} ({currentDocument.file_size})
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Document Preview
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {currentDocument.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    File type: {currentDocument.file_type?.toUpperCase() || 'Unknown'}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleDownload}
                  >
                    Download to View
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Comments & Annotations</Typography>
              <Button
                variant="outlined"
                startIcon={<Comment />}
                onClick={() => setCommentDialog(true)}
              >
                Add Comment
              </Button>
            </Box>
            
            {currentDocument.comments && currentDocument.comments.length > 0 ? (
              <List>
                {currentDocument.comments.map((comment, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">{comment.author}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(comment.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < currentDocument.comments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                No comments yet. Be the first to add one!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Document Details */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CalendarToday fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Created"
                  secondary={new Date(currentDocument.created_at).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Uploaded by"
                  secondary={currentDocument.uploaded_by}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Business fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Department"
                  secondary={currentDocument.department}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Description fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="File Size"
                  secondary={currentDocument.file_size || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Views"
                  secondary={currentDocument.view_count || 0}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Approval Actions */}
          {currentDocument.status === 'pending' && canApprove() && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Approval Required
              </Typography>
              <Box display="flex" gap={1} flexDirection="column">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => setApprovalDialog(true)}
                  fullWidth
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => setApprovalDialog(true)}
                  fullWidth
                >
                  Reject
                </Button>
              </Box>
            </Paper>
          )}

          {/* Related Documents */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Related Documents
            </Typography>
            {currentDocument.related_documents && currentDocument.related_documents.length > 0 ? (
              <List dense>
                {currentDocument.related_documents.map((related, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => navigate(`/documents/${related.id}`)}
                  >
                    <ListItemText
                      primary={related.title}
                      secondary={`${related.type} • ${related.department}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No related documents found
              </Typography>
            )}
          </Paper>

          {/* Document Versions */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Version History
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2">
                  Version {currentDocument.version || '1.0'} (Current)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary">
                  Last modified: {new Date(currentDocument.updated_at).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Modified by: {currentDocument.uploaded_by}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>

      {/* Comment Dialog */}
      <Dialog open={commentDialog} onClose={() => setCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            multiline
            rows={4}
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddComment} variant="contained">
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Document Approval</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Comments (optional)"
            multiline
            rows={3}
            fullWidth
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error">
            Reject
          </Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={() => setActionMenu(null)}
      >
        <MenuItem onClick={() => { setActionMenu(null); /* Send email */ }}>
          <ListItemIcon><Email /></ListItemIcon>
          <ListItemText>Send via Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setActionMenu(null); window.print(); }}>
          <ListItemIcon><Print /></ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>
        {canEdit() && (
          <MenuItem onClick={() => { setActionMenu(null); /* Delete logic */ }}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DocumentViewPage;