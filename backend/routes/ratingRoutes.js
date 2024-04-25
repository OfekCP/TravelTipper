const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const {authenticateUser}=require('../authMiddleware')
router.route('/experiences/:experienceId/ratings').post(authenticateUser,ratingController.createRating);
router.route('/experiences/:experienceId/ratings').get(authenticateUser,ratingController.getAllRatings);
router.route('/experiences/:experienceId/average-rating').get(authenticateUser,ratingController.getAverageRating);
router.route('/experiences/:experienceId/remove-rating').delete(authenticateUser,ratingController.removeRating)
module.exports = router;
