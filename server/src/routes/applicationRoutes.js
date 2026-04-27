const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/my', restrictTo('candidate'), applicationController.getMyApplications);

router.use(restrictTo('employer', 'admin'));

router.get('/', applicationController.getAllApplications);
router.get('/job/:jobId', applicationController.getApplicationsByJob);
router.patch('/:id/status', applicationController.updateApplicationStatus);

module.exports = router;
