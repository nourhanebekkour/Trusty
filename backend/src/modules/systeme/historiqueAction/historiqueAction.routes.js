import express from 'express';
import * as actionController from './historiqueAction.controller.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const routeur = express.Router();

// Admin seulement
routeur.get('/', requireRole('ADMINISTRATEUR'), actionController.listerActions);
routeur.get('/utilisateur/:id_utilisateur', requireRole('ADMINISTRATEUR'), actionController.listerActionsParUtilisateur);
// Étudiant: ses propres actions
routeur.get('/mes-actions', actionController.listerMesActions);
// admin
routeur.get('/:id', requireRole('ADMINISTRATEUR'), actionController.obtenirAction);



export default routeur;


// /mes-actions doit être before /:id
// sinon Express interprète "mes-actions" comme un :id et redirige vers obtenirAction au lieu de listerMesActions