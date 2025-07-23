const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Создать заказ (на основе корзины)
router.post('/', auth(), orderController.createOrder);
// Получить свои заказы
router.get('/my', auth(), orderController.getMyOrders);
// Получить заказ по id
router.get('/:id', auth(), orderController.getOrderById);
// Для админа: получить все заказы
router.get('/', auth('admin'), orderController.getAllOrders);
// Для админа: сменить статус заказа
router.put('/:id/status', auth('admin'), orderController.updateOrderStatus);
// Оплатить заказ (заглушка)
router.post('/:id/pay', auth(), orderController.payOrder);

module.exports = router; 