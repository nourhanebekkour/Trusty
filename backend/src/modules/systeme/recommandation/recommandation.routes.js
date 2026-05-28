import { Router } from 'express';
import * as recommandationController from './recommandation.controller.js';
import { requireRole, requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';
import validate from '#Middlewares/validate.middleware.js';
import { recommandationSchema, validationRecommandationSchema } from './recommandation.validator.js';

const router = Router();

// --- ROUTES PUBLIQUES (Recommandations validées) ---
router.get('/public/etudiant/:id_etudiant', recommandationController.recupererRecommandationsValidees);

// --- ROUTES ÉTUDIANT (Recommandations reçues, validées ou non) ---
router.get('/mes-recommandations-recus', recommandationController.recupererMesRecommandationsRecus);

// --- ROUTES PRIVÉES / GESTION ---
router.post('/', validate(recommandationSchema), recommandationController.creerRecommandation);

// Validation de la recommandation (accessible par l'étudiant cible ou admin dans le controller)
router.patch('/:id/valider', validate(validationRecommandationSchema), recommandationController.validerRecommandation);

// Suppression de la recommandation (accessible par l'auteur ou l'admin dans le controller)
router.delete('/:id', recommandationController.supprimerRecommandation);

// --- ROUTES ADMIN ---
router.get('/', requireRole('ADMINISTRATEUR'), recommandationController.recupererRecommandations);
router.get('/:id', requireRole('ADMINISTRATEUR'), recommandationController.recupererRecommandationParId);


export default router;
