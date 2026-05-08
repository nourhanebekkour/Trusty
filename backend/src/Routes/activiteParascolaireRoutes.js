import express from 'express';
import * as activiteController from '../Controllers/activiteParascolaireController.js';

const routeur = express.Router();

// Routes pour les activités 
routeur.post('/', activiteController.creerActivite);
routeur.get('/', activiteController.listerActivites);
routeur.get('/etudiant/:id_etudiant', activiteController.listerActivitesParEtudiant);
routeur.get('/:id', activiteController.obtenirActivite);
routeur.put('/:id', activiteController.modifierActivite);
routeur.delete('/:id', activiteController.supprimerActivite);

export default routeur;

// on met /etudiant/:id_etudiant avant /:id pour éviter le conflit de routes.
