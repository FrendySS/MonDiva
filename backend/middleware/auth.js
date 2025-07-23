const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    let token = req.cookies.token;
    // Добавим поддержку Bearer
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Нет доступа' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Недостаточно прав' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Неверный токен' });
    }
  };
};

module.exports = auth; 