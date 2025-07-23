const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// Получить корзину
router.get('/', auth(), cartController.getCart);
// Добавить товар в корзину
router.post('/add', auth(), cartController.addToCart);
// Изменить количество товара
router.put('/update', auth(), cartController.updateCartItem);
// Удалить товар из корзины
router.delete('/remove', auth(), cartController.removeCartItem);
// Очистить корзину
router.delete('/clear', auth(), cartController.clearCart);

module.exports = router; 