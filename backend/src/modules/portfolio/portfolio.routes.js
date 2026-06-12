import { Router } from 'express';
import * as portfolioController from './portfolio.controller.js';
import { authMiddleware, optionalAuth } from '#Middlewares/auth.middleware.js';
import { requireRole } from '#Middlewares/roles.middleware.js';
import upload from '#Middlewares/upload.middleware.js';

const router = Router();

// Routes spécifiques /templates — AVANT tout paramètre dynamique
router.get('/templates', portfolioController.getTemplates);
router.post('/templates/:id_modele/apercu', authMiddleware, requireRole('ADMINISTRATEUR'), upload.single('fichier'), portfolioController.uploadApercuModele);

// Routes /me — AVANT /:url_publique
router.get('/me', authMiddleware, requireRole('ETUDIANT'), portfolioController.getMyPortfolios);
router.post('/me', authMiddleware, requireRole('ETUDIANT'), portfolioController.createPortfolio);
router.put('/me/:id_portfolio', authMiddleware, requireRole('ETUDIANT'), portfolioController.updatePortfolio);
router.delete('/me/:id_portfolio', authMiddleware, requireRole('ETUDIANT'), portfolioController.deletePortfolio);
router.post('/me/:id_portfolio/publish', authMiddleware, requireRole('ETUDIANT'), portfolioController.publishPortfolio);
router.get('/me/:id_portfolio/stats', authMiddleware, requireRole('ETUDIANT'), portfolioController.getPortfolioStats);

// Route IA — AVANT /:url_publique
router.post('/generate-adaptative', authMiddleware, requireRole('ETUDIANT'), portfolioController.generateAdaptative);

router.get('/:url_publique/pdf', optionalAuth, portfolioController.exportPDF);

// Route dynamique publique — EN DERNIER
router.get('/:url_publique', optionalAuth, portfolioController.getPublicPortfolio);

export default router;