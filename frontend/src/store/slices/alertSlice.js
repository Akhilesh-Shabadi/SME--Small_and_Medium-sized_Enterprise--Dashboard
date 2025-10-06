import { createSlice } from '@reduxjs/toolkit';

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
