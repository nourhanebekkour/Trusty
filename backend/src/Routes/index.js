// Point d'entrée du serveur
// Premier fichier exécuté au démarrage
import { Router } from 'express';

import authRoutes from './auth.routes.js';
import formationRoutes from './formationRoutes.js';
import competenceRoutes from './competenceRoutes.js';
import etudiantRoutes from './etudiantRoutes.js';
import professeurRoutes from "./professeurRoutes.js";
import adminRoutes from "./administrateurRoutes.js";
import professionnelRoutes from "./professionnelRoutes.js"
import technologieRoutes from "./technologieRoutes.js";
import projetRoutes from "./projetRoutes.js";
import stageRoutes from "./stageRoutes.js";
import activiteParascolaireRoutes from "./activiteParascolaireRoutes.js";
import { authMiddleware } from '../Middlewars/auth.middleware.js';


// Middleware global : permet de lire le body JSON
// Sans ça, req.body sera undefined dans les controllers

const router = Router();

// Brancher les routes auth sur /api/auth
// Ex: /register devient /api/auth/register
router.use('/auth', authRoutes);


router.use(authMiddleware);
router.use('/formations', formationRoutes);
router.use('/competences', competenceRoutes);
router.use('/technologies', technologieRoutes);
router.use('/projets', projetRoutes);
router.use('/stages', stageRoutes);
router.use('/activites', activiteParascolaireRoutes);


router.use('/etudiants', etudiantRoutes);
router.use("/professeur", professeurRoutes);
router.use("/admin", adminRoutes);
router.use("/professionnel",professionnelRoutes);

export default router;