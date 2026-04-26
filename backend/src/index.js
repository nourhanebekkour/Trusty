import express from 'express';
import competenceRoutes from './Routes/competenceRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/competences', competenceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});