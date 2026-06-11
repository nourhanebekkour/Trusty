import { Router } from 'express';
import * as portfolioController from './portfolio.controller.js';
import { authMiddleware, optionalAuth } from '#Middlewares/auth.middleware.js';
import { requireRole } from '#Middlewares/roles.middleware.js';
import upload from '#Middlewares/upload.middleware.js';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES (SPECIFIQUES)
// ==========================================
router.get('/templates', portfolioController.getTemplates);

// ==========================================
// ROUTES PROTEGEES (ETUDIANT)
// ==========================================

// Récupérer tous ses portfolios
router.get('/me', authMiddleware, requireRole('ETUDIANT'), portfolioController.getMyPortfolios);

// Créer un nouveau portfolio
router.post('/me', authMiddleware, requireRole('ETUDIANT'), portfolioController.createPortfolio);

// Mettre à jour un portfolio existant
router.put('/me/:id_portfolio', authMiddleware, requireRole('ETUDIANT'), portfolioController.updatePortfolio);

// Publier / Dépublier un portfolio
router.post('/me/:id_portfolio/publish', authMiddleware, requireRole('ETUDIANT'), portfolioController.publishPortfolio);

// Statistiques d'un portfolio
router.get('/me/:id_portfolio/stats', authMiddleware, requireRole('ETUDIANT'), portfolioController.getPortfolioStats);

// Télécharger un aperçu pour un modèle de portfolio
router.post('/templates/:id_modele/apercu', authMiddleware, requireRole('ADMINISTRATEUR'), upload.single('fichier'), portfolioController.uploadApercuModele);


// Route pour récupérer un portfolio public par URL (sans authentification)
router.get('/:url_publique', optionalAuth, portfolioController.getPublicPortfolio);


router.delete('/me/:id_portfolio', authMiddleware, requireRole('ETUDIANT'), portfolioController.deletePortfolio);
export default router;
