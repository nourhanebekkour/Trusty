import express from 'express';
import { 
    obtenirTousLesProfils, 
    obtenirProfilParId, 
    traiterProfil,
} from '../controllers/etudiantController.js';

const routeur = express.Router();

routeur.get('/', obtenirTousLesProfils);
routeur.get('/:id', obtenirProfilParId);
routeur.put('/:id', traiterProfil);

export default routeur;