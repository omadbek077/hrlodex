const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('employer', 'admin'));

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
