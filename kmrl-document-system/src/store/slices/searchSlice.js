// Search Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      // Mock search results
      const mockResults = [
        {
          document_id: 'doc-001',
          title: 'Safety Protocol Update - Line 1 Operations',
          relevance_score: 0.95,
          matched_snippets: [
            {
              text: 'Updated safety protocols for Line 1 operations including new emergency procedures and passenger safety guidelines.',
              highlight_positions: [[8, 22], [26, 35], [63, 72]]
            }
          ],
          summary: 'Comprehensive safety protocol updates covering emergency procedures and passenger guidelines.'
        },
        {
          document_id: 'doc-003',
          title: 'Budget Approval Request - IT Infrastructure',
          relevance_score: 0.87,
          matched_snippets: [
            {
              text: 'Budget request for upgrading IT infrastructure including servers, networking equipment, and security systems.',
              highlight_positions: [[0, 6], [31, 35], [48, 60]]
            }
          ],
          summary: 'Infrastructure upgrade budget request with detailed technical specifications.'
        },
        {
          document_id: 'doc-004',
          title: 'Environmental Impact Assessment Report',
          relevance_score: 0.78,
          matched_snippets: [
            {
              text: 'Annual environmental impact assessment covering air quality, noise levels, and sustainability metrics.',
              highlight_positions: [[7, 20], [28, 34], [75, 88]]
            }
          ],
          summary: 'Comprehensive environmental assessment with compliance metrics and recommendations.'
        }
      ].filter(result => {
        // Simple mock filtering based on query
        const searchTerm = query.toLowerCase();
        return result.title.toLowerCase().includes(searchTerm) || 
               result.summary.toLowerCase().includes(searchTerm);
      });

      return {
        results: mockResults,
        search_metadata: {
          query: query,
          total_results: mockResults.length,
          search_time_ms: 150,
          suggestions: [
            'safety protocols line 1',
            'budget approval requests',
            'environmental compliance',
            'maintenance schedules'
          ]
        }
      };
    } catch (error) {
      return rejectWithValue('Search failed');
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async ({ query, role }, { rejectWithValue }) => {
    try {
      // Mock suggestions based on role and query
      const baseSuggestions = [
        'safety protocols',
        'maintenance schedule',
        'budget approval',
        'compliance report',
        'environmental impact',
        'hr policies',
        'training materials',
        'operational procedures'
      ];

      const roleSuggestions = {
        executive: ['board meetings', 'strategic plans', 'quarterly reports'],
        maintenance: ['equipment status', 'repair schedules', 'spare parts'],
        compliance: ['regulatory updates', 'audit reports', 'certification'],
        finance: ['budget proposals', 'expense reports', 'vendor payments']
      };

      const suggestions = [
        ...baseSuggestions.filter(s => s.includes(query.toLowerCase())),
        ...(roleSuggestions[role] || []).filter(s => s.includes(query.toLowerCase()))
      ].map((text, index) => ({
        text,
        type: index < 3 ? 'query' : 'document_type',
        frequency: Math.floor(Math.random() * 20) + 1
      }));

      return { suggestions };
    } catch (error) {
      return rejectWithValue('Failed to fetch suggestions');
    }
  }
);

const initialState = {
  query: '',
  results: [],
  suggestions: [],
  searchMetadata: {},
  filters: {
    department: '',
    type: '',
    date_range: '',
  },
  recentSearches: [],
  loading: false,
  suggestionsLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearResults: (state) => {
      state.results = [];
      state.searchMetadata = {};
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    addRecentSearch: (state, action) => {
      const query = action.payload;
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        // Keep only last 10 searches
        state.recentSearches = state.recentSearches.slice(0, 10);
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Perform search
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.searchMetadata = action.payload.search_metadata;
        state.error = null;
        
        // Add to recent searches
        if (state.query && !state.recentSearches.includes(state.query)) {
          state.recentSearches.unshift(state.query);
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch suggestions
      .addCase(fetchSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload.suggestions;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = [];
      });
  },
});

export const {
  setQuery,
  setFilters,
  clearFilters,
  clearResults,
  clearSuggestions,
  addRecentSearch,
  clearRecentSearches,
  clearError,
} = searchSlice.actions;

export default searchSlice.reducer;