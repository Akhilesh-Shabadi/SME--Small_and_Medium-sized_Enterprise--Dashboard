import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../services/api';

// Async thunk for fetching analytics data
export const fetchAnalyticsData = createAsyncThunk(
    'analytics/fetchData',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await api.post('/analytics', filters);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    data: {},
    filters: {},
    isLoading: false,
    error: null,
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        setData: (state, action) => {
            state.data = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalyticsData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchAnalyticsData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setData, setFilters, setLoading, setError, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
