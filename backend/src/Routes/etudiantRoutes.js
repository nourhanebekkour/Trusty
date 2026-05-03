import express from 'express';
import { 
    obtenirTousLesProfils, 
    obtenirProfilParId, 
    traiterProfil,
} from '../Controllers/etudiantController.js';

const router = express.Router();


router.get('/',obtenirTousLesProfils);
router.get('/:id',obtenirProfilParId);

router.put('/:id',traiterProfil);

export default router;
