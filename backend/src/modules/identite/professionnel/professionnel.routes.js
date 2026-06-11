import express from 'express';

import { 
  afficherProfessionnelEnAttente,
  validerProfessionnel,
} from './professionnel.controller.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const router = express.Router();

router.get("/en-attente", requireRole('ADMINISTRATEUR'), afficherProfessionnelEnAttente);

router.patch("/:id/valider",requireRole('ADMINISTRATEUR'),validerProfessionnel);


export default router;
