import express from 'express';
import { 
    obtenirTousLesProfils, 
    obtenirProfilParId, 
    traiterProfil,
    uploadAvatar
} from './etudiant.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireRole, requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';

const router = express.Router();


router.get('/', requireRole('ADMINISTRATEUR'), obtenirTousLesProfils);
router.get('/:id', requireOwnerOrAdmin('id'), obtenirProfilParId);

router.put('/:id', requireOwnerOrAdmin('id'), traiterProfil);
router.post('/:id/avatar', requireOwnerOrAdmin('id'), upload.single('fichier'), uploadAvatar);

export default router;
