// Point d'entrée du serveur
// Premier fichier exécuté au démarrage
import 'dotenv/config'; // charge le .env automatiquement
import express from "express";

import authRoutes from './Routes/auth.routes.js';
import formationRoutes from './Routes/formationRoutes.js';
import competenceRoutes from './Routes/competenceRoutes.js';
import etudiantRoutes from './Routes/etudiantRoutes.js';
import professeurRoutes from "./Routes/professeurRoute.js";
import adminRoutes from "./Routes/administrateurRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global : permet de lire le body JSON
// Sans ça, req.body sera undefined dans les controllers
app.use(express.json());

// Brancher les routes auth sur /api/auth
// Ex: /register devient /api/auth/register
app.use('/api/auth', authRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/api/etudiants', etudiantRoutes);

// Routes
app.use("/api/professeur", professeurRoutes);
app.use("/api/admin", adminRoutes);

// Ne pas lancer le serveur en mode test (pour les tests d'intégration Supertest)
if (process.env.NODE_ENV !== 'test') {
  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

// Export de l'app pour les tests d'intégration (Supertest)
export default app;
