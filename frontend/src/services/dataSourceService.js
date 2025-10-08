import api from './api';

const dataSourceService = {
    // Get all data sources
    getDataSources: async () => {
        const response = await api.get('/data-sources');
        return response.data;
    },

    // Get single data source
    getDataSource: async (id) => {
        const response = await api.get(`/data-sources/${id}`);
        return response.data;
    },

    // Create new data source
    createDataSource: async (dataSourceData) => {
        const response = await api.post('/data-sources', dataSourceData);
        return response.data;
    },

    // Update data source
    updateDataSource: async (id, dataSourceData) => {
        const response = await api.put(`/data-sources/${id}`, dataSourceData);
        return response.data;
    },

    // Delete data source
    deleteDataSource: async (id) => {
        const response = await api.delete(`/data-sources/${id}`);
        return response.data;
    },

    // Test data source connection
    testDataSource: async (id) => {
        const response = await api.post(`/data-sources/${id}/test`);
        return response.data;
    },

    // Sync data source
    syncDataSource: async (id) => {
        const response = await api.post(`/data-sources/${id}/sync`);
        return response.data;
    }
};

export default dataSourceService;
