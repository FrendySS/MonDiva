const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Получить корзину пользователя
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении корзины' });
  }
};

// Добавить товар в корзину
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = await Cart.create({ user: req.user.userId, items: [] });
    }
    const existingItem = cart.items.find(item => item.product.equals(productId) && item.size === size && item.color === color);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении в корзину' });
  }
};

// Изменить количество товара в корзине
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Корзина не найдена' });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Товар не найден в корзине' });
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении корзины' });
  }
};

// Удалить товар из корзины
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Корзина не найдена' });
    cart.items = cart.items.filter(item => item.id !== itemId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении из корзины' });
  }
};

// Очистить корзину
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Корзина не найдена' });
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при очистке корзины' });
  }
}; 