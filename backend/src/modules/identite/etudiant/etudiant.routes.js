import express from 'express';
import * as etudiantController from './etudiant.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireRole, requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';

const router = express.Router();


router.get('/', requireRole('ADMINISTRATEUR'), etudiantController.obtenirTousLesProfils);
router.get('/ecole/:ecole', etudiantController.obtenirEtudiantsParEcole);
router.get('/:id', requireOwnerOrAdmin('id'), etudiantController.obtenirProfilParId);

router.put('/:id', requireOwnerOrAdmin('id'), etudiantController.traiterProfil);
router.post('/:id/avatar', requireOwnerOrAdmin('id'), upload.single('fichier'), etudiantController.uploadAvatar);

// Route pour déclencher le recalcul du score (accessible par l'étudiant lui-même ou l'admin)
router.post('/:id/recalculer-score', requireOwnerOrAdmin('id'), etudiantController.recalculerScoreCredibilite);

export default router;
