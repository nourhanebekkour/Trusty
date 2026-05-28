import express from 'express';
import * as activiteController from './activiteParascolaire.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireOwnerOrAdmin ,requireRole} from '#Middlewares/roles.middleware.js';

const routeur = express.Router();

// Routes pour les activités 
routeur.post('/etudiant/:id_etudiant', requireOwnerOrAdmin('id_etudiant'), activiteController.creerActivite);
routeur.get('/', requireRole('ADMINISTRATEUR'), activiteController.listerActivites);
routeur.get('/etudiant/:id_etudiant',  activiteController.listerActivitesParEtudiant);
routeur.get('/a-valider', requireRole('ADMINISTRATEUR'), activiteController.listerActivitesAValider);
routeur.get('/:id', activiteController.obtenirActivite);
routeur.put('/:id', activiteController.modifierActivite);
routeur.delete('/:id', activiteController.supprimerActivite);

// Route de validation (Admin uniquement)
routeur.post('/:id/valider', requireRole('ADMINISTRATEUR'), activiteController.validerActivite);

// Routes pour l'attestation
routeur.post('/:id/attestation', upload.single('fichier'), activiteController.uploadAttestation);
routeur.delete('/:id/attestation', activiteController.supprimerAttestation);

export default routeur;
