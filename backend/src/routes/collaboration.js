const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentById
} = require('../controllers/commentController');
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getMyTasks
} = require('../controllers/taskController');

const router = express.Router();

// Validation rules
const commentValidation = [
    body('widgetId')
        .isUUID()
        .withMessage('Widget ID must be a valid UUID'),
    body('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Comment content must be between 1 and 2000 characters'),
    body('parentId')
        .optional()
        .isUUID()
        .withMessage('Parent ID must be a valid UUID'),
    body('mentions')
        .optional()
        .isArray()
        .withMessage('Mentions must be an array')
];

const taskValidation = [
    body('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Task title must be between 2 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('widgetId')
        .isUUID()
        .withMessage('Widget ID must be a valid UUID'),
    body('assignedTo')
        .isUUID()
        .withMessage('Assigned to must be a valid UUID'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
];

// Comment routes
router.get('/comments/:widgetId', authenticateToken, getComments);
router.get('/comments/single/:id', authenticateToken, getCommentById);
router.post('/comments', authenticateToken, commentValidation, createComment);
router.put('/comments/:id', authenticateToken, commentValidation, updateComment);
router.delete('/comments/:id', authenticateToken, deleteComment);

// Task routes
router.get('/tasks', authenticateToken, getTasks);
router.get('/tasks/my-tasks', authenticateToken, getMyTasks);
router.get('/tasks/:id', authenticateToken, getTask);
router.post('/tasks', authenticateToken, taskValidation, createTask);
router.put('/tasks/:id', authenticateToken, taskValidation, updateTask);
router.delete('/tasks/:id', authenticateToken, deleteTask);

module.exports = router;
