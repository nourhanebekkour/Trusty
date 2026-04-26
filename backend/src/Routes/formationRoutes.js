import express from 'express';
import {
    obtenirFormations,
    ajouterFormation,
    mettreAJourFormation,
    supprimerFormation
} from '../Controllers/formationController.js';

const routeur = express.Router();


routeur.get('/etudiant/:id_etudiant', obtenirFormations);
routeur.post('/etudiant/:id_etudiant', ajouterFormation);
routeur.put('/:id', mettreAJourFormation);
routeur.delete('/:id', supprimerFormation);

export default routeur;
