import express from 'express';
import {
    obtenirFormations,
    ajouterFormation,
    mettreAJourFormation,
    supprimerFormation
} from './formation.controller.js';
import { requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';

const router = express.Router();


router.get('/etudiant/:id_etudiant', requireOwnerOrAdmin('id_etudiant'), obtenirFormations);
router.post('/etudiant/:id_etudiant', requireOwnerOrAdmin('id_etudiant'), ajouterFormation);
router.put('/:id', mettreAJourFormation);
router.delete('/:id', supprimerFormation);

export default router;
