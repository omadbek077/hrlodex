const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Faol tariflar (hammaga ochiq)
router.get('/active', tariffController.getActiveTariffs);

// Admin route'lar
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', tariffController.getAllTariffs);
router.post('/', tariffController.createTariff);
router.patch('/:id', tariffController.updateTariff);
router.delete('/:id', tariffController.deleteTariff);

module.exports = router;
