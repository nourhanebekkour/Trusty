import express from 'express';
import { 
    createOrUpdateProfile,
    obtenirProfilParId,
    obtenirTousLesProfils,
} from '../Controllers/professeurController.js';
import { authMiddleware } from '../Middlewars/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Routes publiques ou avec auth de base
router.get("/",  obtenirTousLesProfils);
router.get("/:id", obtenirProfilParId);

// Routes protégées : Seul l'admin ou le professeur concerné peut modifier/supprimer
router.put("/:id", createOrUpdateProfile);

export default router;
