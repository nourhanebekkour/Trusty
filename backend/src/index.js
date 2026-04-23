import express from 'express';
import etudiantRoutes from './routes/etudiantRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/etudiants', etudiantRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});