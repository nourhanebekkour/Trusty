import { Router } from 'express';
import * as authentificationController from './authentification.controller.js';
import { authMiddleware } from '#Middlewares/auth.middleware.js';
import { requireRole } from '#Middlewares/roles.middleware.js';
import validate from '#Middlewares/validate.middleware.js';
import { registerSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema} from './authentification.validator.js';
import { loginLimiter, forgotPasswordLimiter } from '#Middlewares/rateLimiter.middleware.js';


const router = Router();

// POST /api/auth/register → inscription
router.post('/register', validate(registerSchema), authentificationController.register);

// POST /api/auth/login → connexion, stocke les tokens dans cookies HttpOnly
router.post('/login', loginLimiter, validate(loginSchema), authentificationController.login);

// POST /api/auth/refresh-token → renouveler l'access token via le refresh token
router.post('/refresh-token', authentificationController.refresh);

// POST /api/auth/logout → déconnexion, supprime les cookies
router.post('/logout', authMiddleware, authentificationController.logout);

router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authentificationController.oublierMDP);
router.post('/reset-password', validate(resetPasswordSchema), authentificationController.changerMDP);

// ---- ROUTES PROTÉGÉES ----
// authMiddleware vérifie le token avant le controller

// GET /api/auth/me → infos du compte connecté
router.get('/me', authMiddleware, authentificationController.getMe);

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