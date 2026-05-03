import express from 'express';
import apiRouter from './Routes/index.js';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger-output.json');

const app = express();

// Middlewares de base
app.use(express.json());

// Point d'entrée unique pour toutes les routes de l'API
app.use('/api', apiRouter);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
