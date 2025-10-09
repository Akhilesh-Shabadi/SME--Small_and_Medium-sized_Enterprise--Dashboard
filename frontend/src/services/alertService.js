import api from './api';

// Alert API service functions
export const alertService = {
    // Get all alerts with optional filters
    getAlerts: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.severity) params.append('severity', filters.severity);
            if (filters.type) params.append('type', filters.type);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/alerts?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            throw error;
        }
    },

    // Get single alert by ID
    getAlert: async (alertId) => {
        try {
            const response = await api.get(`/alerts/${alertId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching alert:', error);
            throw error;
        }
    },

    // Create new alert
    createAlert: async (alertData) => {
        try {
            const response = await api.post('/alerts', alertData);
            return response.data;
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    },

    // Update existing alert
    updateAlert: async (alertId, updateData) => {
        try {
            const response = await api.put(`/alerts/${alertId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating alert:', error);
            throw error;
        }
    },

    // Delete alert
    deleteAlert: async (alertId) => {
        try {
            const response = await api.delete(`/alerts/${alertId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting alert:', error);
            throw error;
        }
    },

    // Acknowledge alert
    acknowledgeAlert: async (alertId) => {
        try {
            const response = await api.post(`/alerts/${alertId}/acknowledge`);
            return response.data;
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            throw error;
        }
    },

    // Get alert statistics
    getAlertStatistics: async () => {
        try {
            const response = await api.get('/alerts/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching alert statistics:', error);
            throw error;
        }
    },

    // Get data sources for alert creation
    getDataSources: async () => {
        try {
            const response = await api.get('/data-sources');
            return response.data;
        } catch (error) {
            console.error('Error fetching data sources:', error);
            throw error;
        }
    }
};

export default alertService;
