import express from 'express';

import { 
  afficherProfessionnelEnAttente,
  validerProfessionnel,
} from '../Controllers/professionnelController.js';
import { requireRole } from '../Middlewars/roles.middleware.js';

const router = express.Router();

router.get("/en-attente", requireRole('ADMINISTRATEUR'), afficherProfessionnelEnAttente);

router.patch("/:id/valider",requireRole('ADMINISTRATEUR'),validerProfessionnel);


export default router;
