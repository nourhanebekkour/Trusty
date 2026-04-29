import express from 'express';
import {
    listerCompetences,
    recupererCompetence,
    modifierCompetence,
    ajouterCompetence,
    supprimerCompetence,
    listerCompetencesEtudiant,
    associerCompetence,
    detacherCompetence
} from '../Controllers/competenceController.js';

const routeur = express.Router();

// Routes pour le catalogue des compétences

routeur.get('/', listerCompetences);
routeur.get('/:id', recupererCompetence);
routeur.post('/', ajouterCompetence);
routeur.put('/:id', modifierCompetence);
routeur.delete('/:id', supprimerCompetence);

// Routes pour les compétences spécifiques d'un étudiant
routeur.get('/etudiant/:id_etudiant', listerCompetencesEtudiant);
routeur.post('/etudiant/:id_etudiant/:id_competence', associerCompetence);
routeur.delete('/etudiant/:id_etudiant/:id_competence', detacherCompetence);

export default routeur;
