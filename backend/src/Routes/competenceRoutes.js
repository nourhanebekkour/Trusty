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
import { authMiddleware } from '../Middlewars/auth.middleware.js';
import { requireRole } from '../Middlewars/roles.middleware.js';

const router = express.Router();

// --- CATALOGUE (Lecture pour tous les connectés, Ecriture pour ADMIN) ---

router.use(authMiddleware);

router.get('/', listerCompetences);
router.get('/:id', recupererCompetence);

router.post('/', requireRole('ADMINISTRATEUR'), ajouterCompetence);
router.put('/:id', requireRole('ADMINISTRATEUR'), modifierCompetence);
router.delete('/:id', requireRole('ADMINISTRATEUR'), supprimerCompetence);

// --- COMPÉTENCES ÉTUDIANT (Auth requis) ---

router.get('/etudiant/:id_etudiant', listerCompetencesEtudiant);
router.post('/etudiant/:id_etudiant/:id_competence', associerCompetence);
router.delete('/etudiant/:id_etudiant/:id_competence', detacherCompetence);

export default router;
