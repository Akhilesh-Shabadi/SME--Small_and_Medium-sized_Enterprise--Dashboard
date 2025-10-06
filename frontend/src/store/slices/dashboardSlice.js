import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

// Initial state
const initialState = {
    dashboards: [],
    currentDashboard: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchDashboards = createAsyncThunk(
    'dashboard/fetchDashboards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getDashboards();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboards');
        }
    }
);

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetchDashboard',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getDashboard(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
        }
    }
);

export const createDashboard = createAsyncThunk(
    'dashboard/createDashboard',
    async (dashboardData, { rejectWithValue }) => {
        try {
            const response = await dashboardService.createDashboard(dashboardData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create dashboard');
        }
    }
);

export const updateDashboard = createAsyncThunk(
    'dashboard/updateDashboard',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await dashboardService.updateDashboard(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update dashboard');
        }
    }
);

export const deleteDashboard = createAsyncThunk(
    'dashboard/deleteDashboard',
    async (id, { rejectWithValue }) => {
        try {
            await dashboardService.deleteDashboard(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete dashboard');
        }
    }
);

export const duplicateDashboard = createAsyncThunk(
    'dashboard/duplicateDashboard',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dashboardService.duplicateDashboard(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to duplicate dashboard');
        }
    }
);

// Dashboard slice
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentDashboard: (state, action) => {
            state.currentDashboard = action.payload;
        },
        updateDashboardLayout: (state, action) => {
            if (state.currentDashboard) {
                state.currentDashboard.layout = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch dashboards
            .addCase(fetchDashboards.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboards.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboards = action.payload.dashboards;
            })
            .addCase(fetchDashboards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch single dashboard
            .addCase(fetchDashboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentDashboard = action.payload.dashboard;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create dashboard
            .addCase(createDashboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDashboard.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboards.unshift(action.payload.dashboard);
            })
            .addCase(createDashboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update dashboard
            .addCase(updateDashboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDashboard.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.dashboards.findIndex(d => d.id === action.payload.dashboard.id);
                if (index !== -1) {
                    state.dashboards[index] = action.payload.dashboard;
                }
                if (state.currentDashboard && state.currentDashboard.id === action.payload.dashboard.id) {
                    state.currentDashboard = action.payload.dashboard;
                }
            })
            .addCase(updateDashboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete dashboard
            .addCase(deleteDashboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDashboard.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboards = state.dashboards.filter(d => d.id !== action.payload);
                if (state.currentDashboard && state.currentDashboard.id === action.payload) {
                    state.currentDashboard = null;
                }
            })
            .addCase(deleteDashboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Duplicate dashboard
            .addCase(duplicateDashboard.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(duplicateDashboard.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboards.unshift(action.payload.dashboard);
            })
            .addCase(duplicateDashboard.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setCurrentDashboard, updateDashboardLayout } = dashboardSlice.actions;
export default dashboardSlice.reducer;
