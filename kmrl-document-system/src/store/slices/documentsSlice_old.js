// Documents Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data
const mockDocuments = [
  {
    id: 'doc-001',
    title: 'Safety Protocol Update - Line 1 Operations',
    type: 'safety',
    department: 'operations',
    status: 'pending',
    priority: 'high',
    created_at: new Date().toISOString(),
    uploaded_by: 'Safety Officer',
    summary: 'Updated safety protocols for Line 1 operations including new emergency procedures.',
    file_path: '/documents/safety-protocol-v2.1.pdf',
    file_type: 'pdf',
    file_size: '2.4 MB',
    bookmarked: false,
    comments: [],
  },
  {
    id: 'doc-002',
    title: 'Maintenance Schedule Q4 2024',
    type: 'maintenance',
    department: 'engineering',
    status: 'approved',
    priority: 'medium',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    uploaded_by: 'Engineering Team',
    summary: 'Quarterly maintenance schedule for all metro lines.',
    file_path: '/documents/maintenance-schedule-q4-2024.pdf',
    file_type: 'pdf',
    file_size: '1.8 MB',
    bookmarked: true,
    comments: [],
  },
];

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredDocs = [...mockDocuments];
      
      if (filters.type) {
        filteredDocs = filteredDocs.filter(doc => doc.type === filters.type);
      }
      if (filters.department) {
        filteredDocs = filteredDocs.filter(doc => doc.department === filters.department);
      }
      if (filters.status) {
        filteredDocs = filteredDocs.filter(doc => doc.status === filters.status);
      }
      if (filters.priority) {
        filteredDocs = filteredDocs.filter(doc => doc.priority === filters.priority);
      }
      
      return {
        documents: filteredDocs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredDocs.length,
          pages: Math.ceil(filteredDocs.length / 20)
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (id, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const document = mockDocuments.find(doc => doc.id === id) || {
        id: id,
        title: `Document ${id}`,
        type: 'safety',
        department: 'operations',
        status: 'approved',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        uploaded_by: 'Demo User',
        summary: 'Sample document for demonstration purposes.',
        comments: [
          {
            text: 'This is a sample comment',
            author: 'Demo User',
            timestamp: new Date().toISOString(),
          }
        ],
        bookmarked: false,
        related_documents: [],
        version: '1.0',
        ocr_highlights: [
          {
            type: 'deadline',
            text: 'Review required by end of month',
          }
        ],
      };
      
      return document;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Alias for compatibility
export const fetchDocumentById = fetchDocument;

export const uploadDocuments = createAsyncThunk(
  'documents/uploadDocuments',
  async ({ files, metadata }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDocuments = files.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        title: metadata.title || file.name,
        type: metadata.type || 'general',
        department: metadata.department || 'general',
        status: 'pending',
        priority: metadata.priority || 'medium',
        created_at: new Date().toISOString(),
        uploaded_by: metadata.uploadedBy || 'Current User',
        summary: metadata.summary || 'Document uploaded for review.',
        bookmarked: false,
        comments: [],
      }));
      
      return newDocuments;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveDocument = createAsyncThunk(
  'documents/approveDocument',
  async ({ id, comments, approver }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { documentId: id, comments, approver, status: 'approved' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectDocument = createAsyncThunk(
  'documents/rejectDocument',
  async ({ id, comments, approver }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { documentId: id, comments, approver, status: 'rejected' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  filters: {
    type: '',
    department: '',
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 20,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: '',
        department: '',
        status: '',
        priority: '',
        search: '',
        page: 1,
        limit: 20,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    updateDocumentStatus: (state, action) => {
      const { documentId, status } = action.payload;
      const document = state.documents.find(doc => doc.id === documentId);
      if (document) {
        document.status = status;
      }
    },
    addComment: (state, action) => {
      const { documentId, comment } = action.payload;
      const document = state.documents.find(doc => doc.id === documentId);
      if (document) {
        if (!document.comments) {
          document.comments = [];
        }
        document.comments.push(comment);
      }
      if (state.currentDocument && state.currentDocument.id === documentId) {
        if (!state.currentDocument.comments) {
          state.currentDocument.comments = [];
        }
        state.currentDocument.comments.push(comment);
      }
    },
    toggleBookmark: (state, action) => {
      const documentId = action.payload;
      const document = state.documents.find(doc => doc.id === documentId);
      if (document) {
        document.bookmarked = !document.bookmarked;
      }
      if (state.currentDocument && state.currentDocument.id === documentId) {
        state.currentDocument.bookmarked = !state.currentDocument.bookmarked;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single document
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload documents
      .addCase(uploadDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = [...state.documents, ...action.payload];
        state.error = null;
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve document
      .addCase(approveDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveDocument.fulfilled, (state, action) => {
        state.loading = false;
        const { documentId } = action.payload;
        const document = state.documents.find(doc => doc.id === documentId);
        if (document) {
          document.status = 'approved';
        }
        if (state.currentDocument && state.currentDocument.id === documentId) {
          state.currentDocument.status = 'approved';
        }
        state.error = null;
      })
      .addCase(approveDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject document
      .addCase(rejectDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectDocument.fulfilled, (state, action) => {
        state.loading = false;
        const { documentId } = action.payload;
        const document = state.documents.find(doc => doc.id === documentId);
        if (document) {
          document.status = 'rejected';
        }
        if (state.currentDocument && state.currentDocument.id === documentId) {
          state.currentDocument.status = 'rejected';
        }
        state.error = null;
      })
      .addCase(rejectDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  setCurrentDocument,
  clearCurrentDocument,
  updateDocumentStatus,
  addComment,
  toggleBookmark,
} = documentsSlice.actions;

export default documentsSlice.reducer;