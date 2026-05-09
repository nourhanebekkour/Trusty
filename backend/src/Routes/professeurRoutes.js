import express from 'express';
import { 
    createOrUpdateProfile,
    obtenirProfilParId,
    obtenirTousLesProfils,
} from '../Controllers/professeurController.js';

const router = express.Router();


router.get("/",  obtenirTousLesProfils);
router.get("/:id", obtenirProfilParId);

router.put("/:id", createOrUpdateProfile);

export default router;
