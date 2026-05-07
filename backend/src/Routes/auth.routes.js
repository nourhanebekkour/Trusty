import { Router } from 'express';
import * as authController from '../Controllers/auth.controller.js';
import { authMiddleware } from '../Middlewars/auth.middleware.js';
import { requireRole } from '../Middlewars/roles.middleware.js';

const router = Router();

// POST /api/auth/register → inscription
router.post('/register', authController.register);

// POST /api/auth/login → connexion, retourne un token
router.post('/login', authController.login);

router.post('/forgot-password', authController.oublierMDP);

router.post('/reset-password', authController.changerMDP);

// ---- ROUTES PROTÉGÉES ----
// authMiddleware vérifie le token avant le controller

// GET /api/auth/me → infos du compte connecté
router.get('/me', authMiddleware, authController.getMe);

// ---- ROUTES ADMIN ----
// authMiddleware + requireRole vérifient token ET rôle

// GET /api/auth/admin-only → accessible uniquement aux admins
router.get(
  '/admin-only',
  authMiddleware,
  requireRole('ADMINISTRATEUR'),
  (req, res) => res.json({ message: 'Accès admin' })
);

export default router;