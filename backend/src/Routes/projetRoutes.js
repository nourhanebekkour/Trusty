import express from 'express';
import * as  projetController from '../Controllers/projetController.js';

const routeur = express.Router();

// Routes pour les projets
routeur.post('/', projetController.creerProjet);
routeur.get('/', projetController.listerProjets);
routeur.get('/:id', projetController.obtenirProjet);
routeur.put('/:id', projetController.modifierProjet);
routeur.delete('/:id', projetController.supprimerProjet);

// Routes pour les participations au projet
routeur.post('/:id_projet/participants/:id_etudiant', projetController.ajouterParticipant);
routeur.put('/:id_projet/participants/:id_etudiant', projetController.modifierParticipant);
routeur.delete('/:id_projet/participants/:id_etudiant', projetController.retirerParticipant);

// Routes pour les technologies du projet
routeur.post('/:id_projet/technologies/:id_technologie', projetController.ajouterTechnologie);
routeur.put('/:id_projet/technologies/:id_technologie', projetController.modifierTechnologie);
routeur.delete('/:id_projet/technologies/:id_technologie', projetController.retirerTechnologie);

export default routeur;
