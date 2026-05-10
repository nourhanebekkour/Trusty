import express from 'express';
import * as activiteController from '../Controllers/activiteParascolaireController.js';
import upload from '../Middlewars/uploadMiddleware.js';
import { requireOwnerOrAdmin ,requireRole} from '../Middlewars/roles.middleware.js';

const routeur = express.Router();

// Routes pour les activités 
routeur.post('/etudiant/:id_etudiant', requireOwnerOrAdmin('id_etudiant'), activiteController.creerActivite);
routeur.get('/', requireRole('ADMINISTRATEUR'), activiteController.listerActivites);
routeur.get('/etudiant/:id_etudiant',  activiteController.listerActivitesParEtudiant);
routeur.get('/:id', activiteController.obtenirActivite);
routeur.put('/:id', activiteController.modifierActivite);
routeur.delete('/:id', activiteController.supprimerActivite);

// Routes pour l'attestation
routeur.post('/:id/attestation', upload.single('fichier'), activiteController.uploadAttestation);
routeur.delete('/:id/attestation', activiteController.supprimerAttestation);

export default routeur;
