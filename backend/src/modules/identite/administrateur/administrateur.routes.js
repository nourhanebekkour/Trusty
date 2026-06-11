import express from 'express';
import { createOrUpdateProfile, getProfileByID, getProfiles, uploadAvatar } from './administrateur.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const router = express.Router();

// Appliquer requireRole('ADMINISTRATEUR') à toutes les routes de ce fichier
router.use(requireRole('ADMINISTRATEUR'));

router.get('/', getProfiles);
router.get('/:id', getProfileByID);
router.put('/:id', createOrUpdateProfile);
router.post('/:id/avatar', upload.single('fichier'), uploadAvatar);

export default router;

