import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarOpen: true,
    theme: 'light',
    language: 'en',
    notifications: [],
    modals: {
        createDashboard: false,
        editDashboard: false,
        createWidget: false,
        editWidget: false,
        settings: false,
    },
    loading: {
        global: false,
        dashboard: false,
        analytics: false,
        collaboration: false,
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
            localStorage.setItem('language', action.payload);
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...action.payload,
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        openModal: (state, action) => {
            state.modals[action.payload] = true;
        },
        closeModal: (state, action) => {
            state.modals[action.payload] = false;
        },
        closeAllModals: (state) => {
            Object.keys(state.modals).forEach(modal => {
                state.modals[modal] = false;
            });
        },
        setLoading: (state, action) => {
            const { key, value } = action.payload;
            state.loading[key] = value;
        },
        setGlobalLoading: (state, action) => {
            state.loading.global = action.payload;
        },
    },
});

export const {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    setLanguage,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    closeAllModals,
    setLoading,
    setGlobalLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
