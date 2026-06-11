import { Router } from 'express';
import * as authentificationController from './authentification.controller.js';
import { authMiddleware } from '#Middlewares/auth.middleware.js';
import { requireRole, requireNiveauAcces } from '#Middlewares/roles.middleware.js';
import validate from '#Middlewares/validate.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, createUserAdminSchema, requestAccountSchema, verifyEmailSchema } from './authentification.validator.js';
import { loginLimiter, forgotPasswordLimiter } from '#Middlewares/rateLimiter.middleware.js';


const router = Router();

// POST /api/auth/register → inscription unifiée (ETUDIANT, PROFESSEUR, PROFESSIONNEL)
router.post('/register', validate(registerSchema), authentificationController.register);

// POST /api/auth/verify-email → vérification de l'adresse email
router.post('/verify-email', validate(verifyEmailSchema), authentificationController.verifierEmail);

// POST /api/auth/login → connexion, stocke les tokens dans cookies HttpOnly
router.post('/login', loginLimiter, validate(loginSchema), authentificationController.login);

// POST /api/auth/refresh-token → renouveler l'access token via le refresh token
router.post('/refresh-token', authentificationController.refresh);

// POST /api/auth/logout → déconnexion, supprime les cookies
router.post('/logout', authMiddleware, authentificationController.logout);

router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authentificationController.oublierMDP);
router.post('/reset-password', validate(resetPasswordSchema), authentificationController.changerMDP);

// POST /api/auth/request-account → demande de création de compte (étudiant/prof sans compte)
router.post('/request-account', validate(requestAccountSchema), authentificationController.demanderCreationCompte);

// ---- ROUTES PROTÉGÉES ----
router.get('/me', authMiddleware, authentificationController.getMe);

// ---- ROUTES ADMIN ----
router.get('/admin-only', authMiddleware, requireRole('ADMINISTRATEUR'), (_, res) => res.json({ message: 'Accès admin' }));

// POST /api/auth/admin/create-user → création d'un compte par l'admin
router.post(
  '/admin/create-user',
  authMiddleware,
  requireNiveauAcces('SUPER_ADMIN'),
  validate(createUserAdminSchema),
  authentificationController.creerUtilisateurAdmin
);

export default router;