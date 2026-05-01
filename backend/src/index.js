// Point d'entrée du serveur
// Premier fichier exécuté au démarrage
import 'dotenv/config'; // charge le .env automatiquement

import authRoutes from './Routes/auth.routes.js';



// Middleware global : permet de lire le body JSON
// Sans ça, req.body sera undefined dans les controllers


// Brancher les routes auth sur /api/auth
// Ex: /register devient /api/auth/register
app.use('/api/auth', authRoutes);



import formationRoutes from './Routes/formationRoutes.js';
import competenceRoutes from './Routes/competenceRoutes.js';
import etudiantRoutes from './Routes/etudiantRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/formations', formationRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/api/etudiants', etudiantRoutes);

const PORT = process.env.PORT || 3000;
import express from "express";
import professeurRoutes from "./Routes/professeurRoute.js";
import adminRoutes from "./Routes/administrateurRoutes.js";

const app = express();
const PORT = 3000;

// Routes
app.use("/api/professeur", professeurRoutes);
app.use("/api/admin", adminRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});