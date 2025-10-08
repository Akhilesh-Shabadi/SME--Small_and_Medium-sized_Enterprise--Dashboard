import api from './api';

const widgetService = {
    // Get all widgets for a dashboard
    getWidgets: async (dashboardId) => {
        const response = await api.get(`/widget/dashboard/${dashboardId}/widgets`);
        return response.data;
    },

    // Get single widget
    getWidget: async (widgetId) => {
        const response = await api.get(`/widget/${widgetId}`);
        return response.data;
    },

    // Create new widget
    createWidget: async (dashboardId, widgetData) => {
        const response = await api.post(`/widget/dashboard/${dashboardId}/widgets`, widgetData);
        return response.data;
    },

    // Update widget
    updateWidget: async (widgetId, widgetData) => {
        const response = await api.put(`/widget/${widgetId}`, widgetData);
        return response.data;
    },

    // Delete widget
    deleteWidget: async (widgetId) => {
        const response = await api.delete(`/widget/${widgetId}`);
        return response.data;
    },

    // Get available data sources
    getDataSources: async () => {
        const response = await api.get('/data-sources');
        return response.data;
    }
};

export default widgetService;
