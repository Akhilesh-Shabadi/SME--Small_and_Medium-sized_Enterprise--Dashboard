import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertService } from '../../services/alertService';

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'alert/fetchNotifications',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await alertService.getNotifications(filters);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markNotificationAsReadAsync = createAsyncThunk(
    'alert/markNotificationAsReadAsync',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await alertService.markNotificationAsRead(notificationId);
            return { notificationId, response: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
        }
    }
);

export const markAllNotificationsAsReadAsync = createAsyncThunk(
    'alert/markAllNotificationsAsReadAsync',
    async (_, { rejectWithValue }) => {
        try {
            const response = await alertService.markAllNotificationsAsRead();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
        }
    }
);

const initialState = {
    alerts: [],
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        setAlerts: (state, action) => {
            state.alerts = action.payload;
        },
        addAlert: (state, action) => {
            state.alerts.unshift(action.payload);
        },
        updateAlert: (state, action) => {
            const index = state.alerts.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.alerts[index] = action.payload;
            }
        },
        removeAlert: (state, action) => {
            state.alerts = state.alerts.filter(a => a.id !== action.payload);
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        markNotificationAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllNotificationsAsRead: (state) => {
            state.notifications.forEach(notification => {
                notification.isRead = true;
            });
            state.unreadCount = 0;
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
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.notifications || [];
                state.unreadCount = action.payload.notifications?.filter(n => !n.isRead).length || 0;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Mark notification as read
            .addCase(markNotificationAsReadAsync.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload.notificationId);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark all notifications as read
            .addCase(markAllNotificationsAsReadAsync.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.isRead = true;
                });
                state.unreadCount = 0;
            });
    },
});

export const {
    setAlerts,
    addAlert,
    updateAlert,
    removeAlert,
    setNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setLoading,
    setError,
    clearError,
} = alertSlice.actions;
export default alertSlice.reducer;
