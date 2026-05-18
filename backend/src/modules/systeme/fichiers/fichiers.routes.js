import { Router } from 'express';
import * as fichiersController from './fichiers.controller.js';
import upload from '#Middlewares/upload.middleware.js';

const router = Router();

// Route pour l'upload d'un fichier
router.post('/upload', upload.single('fichier'), fichiersController.uploadFile);

// Route pour obtenir l'URL d'un fichier et REDIRIGER (affichage direct dans le navigateur)
router.get('/url/:fileName', fichiersController.getFileUrl);

// Route pour afficher/streamer le fichier directement (URL backend conservée)
router.get('/view/:fileName', fichiersController.viewFile);

// Route pour supprimer un fichier via son ID en base de données
router.delete('/:id', fichiersController.deleteFile);

export default router;
