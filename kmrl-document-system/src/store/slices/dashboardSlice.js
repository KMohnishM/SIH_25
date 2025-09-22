// Dashboard Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../services/apiServices';

// Async thunks
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async ({ role, dateRange = '30d' }, { rejectWithValue }) => {
    try {
      // Mock dashboard data for demo
      const mockData = {
        statistics: {
          total_documents: 1250,
          pending_approvals: 15,
          urgent_items: 3,
          compliance_deadline_approaching: 8
        },
        recent_documents: [
          {
            id: 'doc-1',
            title: 'Safety Protocol Update - Line 1',
            type: 'safety',
            priority: 'high',
            created_at: new Date().toISOString()
          },
          {
            id: 'doc-2',
            title: 'Maintenance Schedule Q4 2025',
            type: 'maintenance',
            priority: 'medium',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'doc-3',
            title: 'Budget Approval Request',
            type: 'finance',
            priority: 'high',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        alerts: [
          {
            id: 'alert-1',
            type: 'compliance_deadline',
            title: 'Environmental Compliance Due',
            description: 'Environmental impact report submission deadline in 3 days',
            priority: 'high',
            created_at: new Date().toISOString(),
            action_required: true
          },
          {
            id: 'alert-2',
            type: 'urgent_approval',
            title: 'Emergency Maintenance Approval',
            description: 'Emergency brake system maintenance requires immediate approval',
            priority: 'urgent',
            created_at: new Date().toISOString(),
            action_required: true
          }
        ],
        charts_data: {
          document_volume_trend: [
            { date: '2024-01-01', count: 45 },
            { date: '2024-01-02', count: 52 },
            { date: '2024-01-03', count: 38 }
          ]
        }
      };

      return mockData;
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard data');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async ({ metric, dateRange = '30d', granularity = 'daily' }, { rejectWithValue }) => {
    try {
      // Mock analytics data for demo
      const mockAnalytics = {
        metrics: [
          { date: '2024-01-01', value: 25.5 },
          { date: '2024-01-02', value: 28.2 },
          { date: '2024-01-03', value: 22.8 }
        ],
        insights: [
          {
            title: 'Processing Efficiency Improved',
            description: 'Document processing time reduced by 15% this month',
            impact: 'positive',
            trend: 'improving'
          }
        ]
      };
      
      return { metric, data: mockAnalytics };
    } catch (error) {
      return rejectWithValue('Failed to fetch analytics');
    }
  }
);

const initialState = {
  overview: {
    statistics: {},
    recent_documents: [],
    alerts: [],
    charts_data: {},
  },
  analytics: {},
  loading: false,
  analyticsLoading: false,
  error: null,
  selectedDateRange: '30d',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    dismissAlert: (state, action) => {
      const alertId = action.payload;
      state.overview.alerts = state.overview.alerts.filter(alert => alert.id !== alertId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        const { metric, data } = action.payload;
        state.analytics[metric] = data;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDateRange,
  clearError,
  dismissAlert,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;