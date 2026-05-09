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
import { requireRole, requireOwnerOrAdmin } from '../Middlewars/roles.middleware.js';

const router = express.Router();


router.get('/', listerCompetences);
router.get('/:id', recupererCompetence);

router.post('/', requireRole('ADMINISTRATEUR'),ajouterCompetence);
router.put('/:id', requireRole('ADMINISTRATEUR'),modifierCompetence);
router.delete('/:id', requireRole('ADMINISTRATEUR'), supprimerCompetence);

// --- COMPÉTENCES ÉTUDIANT (Auth requis) ---

router.get('/etudiant/:id_etudiant', listerCompetencesEtudiant);
router.post('/etudiant/:id_etudiant/:id_competence', requireOwnerOrAdmin('id_etudiant'), associerCompetence);
router.delete('/etudiant/:id_etudiant/:id_competence', requireOwnerOrAdmin('id_etudiant'), detacherCompetence);

export default router;
