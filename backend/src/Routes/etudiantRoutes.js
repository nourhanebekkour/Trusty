import express from 'express';
import { 
    obtenirTousLesProfils, 
    obtenirProfilParId, 
    traiterProfil,
} from '../Controllers/etudiantController.js';
import { authMiddleware } from '../Middlewars/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Tout le monde peut voir les profils (selon visibilité, mais ici on protège au moins la modif)
router.get('/',obtenirTousLesProfils);
router.get('/:id',obtenirProfilParId);

// Seul l'utilisateur connecté peut modifier son profil (ou un admin)
// Pour l'instant on protège juste avec authMiddleware
router.put('/:id',traiterProfil);

export default router;
