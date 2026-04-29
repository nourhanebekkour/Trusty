// Point d'entrée du serveur
// Premier fichier exécuté au démarrage
import 'dotenv/config'; // charge le .env automatiquement
import express from 'express';
import authRoutes from './Routes/auth.routes.js';

const app = express();

// Middleware global : permet de lire le body JSON
// Sans ça, req.body sera undefined dans les controllers
app.use(express.json());

// Brancher les routes auth sur /api/auth
// Ex: /register devient /api/auth/register
app.use('/api/auth', authRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});