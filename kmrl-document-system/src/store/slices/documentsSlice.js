// Documents Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentsService } from '../../services/apiServices';

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await documentsService.getDocuments(filters);
      console.log('Documents API Response:', response);
      return response;
    } catch (error) {
      console.error('Documents API Error:', error);
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch documents');
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentsService.getDocument(id);
      console.log('fetchDocument: API response:', response);
      return response;
    } catch (error) {
      console.error('fetchDocument: API error:', error);
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch document');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ formData, metadata }, { rejectWithValue }) => {
    try {
      const response = await documentsService.uploadDocument(formData, metadata);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to upload document');
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'documents/searchDocuments',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await documentsService.searchDocuments(searchParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Search failed');
    }
  }
);

export const approveDocument = createAsyncThunk(
  'documents/approveDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentsService.approveDocument(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to approve document');
    }
  }
);

export const rejectDocument = createAsyncThunk(
  'documents/rejectDocument',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await documentsService.rejectDocument(id, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to reject document');
    }
  }
);

export const bookmarkDocument = createAsyncThunk(
  'documents/bookmarkDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentsService.bookmarkDocument(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to bookmark document');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentsService.updateDocument(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentsService.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete document');
    }
  }
);

// Initial state
const initialState = {
  documents: [],
  currentDocument: null,
  searchResults: [],
  bookmarkedDocuments: [],
  recentDocuments: [],
  categories: [],
  analytics: {
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    dailyUploads: [],
    departmentStats: {},
    recentActivity: []
  },
  filters: {
    department: 'all',
    status: 'all',
    type: 'all',
    priority: 'all',
    dateRange: null
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  loading: false, // Simple boolean loading state
  error: {
    documents: null,
    document: null,
    upload: null,
    search: null,
    action: null
  }
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
        department: 'all',
        status: 'all',
        type: 'all',
        priority: 'all',
        dateRange: null
      };
    },
    clearError: (state, action) => {
      if (action.payload) {
        state.error[action.payload] = null;
      } else {
        state.error = {
          documents: null,
          document: null,
          upload: null,
          search: null,
          action: null
        };
      }
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error.documents = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        if (action.payload.analytics) {
          state.analytics = action.payload.analytics;
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error.documents = action.payload;
      })

      // Fetch Single Document
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error.document = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.document = action.payload;
      })

      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error.upload = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
        state.analytics.totalDocuments += 1;
        state.analytics.pendingDocuments += 1;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.upload = action.payload;
      })

      // Search Documents
      .addCase(searchDocuments.pending, (state) => {
        state.loading = true;
        state.error.search = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.documents || action.payload;
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error.search = action.payload;
      })

      // Approve Document
      .addCase(approveDocument.pending, (state) => {
        state.loading = true;
        state.error.action = null;
      })
      .addCase(approveDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
        state.analytics.pendingDocuments -= 1;
        state.analytics.approvedDocuments += 1;
      })
      .addCase(approveDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.action = action.payload;
      })

      // Reject Document
      .addCase(rejectDocument.pending, (state) => {
        state.loading = true;
        state.error.action = null;
      })
      .addCase(rejectDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
        state.analytics.pendingDocuments -= 1;
        state.analytics.rejectedDocuments += 1;
      })
      .addCase(rejectDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.action = action.payload;
      })

      // Bookmark Document
      .addCase(bookmarkDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(bookmarkDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
        // Update bookmarked documents list
        if (action.payload.bookmarked) {
          state.bookmarkedDocuments.push(action.payload);
        } else {
          state.bookmarkedDocuments = state.bookmarkedDocuments.filter(
            doc => doc.id !== action.payload.id
          );
        }
      })
      .addCase(bookmarkDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.action = action.payload;
      })

      // Update Document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error.action = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.action = action.payload;
      })

      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error.action = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        state.bookmarkedDocuments = state.bookmarkedDocuments.filter(
          doc => doc.id !== action.payload
        );
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null;
        }
        state.analytics.totalDocuments -= 1;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error.action = action.payload;
      });
  }
});

// Selectors
export const selectDocuments = (state) => state.documents.documents;
export const selectCurrentDocument = (state) => state.documents.currentDocument;
export const selectSearchResults = (state) => state.documents.searchResults;
export const selectBookmarkedDocuments = (state) => state.documents.bookmarkedDocuments;
export const selectRecentDocuments = (state) => state.documents.recentDocuments;
export const selectCategories = (state) => state.documents.categories;
export const selectAnalytics = (state) => state.documents.analytics;
export const selectFilters = (state) => state.documents.filters;
export const selectPagination = (state) => state.documents.pagination;
export const selectLoading = (state) => state.documents.loading;
export const selectError = (state) => state.documents.error;

// Export actions and reducer
export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  clearCurrentDocument, 
  clearSearchResults,
  setPagination 
} = documentsSlice.actions;

export default documentsSlice.reducer;