const { Comment, User, Widget } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get comments for a widget
// @route   GET /api/collaboration/comments/:widgetId
// @access  Private
const getComments = async (req, res) => {
    try {
        const { widgetId } = req.params;

        const comments = await Comment.findAll({
            where: {
                widgetId,
                isDeleted: false
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Comment,
                as: 'replies',
                where: { isDeleted: false },
                required: false,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
                }]
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            data: { comments }
        });
    } catch (error) {
        logger.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments'
        });
    }
};

// @desc    Create a new comment
// @route   POST /api/collaboration/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { widgetId, content, parentId, mentions } = req.body;
        const userId = req.user.id;

        const comment = await Comment.create({
            userId,
            widgetId,
            content,
            parentId: parentId || null,
            mentions: mentions || []
        });

        // Get comment with user details
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: { comment: commentWithUser }
        });
    } catch (error) {
        logger.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create comment'
        });
    }
};

// @desc    Update a comment
// @route   PUT /api/collaboration/comments/:id
// @access  Private
const updateComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { content, mentions } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findOne({
            where: {
                id,
                userId,
                isDeleted: false
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or access denied'
            });
        }

        await comment.update({
            content,
            mentions: mentions || comment.mentions,
            isEdited: true,
            editedAt: new Date()
        });

        // Get updated comment with user details
        const updatedComment = await Comment.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }]
        });

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: { comment: updatedComment }
        });
    } catch (error) {
        logger.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update comment'
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/collaboration/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findOne({
            where: {
                id,
                userId,
                isDeleted: false
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or access denied'
            });
        }

        // Soft delete the comment
        await comment.update({
            isDeleted: true,
            deletedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment'
        });
    }
};

// @desc    Get comment by ID
// @route   GET /api/collaboration/comments/single/:id
// @access  Private
const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findOne({
            where: {
                id,
                isDeleted: false
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Comment,
                as: 'replies',
                where: { isDeleted: false },
                required: false,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
                }]
            }]
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.json({
            success: true,
            data: { comment }
        });
    } catch (error) {
        logger.error('Error fetching comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comment'
        });
    }
};

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentById
};
