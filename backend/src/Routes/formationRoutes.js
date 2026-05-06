import express from 'express';
import {
    obtenirFormations,
    ajouterFormation,
    mettreAJourFormation,
    supprimerFormation
} from '../Controllers/formationController.js';
import { authMiddleware } from '../Middlewars/auth.middleware.js';

const router = express.Router();

// Toutes les routes de formation nécessitent d'être connecté
router.use(authMiddleware);

router.get('/etudiant/:id_etudiant', obtenirFormations);
router.post('/etudiant/:id_etudiant', ajouterFormation);
router.put('/:id', mettreAJourFormation);
router.delete('/:id', supprimerFormation);

export default router;
