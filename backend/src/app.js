import '#Config/env.js';
import express from 'express';
import apiRouter from './modules/index.js';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger-output.json');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true        // ← manquant
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// Point d'entrée unique pour toutes les routes de l'API
app.use('/api', apiRouter);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;