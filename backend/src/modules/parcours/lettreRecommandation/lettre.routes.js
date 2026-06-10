import express from 'express';
import * as lettreController from './lettre.controller.js';
import upload from '#Middlewares/upload.middleware.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const router = express.Router();

// Route pour l'Étudiant (demander une lettre)
router.post('/demander', requireRole('ETUDIANT'), lettreController.demanderLettre);

// Route pour l'Étudiant (voir les lettres reçues)
router.get('/recues', requireRole('ETUDIANT'), lettreController.listerLettresRecues);

// Route pour le Professeur (créer/uploader une lettre)
router.post('/', requireRole('PROFESSEUR'), upload.single('fichier'), lettreController.creerLettre);

// Route pour le Professeur (voir les lettres émises)
router.get('/emises', requireRole('PROFESSEUR'), lettreController.listerLettresEmises);

export default router;
