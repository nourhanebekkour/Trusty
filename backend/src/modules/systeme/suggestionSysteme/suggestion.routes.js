import express from 'express';
import * as suggestionController from './suggestion.controller.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const routeur = express.Router();

// L'utilisateur doit être authentifié (le routeur parent gère authMiddleware) 
// et avoir le rôle ETUDIANT
routeur.post('/generer', requireRole('ETUDIANT'), suggestionController.genererSuggestion);
routeur.get('/', requireRole('ETUDIANT'), suggestionController.listerSuggestions);
routeur.patch('/:id/lu', requireRole('ETUDIANT'), suggestionController.marquerLue);

export default routeur;
