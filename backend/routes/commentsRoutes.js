const express = require('express');
const router = express.Router();
const {authenticateUser}=require('../authMiddleware')
const commentController = require('../controllers/commentController');
  router.route('/experiences/:experienceId/comments').post(authenticateUser,commentController.createComment);
router.route('/experiences/:experienceId/comments').get(commentController.getAllComments);
router.route('/comments/:commentId').get(authenticateUser, commentController.getCommentById);
router.route('/comments/:experienceId/:commentId').put(authenticateUser, commentController.updateComment);
router.route('/comments/:experienceId/:commentId').delete(authenticateUser, commentController.deleteComment);

module.exports = router;