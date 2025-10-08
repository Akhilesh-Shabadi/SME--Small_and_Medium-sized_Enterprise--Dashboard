import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dataSourceService from '../../services/dataSourceService';

// Async thunks
export const fetchDataSources = createAsyncThunk(
    'dataSources/fetchDataSources',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.getDataSources();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch data sources');
        }
    }
);

export const getDataSource = createAsyncThunk(
    'dataSources/getDataSource',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.getDataSource(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch data source');
        }
    }
);

export const createDataSource = createAsyncThunk(
    'dataSources/createDataSource',
    async (dataSourceData, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.createDataSource(dataSourceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create data source');
        }
    }
);

export const updateDataSource = createAsyncThunk(
    'dataSources/updateDataSource',
    async ({ id, dataSourceData }, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.updateDataSource(id, dataSourceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update data source');
        }
    }
);

export const deleteDataSource = createAsyncThunk(
    'dataSources/deleteDataSource',
    async (id, { rejectWithValue }) => {
        try {
            await dataSourceService.deleteDataSource(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete data source');
        }
    }
);

export const testDataSource = createAsyncThunk(
    'dataSources/testDataSource',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.testDataSource(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to test data source');
        }
    }
);

export const syncDataSource = createAsyncThunk(
    'dataSources/syncDataSource',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dataSourceService.syncDataSource(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to sync data source');
        }
    }
);

const dataSourceSlice = createSlice({
    name: 'dataSources',
    initialState: {
        dataSources: [],
        currentDataSource: null,
        isLoading: false,
        error: null,
        lastUpdated: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentDataSource: (state, action) => {
            state.currentDataSource = action.payload;
        },
        clearCurrentDataSource: (state) => {
            state.currentDataSource = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch data sources
            .addCase(fetchDataSources.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDataSources.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dataSources = action.payload.dataSources;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchDataSources.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get single data source
            .addCase(getDataSource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDataSource.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentDataSource = action.payload.dataSource;
            })
            .addCase(getDataSource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create data source
            .addCase(createDataSource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDataSource.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dataSources.push(action.payload.dataSource);
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(createDataSource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update data source
            .addCase(updateDataSource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDataSource.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.dataSources.findIndex(ds => ds.id === action.payload.dataSource.id);
                if (index !== -1) {
                    state.dataSources[index] = action.payload.dataSource;
                }
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateDataSource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete data source
            .addCase(deleteDataSource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDataSource.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dataSources = state.dataSources.filter(ds => ds.id !== action.payload);
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(deleteDataSource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Test data source
            .addCase(testDataSource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(testDataSource.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(testDataSource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Sync data source
            .addCase(syncDataSource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(syncDataSource.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(syncDataSource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, setCurrentDataSource, clearCurrentDataSource } = dataSourceSlice.actions;
export default dataSourceSlice.reducer;
