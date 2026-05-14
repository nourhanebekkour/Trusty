import { Router } from 'express';
import * as utilisateurController from './utilisateur.controller.js';
import { requireRole, requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';

const router = Router();

/**
 * Routes d'administration des utilisateurs
 */

// Récupérer tous les utilisateurs (Admin uniquement)
router.get('/', requireRole('ADMINISTRATEUR'), utilisateurController.obtenirTousLesUtilisateurs);

// Récupérer un utilisateur par ID (Admin ou propriétaire)
router.get('/:id', requireOwnerOrAdmin('id'), utilisateurController.obtenirUtilisateurParId);

// Modifier le rôle d'un utilisateur (Admin uniquement)
router.patch('/:id/role', requireRole('ADMINISTRATEUR'), utilisateurController.changerRole);

// Modifier le statut du compte (Admin uniquement)
router.patch('/:id/statut', requireRole('ADMINISTRATEUR'), utilisateurController.changerStatut);

// Supprimer un utilisateur (Admin uniquement)
router.delete('/:id', requireRole('ADMINISTRATEUR'), utilisateurController.supprimerUnUtilisateur);

export default router;
