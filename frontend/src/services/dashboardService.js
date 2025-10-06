import api from './api';

const dashboardService = {
    getDashboards: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    },

    getDashboard: async (id) => {
        const response = await api.get(`/dashboard/${id}`);
        return response.data;
    },

    createDashboard: async (dashboardData) => {
        const response = await api.post('/dashboard', dashboardData);
        return response.data;
    },

    updateDashboard: async (id, data) => {
        const response = await api.put(`/dashboard/${id}`, data);
        return response.data;
    },

    deleteDashboard: async (id) => {
        const response = await api.delete(`/dashboard/${id}`);
        return response.data;
    },

    duplicateDashboard: async (id) => {
        const response = await api.post(`/dashboard/${id}/duplicate`);
        return response.data;
    },
};

export default dashboardService;
