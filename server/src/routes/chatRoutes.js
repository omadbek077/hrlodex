const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('employer', 'admin'));

router.get('/', chatController.getMessages);
router.post('/:applicationId', chatController.sendMessage);

module.exports = router;
