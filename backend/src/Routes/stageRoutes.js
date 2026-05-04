import express from 'express';
import * as stageController from '../Controllers/stageController.js';

const routeur = express.Router();

// Routes pour les stages
routeur.post('/', stageController.creerStage);
routeur.get('/', stageController.listerStages);
routeur.get('/etudiant/:id_etudiant', stageController.listerStagesParEtudiant);
routeur.get('/:id', stageController.obtenirStage);
routeur.put('/:id', stageController.modifierStage);
routeur.delete('/:id', stageController.supprimerStage);

// Routes pour les technologies du stage
routeur.post('/:id_stage/technologies/:id_technologie', stageController.ajouterTechnologie);
routeur.put('/:id_stage/technologies/:id_technologie', stageController.modifierTechnologie);
routeur.delete('/:id_stage/technologies/:id_technologie', stageController.retirerTechnologie);

export default routeur;