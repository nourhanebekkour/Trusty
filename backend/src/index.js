import express from 'express';
import formationRoutes from './Routes/formationRoutes.js';
import competenceRoutes from './Routes/competenceRoutes.js';
import etudiantRoutes from './Routes/etudiantRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/formations', formationRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/api/etudiants', etudiantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

import express from "express"
import professeurRoutes from "./Routes/professeurRoute.js"
app.use("/api/professeur", professeurRoutes)
import adminRoutes from "./Routes/administrateurRoutes.js"
app.use("/api/admin", adminRoutes)


app.listen(3000,() => {
  console.log("Server running on port 3000")
})

