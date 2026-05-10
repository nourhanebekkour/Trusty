import express from 'express';
import { createOrUpdateProfile, getProfileByID, getProfiles, uploadAvatar } from '../Controllers/administrateurController.js';
import upload from '../Middlewars/uploadMiddleware.js';
import { requireRole } from '../Middlewars/roles.middleware.js';

const router = express.Router();

// Appliquer requireRole('ADMINISTRATEUR') à toutes les routes de ce fichier
router.use(requireRole('ADMINISTRATEUR'));

router.get('/', getProfiles);
router.get('/:id', getProfileByID);
router.put('/:id', createOrUpdateProfile);
router.post('/:id/avatar', upload.single('fichier'), uploadAvatar);

export default router;

