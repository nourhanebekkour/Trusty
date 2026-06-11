import express from 'express';
import {
    listerTechnologies,
    obtenirTechnologie,
    ajouterTechnologie,
    modifierTechnologie,
    supprimerTechnologie
} from './technologie.controller.js';
import { requireRole } from '#Middlewares/roles.middleware.js';

const router = express.Router();

router.get('/', listerTechnologies);
router.get('/:id', obtenirTechnologie);

router.use(requireRole('ADMINISTRATEUR'));
router.post('/', ajouterTechnologie);
router.put('/:id', modifierTechnologie);
router.delete('/:id', supprimerTechnologie);

export default router;