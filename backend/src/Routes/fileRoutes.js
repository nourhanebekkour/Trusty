import { Router } from 'express';
import * as fileController from '../Controllers/fileController.js';
import upload from '../Middlewars/uploadMiddleware.js';

const router = Router();

// Route pour l'upload d'un fichier
router.post('/upload', upload.single('fichier'), fileController.uploadFile);

// Route pour obtenir l'URL d'un fichier et REDIRIGER (affichage direct dans le navigateur)
router.get('/url/:fileName', fileController.getFileUrl);

// Route pour afficher/streamer le fichier directement (URL backend conservée)
router.get('/view/:fileName', fileController.viewFile);

// Route pour supprimer un fichier via son ID en base de données
router.delete('/:id', fileController.deleteFile);

export default router;
