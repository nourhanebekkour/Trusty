// Point d'entrée du serveur
// Premier fichier exécuté au démarrage
import { Router } from 'express';

import authRoutes from './auth.routes.js';
import utilisateurRoutes from './utilisateurRoutes.js';
import fileRoutes from './fileRoutes.js';
import formationRoutes from './formationRoutes.js';
import competenceRoutes from './competenceRoutes.js';
import etudiantRoutes from './etudiantRoutes.js';
import professeurRoutes from "./professeurRoutes.js";
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from "./administrateurRoutes.js";
import professionnelRoutes from "./professionnelRoutes.js"
import technologieRoutes from "./technologieRoutes.js";
import projetRoutes from "./projetRoutes.js";
import stageRoutes from "./stageRoutes.js";
import activiteParascolaireRoutes from "./activiteParascolaireRoutes.js";
import historiqueActionRoutes from "./historiqueActionRoutes.js";
import { authMiddleware } from '../Middlewars/auth.middleware.js';


// Middleware global : permet de lire le body JSON
// Sans ça, req.body sera undefined dans les controllers

const router = Router();

// Brancher les routes auth sur /api/auth
// Ex: /register devient /api/auth/register
router.use('/auth', authRoutes);


router.use(authMiddleware);
router.use('/utilisateurs', utilisateurRoutes);
router.use('/files', fileRoutes);
router.use('/formations', formationRoutes);
router.use('/competences', competenceRoutes);
router.use('/technologies', technologieRoutes);
router.use('/projets', projetRoutes);
router.use('/stages', stageRoutes);
router.use('/activites', activiteParascolaireRoutes);
router.use('/notifications', notificationRoutes);
router.use('/historique-actions', historiqueActionRoutes);


router.use('/etudiants', etudiantRoutes);
router.use("/professeurs", professeurRoutes);
router.use("/administrateurs", adminRoutes);
router.use("/professionnels", professionnelRoutes);

export default router;