import express from 'express';
import * as projetController from './projet.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const routeur = express.Router();

// Routes pour les projets
routeur.post('/', projetController.creerProjet);
routeur.get('/', projetController.listerProjets);
routeur.get('/a-valider', requireRole('PROFESSEUR'), projetController.listerProjetsAValider);
routeur.get('/etudiant/:id_etudiant', projetController.listerProjetsParEtudiant);
routeur.get('/:id', projetController.obtenirProjet);
routeur.put('/:id', projetController.modifierProjet);
routeur.delete('/:id', projetController.supprimerProjet);

// Route de validation (Professeur uniquement)
routeur.post('/:id/valider', requireRole('PROFESSEUR'), projetController.validerProjet);

// Routes pour les fichiers du projet
routeur.post('/:id/fichiers', upload.single('fichier'), projetController.ajouterFichierAuProjet);
routeur.get('/:id/fichiers', projetController.listerFichiersDuProjet);
routeur.delete('/:id/fichiers/:id_fichier', projetController.supprimerFichierDuProjet);

// Routes pour les participations au projet
routeur.post('/:id_projet/participants/:id_etudiant', projetController.ajouterParticipant);
routeur.put('/:id_projet/participants/:id_etudiant' , projetController.modifierParticipant);
routeur.delete('/:id_projet/participants/:id_etudiant', projetController.retirerParticipant);

// Routes pour les technologies du projet
routeur.post('/:id_projet/technologies/:id_technologie', projetController.ajouterTechnologie);
routeur.put('/:id_projet/technologies/:id_technologie', projetController.modifierTechnologie);
routeur.delete('/:id_projet/technologies/:id_technologie', projetController.retirerTechnologie);

export default routeur;
