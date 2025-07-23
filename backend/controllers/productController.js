const Product = require('../models/Product');

// Создать товар (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Ошибка при создании товара' });
  }
};

// Получить список товаров с фильтрацией, сортировкой, пагинацией
exports.getProducts = async (req, res) => {
  try {
    const { category, color, size, brand, minPrice, maxPrice, sortBy, order, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (color) filter.colors = color;
    if (size) filter.sizes = size;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    let sort = {};
    if (sortBy) {
      if (sortBy === 'price') sort.price = order === 'desc' ? -1 : 1;
      if (sortBy === 'popularity') sort.popularity = order === 'desc' ? -1 : 1;
      if (sortBy === 'createdAt') sort.createdAt = order === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении товаров' });
  }
};

// Получить один товар
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};

// Обновить товар (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Ошибка при обновлении товара' });
  }
};

// Удалить товар (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    res.status(400).json({ message: 'Ошибка при удалении товара' });
  }
};

// Загрузка изображений для товара (admin)
exports.uploadImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Нет файлов для загрузки' });
    }
    const imagePaths = files.map(file => file.path.replace('\\', '/'));
    product.images = product.images.concat(imagePaths);
    await product.save();
    res.json({ message: 'Изображения загружены', images: product.images });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при загрузке изображений' });
  }
}; 