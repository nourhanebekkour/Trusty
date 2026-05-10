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
} from '../Controllers/badgeController.js';

// ──────────────────────────────────────────────────────────────────────────────
// Importe ton middleware d'authentification selon le pattern du projet.
// Adapte le chemin si nécessaire (vérifie dans les autres routes comment
// ils importent le middleware — ex: authRoutes.js ou projetRoutes.js).
// ──────────────────────────────────────────────────────────────────────────────
import { verifierToken, autoriser } from '../Middlewares/authMiddleware.js';

// ──────────────────────────────────────────────────────────────────────────────
// Importe le validateur Zod si le projet l'utilise uniformément.
// Décommente et adapte si tu as un badgeValidator dans /Validators/.
// ──────────────────────────────────────────────────────────────────────────────
// import { validerBadge, validerAttribution } from '../Validators/badgeValidator.js';

const router = Router();

// ============================================================================
// CRUD BADGES  —  /api/badges
// ============================================================================

// GET  /api/badges          → lister tous les badges (avec filtres optionnels)
// POST /api/badges          → créer un badge (admin/professeur seulement)
router
    .route('/')
    .get(verifierToken, listerBadges)
    .post(verifierToken, autoriser('ADMINISTRATEUR', 'PROFESSEUR'), creerBadge);

// GET    /api/badges/:id    → détail d'un badge
// PUT    /api/badges/:id    → modifier un badge
// DELETE /api/badges/:id   → supprimer un badge
router
    .route('/:id')
    .get(verifierToken, obtenirBadge)
    .put(verifierToken, autoriser('ADMINISTRATEUR', 'PROFESSEUR'), modifierBadge)
    .delete(verifierToken, autoriser('ADMINISTRATEUR'), supprimerBadge);

// ============================================================================
// ATTRIBUTION  —  /api/badges/:id/...
// ============================================================================

// POST   /api/badges/:id/attribuer             → attribuer le badge à un étudiant
// GET    /api/badges/:id/etudiants             → voir tous les étudiants qui ont ce badge
router
    .route('/:id/attribuer')
    .post(verifierToken, autoriser('ADMINISTRATEUR', 'PROFESSEUR'), attribuerBadgeEtudiant);

router
    .route('/:id/etudiants')
    .get(verifierToken, autoriser('ADMINISTRATEUR', 'PROFESSEUR'), listerEtudiantsDuBadge);

// DELETE /api/badges/:id/retirer/:id_etudiant  → retirer le badge d'un étudiant
router
    .route('/:id/retirer/:id_etudiant')
    .delete(verifierToken, autoriser('ADMINISTRATEUR', 'PROFESSEUR'), retirerBadgeEtudiant);

// ============================================================================
// VUE ÉTUDIANT  —  /api/badges/etudiant/:id_etudiant
// ============================================================================

// GET /api/badges/etudiant/:id_etudiant  → tous les badges d'un étudiant
router
    .route('/etudiant/:id_etudiant')
    .get(verifierToken, listerBadgesEtudiant);

export default router;