const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController');
const { authenticateUser } = require('../authMiddleware');
router.route('/create').post(authenticateUser ,travelController.createExperience)
router.route('/experiences').get(authenticateUser,travelController.viewAllExperiences);
router.route('/experiencesCreator/:id').get(travelController.viewAllCreatorExperiences);

router.route('/experiences/:id').get(travelController.viewSingleExperience);

router.route('/experiences/:id').put(authenticateUser,travelController.updateExperience);
router.route('/experiences/:id').delete(travelController.deleteExperience);
router.route('/all-experiences').get(travelController.getAllExperiences);
router.route('/search-experiences').get(travelController.searchExperiences);
module.exports = router;
