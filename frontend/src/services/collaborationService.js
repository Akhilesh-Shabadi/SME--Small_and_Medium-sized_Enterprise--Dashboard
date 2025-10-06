import api from './api';

const collaborationService = {
    // Comments
    getComments: async (widgetId) => {
        const response = await api.get(`/collaboration/comments/${widgetId}`);
        return response.data;
    },

    createComment: async (commentData) => {
        const response = await api.post('/collaboration/comments', commentData);
        return response.data;
    },

    updateComment: async (commentId, commentData) => {
        const response = await api.put(`/collaboration/comments/${commentId}`, commentData);
        return response.data;
    },

    deleteComment: async (commentId) => {
        const response = await api.delete(`/collaboration/comments/${commentId}`);
        return response.data;
    },

    getCommentById: async (commentId) => {
        const response = await api.get(`/collaboration/comments/single/${commentId}`);
        return response.data;
    },

    // Tasks
    getTasks: async (filters = {}) => {
        const response = await api.get('/collaboration/tasks', { params: filters });
        return response.data;
    },

    getMyTasks: async (filters = {}) => {
        const response = await api.get('/collaboration/tasks/my-tasks', { params: filters });
        return response.data;
    },

    getTask: async (taskId) => {
        const response = await api.get(`/collaboration/tasks/${taskId}`);
        return response.data;
    },

    createTask: async (taskData) => {
        const response = await api.post('/collaboration/tasks', taskData);
        return response.data;
    },

    updateTask: async (taskId, taskData) => {
        const response = await api.put(`/collaboration/tasks/${taskId}`, taskData);
        return response.data;
    },

    deleteTask: async (taskId) => {
        const response = await api.delete(`/collaboration/tasks/${taskId}`);
        return response.data;
    }
};

export default collaborationService;
