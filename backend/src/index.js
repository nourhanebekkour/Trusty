import express from 'express';
import formationRoutes from './Routes/formationRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/formations', formationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});