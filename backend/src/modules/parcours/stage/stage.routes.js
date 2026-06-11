import express from 'express';
import * as stageController from './stage.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireOwnerOrAdmin, requireRole } from '#Middlewares/roles.middleware.js';

const routeur = express.Router();

// Routes pour les stages
routeur.post('/etudiant/:id_etudiant', requireOwnerOrAdmin('id_etudiant'), stageController.creerStage);
routeur.get('/', stageController.listerStages);
routeur.get('/etudiant/:id_etudiant', stageController.listerStagesParEtudiant);
routeur.get('/a-valider', requireRole('PROFESSEUR'), stageController.listerStagesAValider);
routeur.get('/:id', stageController.obtenirStage);
routeur.put('/:id', stageController.modifierStage);
routeur.delete('/:id', stageController.supprimerStage);

// Route de validation (Professeur uniquement)
routeur.post('/:id/valider', requireRole('PROFESSEUR'), stageController.validerStage);

// Routes pour l'upload et suppression du rapport
routeur.post('/:id/rapport', upload.single('fichier'), stageController.uploadRapport);
routeur.delete('/:id/rapport', stageController.supprimerRapport);

// Routes pour les technologies du stage
routeur.post('/:id_stage/technologies/:id_technologie', stageController.ajouterTechnologie);
routeur.put('/:id_stage/technologies/:id_technologie', stageController.modifierTechnologie);
routeur.delete('/:id_stage/technologies/:id_technologie', stageController.retirerTechnologie);

export default routeur;