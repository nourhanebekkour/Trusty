import express from 'express';
import {
    listerTechnologies,
    obtenirTechnologie,
    ajouterTechnologie,
    modifierTechnologie,
    supprimerTechnologie
} from '../Controllers/technologieController.js';
import { authMiddleware } from '../Middlewars/auth.middleware.js';
import { requireRole } from '../Middlewars/roles.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', listerTechnologies);
router.get('/:id', obtenirTechnologie);

router.use(requireRole('ADMINISTRATEUR'));
router.post('/', ajouterTechnologie);
router.put('/:id', modifierTechnologie);
router.delete('/:id', supprimerTechnologie);

export default router;