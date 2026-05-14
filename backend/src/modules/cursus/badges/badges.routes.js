import { Router } from 'express';
import {
    creerBadge,
    listerBadges,
    obtenirBadge,
    modifierBadge,
    supprimerBadge,
    attribuerBadgeEtudiant,
    retirerBadgeEtudiant,
    listerBadgesEtudiant,
    listerEtudiantsDuBadge,
    uploadIcone,
} from './badges.controller.js';

// ──────────────────────────────────────────────────────────────────────────────
// Middleware d'authentification et d'upload
// ──────────────────────────────────────────────────────────────────────────────
import {requireRole} from '#Middlewares/roles.middleware.js';
import upload from '#Middlewares/upload.middleware.js';

const router = Router();

// ============================================================================
// CRUD BADGES  —  /api/badges
// ============================================================================

// GET  /api/badges          → lister tous les badges (avec filtres optionnels)
// POST /api/badges          → créer un badge (admin seulement)
router
    .route('/')
    .get( listerBadges)
    .post( requireRole('ADMINISTRATEUR'), creerBadge);

// GET    /api/badges/:id    → détail d'un badge
// PUT    /api/badges/:id    → modifier un badge
// DELETE /api/badges/:id   → supprimer un badge
router
    .route('/:id')
    .get( obtenirBadge)
    .put(requireRole('ADMINISTRATEUR'), modifierBadge)
    .delete(requireRole('ADMINISTRATEUR'), supprimerBadge);

/**
 * Route spécifique pour l'upload de l'icône
 */
router
    .route('/:id/icone')
    .post(requireRole('ADMINISTRATEUR'), upload.single('icone'), uploadIcone);

// ============================================================================
// ATTRIBUTION  —  /api/badges/:id/...
// ============================================================================

// POST   /api/badges/:id/attribuer             → attribuer le badge à un étudiant
// GET    /api/badges/:id/etudiants             → voir tous les étudiants qui ont ce badge
router
    .route('/:id/attribuer')
    .post(requireRole('ADMINISTRATEUR'), attribuerBadgeEtudiant);

router
    .route('/:id/etudiants')
    .get(requireRole('ADMINISTRATEUR'), listerEtudiantsDuBadge);

// DELETE /api/badges/:id/retirer/:id_etudiant  → retirer le badge d'un étudiant
router
    .route('/:id/retirer/:id_etudiant')
    .delete(requireRole('ADMINISTRATEUR'), retirerBadgeEtudiant);

// ============================================================================
// VUE ÉTUDIANT  —  /api/badges/etudiant/:id_etudiant
// ============================================================================

// GET /api/badges/etudiant/:id_etudiant  → tous les badges d'un étudiant
router
    .route('/etudiant/:id_etudiant')
    .get(listerBadgesEtudiant);

export default router;