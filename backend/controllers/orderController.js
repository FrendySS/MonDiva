const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Создать заказ на основе корзины
exports.createOrder = async (req, res) => {
  try {
    const { address } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }
    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.product.price
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      user: req.user.userId,
      items,
      total,
      address,
      status: 'processing',
      statusHistory: [{ status: 'processing' }]
    });
    // Очищаем корзину
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
};

// Получить свои заказы
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

// Получить заказ по id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    // Только владелец или админ
    if (order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказа' });
  }
};

// Для админа: получить все заказы
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

// Для админа: сменить статус заказа
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    order.status = status;
    order.statusHistory.push({ status });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса заказа' });
  }
};

// Оплатить заказ (заглушка)
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    // Только владелец или админ
    if (order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Заказ уже оплачен' });
    }
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'processing';
    order.statusHistory.push({ status: 'processing' });
    await order.save();
    res.json({ message: 'Оплата прошла успешно (заглушка)', order });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при оплате заказа' });
  }
}; 