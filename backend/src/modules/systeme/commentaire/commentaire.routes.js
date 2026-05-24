import { Router } from 'express';
import * as commentaireController from './commentaire.controller.js';
import { requireRole, requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';
import validate from '#Middlewares/validate.middleware.js';
import { commentaireSchema, validationCommentaireSchema } from './commentaire.validator.js';

const router = Router();

// --- ROUTES PUBLIQUES (Commentaires validés) ---
router.get('/public/projet/:id_projet', commentaireController.recupererCommentairesProjetValidees);
router.get('/public/etudiant/:id_etudiant', commentaireController.recupererCommentairesProfilValidees);

// --- ROUTES ÉTUDIANT (Commentaires reçus, validés ou non) ---
router.get('/mes-commentaires-recus', commentaireController.recupererMesCommentairesRecus);

// --- ROUTES PRIVÉES / GESTION ---
router.post('/', validate(commentaireSchema), commentaireController.creerCommentaire);

// Validation du commentaire (accessible par l'étudiant cible ou admin dans le controller)
router.patch('/:id/valider', validate(validationCommentaireSchema), commentaireController.validerCommentaire);

// Suppression du commentaire (accessible par l'auteur ou l'admin dans le controller)
router.delete('/:id', commentaireController.supprimerCommentaire);

// --- ROUTES ADMIN ---
router.get('/', requireRole('ADMINISTRATEUR'), commentaireController.recupererCommentaires);
router.get('/:id', requireRole('ADMINISTRATEUR'), commentaireController.recupererCommentaireParId);

// Anciennes routes conservées pour compatibilité si nécessaire
router.get('/projet/:id_projet', commentaireController.recupererCommentairesProjet);
router.get('/etudiant/:id_etudiant', requireOwnerOrAdmin('id_etudiant'), commentaireController.recupererCommentairesProfil);

export default router;
