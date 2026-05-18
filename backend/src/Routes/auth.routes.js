import { Router } from 'express';
import * as authController from '../Controllers/auth.controller.js';
import { authMiddleware } from '../Middlewars/auth.middleware.js';
import { requireRole } from '../Middlewars/roles.middleware.js';
import validate from '../Middlewars/validate.middleware.js';
import { registerSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema} from '../Validators/auth.validator.js';
import { loginLimiter, forgotPasswordLimiter } from '../Middlewars/rateLimiter.middleware.js';

const router = Router();

// POST /api/auth/register → inscription
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login → connexion, stocke les tokens dans cookies HttpOnly
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// POST /api/auth/refresh-token → renouveler l'access token via le refresh token
router.post('/refresh-token', authController.refresh);

// POST /api/auth/logout → déconnexion, supprime les cookies
router.post('/logout', authMiddleware, authController.logout);

router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.oublierMDP);
router.post('/reset-password', validate(resetPasswordSchema), authController.changerMDP);

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