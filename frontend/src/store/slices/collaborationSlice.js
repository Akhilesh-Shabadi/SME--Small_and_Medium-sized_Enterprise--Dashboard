import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    comments: [],
    tasks: [],
    activeUsers: [],
    isLoading: false,
    error: null,
};

const collaborationSlice = createSlice({
    name: 'collaboration',
    initialState,
    reducers: {
        setComments: (state, action) => {
            state.comments = action.payload;
        },
        addComment: (state, action) => {
            state.comments.push(action.payload);
        },
        updateComment: (state, action) => {
            const index = state.comments.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.comments[index] = action.payload;
            }
        },
        removeComment: (state, action) => {
            state.comments = state.comments.filter(c => c.id !== action.payload);
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        addTask: (state, action) => {
            state.tasks.push(action.payload);
        },
        updateTask: (state, action) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
        removeTask: (state, action) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        },
        setActiveUsers: (state, action) => {
            state.activeUsers = action.payload;
        },
        addActiveUser: (state, action) => {
            const existingUser = state.activeUsers.find(u => u.userId === action.payload.userId);
            if (!existingUser) {
                state.activeUsers.push(action.payload);
            }
        },
        removeActiveUser: (state, action) => {
            state.activeUsers = state.activeUsers.filter(u => u.userId !== action.payload);
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
    setComments,
    addComment,
    updateComment,
    removeComment,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setActiveUsers,
    addActiveUser,
    removeActiveUser,
    setLoading,
    setError,
    clearError,
} = collaborationSlice.actions;
export default collaborationSlice.reducer;
