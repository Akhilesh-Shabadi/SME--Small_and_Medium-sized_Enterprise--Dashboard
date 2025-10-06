import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addComment, updateComment, removeComment, addTask, updateTask, removeTask, addActiveUser, removeActiveUser } from '../store/slices/collaborationSlice';
import { addAlert, addNotification } from '../store/slices/alertSlice';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && token) {
            const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
                auth: {
                    token,
                },
                transports: ['websocket', 'polling'],
            });

            // Connection events
            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                toast.error('Connection error. Please refresh the page.');
            });

            // Real-time data updates
            newSocket.on('data:update', (data) => {
                console.log('Data update received:', data);
                // Handle real-time data updates
                // This would typically update the analytics store
            });

            // Collaboration events
            newSocket.on('comment:new', (comment) => {
                dispatch(addComment(comment));
                toast.success('New comment added');
            });

            newSocket.on('comment:updated', (comment) => {
                dispatch(updateComment(comment));
            });

            newSocket.on('comment:deleted', (data) => {
                dispatch(removeComment(data.commentId));
            });

            newSocket.on('task:assigned', (task) => {
                dispatch(addTask(task));
                toast.success(`New task assigned: ${task.title}`);
            });

            newSocket.on('task:created', (task) => {
                dispatch(addTask(task));
                toast.success(`New task created: ${task.title}`);
            });

            newSocket.on('task:updated', (task) => {
                dispatch(updateTask(task));
            });

            // User presence events
            newSocket.on('user:connected', (user) => {
                dispatch(addActiveUser(user));
                toast.success(`${user.user.firstName} joined`);
            });

            newSocket.on('user:disconnected', (data) => {
                dispatch(removeActiveUser(data.userId));
            });

            newSocket.on('dashboard:user_joined', (data) => {
                dispatch(addActiveUser(data));
                toast.success(`${data.user.firstName} joined the dashboard`);
            });

            newSocket.on('dashboard:user_left', (data) => {
                dispatch(removeActiveUser(data.userId));
            });

            // Alert events
            newSocket.on('alert:new', (alert) => {
                dispatch(addAlert(alert));
                toast.error(`Alert: ${alert.title}`);
            });

            newSocket.on('alert:acknowledged', (data) => {
                // Handle alert acknowledgment
                console.log('Alert acknowledged:', data);
            });

            // Notification events
            newSocket.on('notification:new', (notification) => {
                dispatch(addNotification(notification));
                toast.success(notification.title);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, token, dispatch]);

    // Socket methods
    const joinDashboard = (dashboardId) => {
        if (socket) {
            socket.emit('dashboard:join', dashboardId);
        }
    };

    const leaveDashboard = (dashboardId) => {
        if (socket) {
            socket.emit('dashboard:leave', dashboardId);
        }
    };

    const subscribeToData = (dataSourceId) => {
        if (socket) {
            socket.emit('data:subscribe', dataSourceId);
        }
    };

    const unsubscribeFromData = (dataSourceId) => {
        if (socket) {
            socket.emit('data:unsubscribe', dataSourceId);
        }
    };

    const createComment = (commentData) => {
        if (socket) {
            socket.emit('comment:create', commentData);
        }
    };

    const updateComment = (commentData) => {
        if (socket) {
            socket.emit('comment:update', commentData);
        }
    };

    const deleteComment = (commentData) => {
        if (socket) {
            socket.emit('comment:delete', commentData);
        }
    };

    const createTask = (taskData) => {
        if (socket) {
            socket.emit('task:create', taskData);
        }
    };

    const updateTask = (taskData) => {
        if (socket) {
            socket.emit('task:update', taskData);
        }
    };

    const acknowledgeAlert = (alertData) => {
        if (socket) {
            socket.emit('alert:acknowledge', alertData);
        }
    };

    const startTyping = (widgetId) => {
        if (socket) {
            socket.emit('typing:start', { widgetId });
        }
    };

    const stopTyping = (widgetId) => {
        if (socket) {
            socket.emit('typing:stop', { widgetId });
        }
    };

    const value = {
        socket,
        isConnected,
        joinDashboard,
        leaveDashboard,
        subscribeToData,
        unsubscribeFromData,
        createComment,
        updateComment,
        deleteComment,
        createTask,
        updateTask,
        acknowledgeAlert,
        startTyping,
        stopTyping,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
