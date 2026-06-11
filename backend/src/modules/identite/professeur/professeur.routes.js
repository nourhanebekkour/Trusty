import express from 'express';
import { createOrUpdateProfile, obtenirProfilParId, obtenirTousLesProfils, uploadAvatar, obtenirProfesseursParFiliere, obtenirProfesseursParEcole } from './professeur.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireRole, requireOwnerOrAdmin } from '#Middlewares/roles.middleware.js';

const router = express.Router();

router.get('/', requireRole('ADMINISTRATEUR'), obtenirTousLesProfils);
router.get('/filiere/:filiere', obtenirProfesseursParFiliere);
router.get('/ecole/:ecole', obtenirProfesseursParEcole);
router.get('/:id', requireOwnerOrAdmin('id'), obtenirProfilParId);

router.put('/:id', requireOwnerOrAdmin('id'), createOrUpdateProfile);
router.post('/:id/avatar', requireOwnerOrAdmin('id'), upload.single('fichier'), uploadAvatar);

export default router;
