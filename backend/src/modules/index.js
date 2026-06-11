// Point d'entrée du serveur
// Premier fichier exécuté au démarrage
import { Router } from 'express';

import authentificationRoutes from './identite/authentification/authentification.routes.js';
import utilisateurRoutes from './identite/utilisateur/utilisateur.routes.js';
import fichiersRoutes from './systeme/fichiers/fichiers.routes.js';
import formationRoutes from './cursus/formation/formation.routes.js';
import competenceRoutes from './cursus/competence/competence.routes.js';
import etudiantRoutes from './identite/etudiant/etudiant.routes.js';
import professeurRoutes from "./identite/professeur/professeur.routes.js";
import notificationsRoutes from './systeme/notifications/notifications.routes.js';
import adminRoutes from "./identite/administrateur/administrateur.routes.js";
import professionnelRoutes from "./identite/professionnel/professionnel.routes.js"
import technologieRoutes from "./cursus/technologie/technologie.routes.js";
import projetRoutes from "./parcours/projet/projet.routes.js";
import stageRoutes from "./parcours/stage/stage.routes.js";
import activiteParascolaireRoutes from "./parcours/activiteParascolaire/activiteParascolaire.routes.js";
import lettreRecommandationRoutes from "./parcours/lettreRecommandation/lettre.routes.js";
import historiqueActionRoutes from "./systeme/historiqueAction/historiqueAction.routes.js";
import badgesRoutes from "./cursus/badges/badges.routes.js";
import commentaireRoutes from "./systeme/commentaire/commentaire.routes.js";
import recommandationRoutes from "./systeme/recommandation/recommandation.routes.js";
import portfolioRoutes from "./portfolio/portfolio.routes.js";
import { authMiddleware } from '#Middlewares/auth.middleware.js';


// Middleware global : permet de lire le body JSON
// Sans ça, req.body sera undefined dans les controllers

const router = Router();

// Brancher les routes auth sur /api/auth
// Ex: /register devient /api/auth/register
router.use('/auth', authentificationRoutes);
router.use('/portfolio', portfolioRoutes);


router.use(authMiddleware);
router.use('/utilisateurs', utilisateurRoutes);
router.use('/files', fichiersRoutes);
router.use('/formations', formationRoutes);
router.use('/competences', competenceRoutes);
router.use('/technologies', technologieRoutes);
router.use('/projets', projetRoutes);
router.use('/stages', stageRoutes);
router.use('/activites', activiteParascolaireRoutes);
router.use('/lettres-recommandation', lettreRecommandationRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/historique-actions', historiqueActionRoutes);
router.use('/badges', badgesRoutes);
router.use('/commentaires', commentaireRoutes);
router.use('/recommandations', recommandationRoutes);


router.use('/etudiants', etudiantRoutes);
router.use("/professeurs", professeurRoutes);
router.use("/administrateurs", adminRoutes);
router.use("/professionnels", professionnelRoutes);

export default router;
