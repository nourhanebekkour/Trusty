import express from 'express';
import { createOrUpdateProfile, obtenirProfilParId, obtenirTousLesProfils, uploadAvatar } from '../Controllers/professeurController.js';
import upload from '../Middlewars/uploadMiddleware.js';
import { requireRole, requireOwnerOrAdmin } from '../Middlewars/roles.middleware.js';

const router = express.Router();

router.get('/', requireRole('ADMINISTRATEUR'), obtenirTousLesProfils);
router.get('/:id', requireOwnerOrAdmin('id'), obtenirProfilParId);

router.put('/:id', requireOwnerOrAdmin('id'), createOrUpdateProfile);
router.post('/:id/avatar', requireOwnerOrAdmin('id'), upload.single('fichier'), uploadAvatar);

export default router;
