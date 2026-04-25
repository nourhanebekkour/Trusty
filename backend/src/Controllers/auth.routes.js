const express = require('express');
const router = express.Router();

const authController = require('../Controllers/auth.controller');
const authMiddleware = require('../Middlewares/auth.middleware');
const requireRole = require('../Middlewares/roles.middleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route protégée
router.get('/me', authMiddleware, authController.getMe);

// Route admin
router.get(
  '/admin-only',
  authMiddleware,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  (req, res) => {
    res.json({ message: 'Accès admin OK' });
  }
);

module.exports = router;