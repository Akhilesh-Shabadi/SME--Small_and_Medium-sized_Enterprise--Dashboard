import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import widgetService from '../../services/widgetService';
import dataSourceService from '../../services/dataSourceService';

// Async thunks
export const fetchWidgets = createAsyncThunk(
    'widgets/fetchWidgets',
    async (dashboardId, { rejectWithValue }) => {
        try {
            const response = await widgetService.getWidgets(dashboardId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch widgets');
        }
    }
);

export const createWidget = createAsyncThunk(
    'widgets/createWidget',
    async ({ dashboardId, widgetData }, { rejectWithValue }) => {
        try {
            const response = await widgetService.createWidget(dashboardId, widgetData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create widget');
        }
    }
);

export const updateWidget = createAsyncThunk(
    'widgets/updateWidget',
    async ({ widgetId, widgetData }, { rejectWithValue }) => {
        try {
            const response = await widgetService.updateWidget(widgetId, widgetData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update widget');
        }
    }
);

export const deleteWidget = createAsyncThunk(
    'widgets/deleteWidget',
    async (widgetId, { rejectWithValue }) => {
        try {
            await widgetService.deleteWidget(widgetId);
            return widgetId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete widget');
        }
    }
);

export const fetchDataSources = createAsyncThunk(
    'widgets/fetchDataSources',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.getDataSources();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch data sources');
        }
    }
);

const widgetSlice = createSlice({
    name: 'widgets',
    initialState: {
        widgets: [],
        dataSources: [],
        currentWidget: null,
        isLoading: false,
        error: null,
        lastUpdated: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentWidget: (state, action) => {
            state.currentWidget = action.payload;
        },
        clearCurrentWidget: (state) => {
            state.currentWidget = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch widgets
            .addCase(fetchWidgets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWidgets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.widgets = action.payload.widgets;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchWidgets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create widget
            .addCase(createWidget.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createWidget.fulfilled, (state, action) => {
                state.isLoading = false;
                state.widgets.push(action.payload.widget);
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(createWidget.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update widget
            .addCase(updateWidget.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateWidget.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.widgets.findIndex(widget => widget.id === action.payload.widget.id);
                if (index !== -1) {
                    state.widgets[index] = action.payload.widget;
                }
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateWidget.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete widget
            .addCase(deleteWidget.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteWidget.fulfilled, (state, action) => {
                state.isLoading = false;
                state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(deleteWidget.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch data sources
            .addCase(fetchDataSources.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDataSources.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dataSources = action.payload.dataSources;
            })
            .addCase(fetchDataSources.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, setCurrentWidget, clearCurrentWidget } = widgetSlice.actions;
export default widgetSlice.reducer;
