const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.use(protect);

router.get('/me', profileController.getMe);
router.patch('/me', profileController.updateProfile);
router.get('/candidate', profileController.getCandidateByEmail);

module.exports = router;
