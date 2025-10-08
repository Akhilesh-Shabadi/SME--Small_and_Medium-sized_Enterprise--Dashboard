import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import widgetReducer from './slices/widgetSlice';
import dataSourceReducer from './slices/dataSourceSlice';
import analyticsReducer from './slices/analyticsSlice';
import collaborationReducer from './slices/collaborationSlice';
import alertReducer from './slices/alertSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        widget: widgetReducer,
        dataSource: dataSourceReducer,
        analytics: analyticsReducer,
        collaboration: collaborationReducer,
        alert: alertReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});
