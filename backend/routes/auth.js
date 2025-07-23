const express = require('express');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация и авторизация
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Регистрация успешна
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Вход выполнен, токен в cookie
 *       400:
 *         description: Неверные данные
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход пользователя
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Выход выполнен
 */

// Валидация и обработка ошибок для регистрации
router.post(
  '/register',
  [
    check('username', 'Имя обязательно').notEmpty(),
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Пароль минимум 6 символов').isLength({ min: 6 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
  register
);

// Rate limit для login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5,
  message: { message: 'Слишком много попыток входа. Попробуйте позже.' }
});

// Валидация и обработка ошибок для логина
router.post(
  '/login',
  loginLimiter,
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Пароль обязателен').notEmpty()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
  login
);

router.post('/logout', logout);

module.exports = router; 