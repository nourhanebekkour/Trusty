import * as lettreService from './lettre.service.js';
import sendResponse from '#Utils/response.handler.js';

export const demanderLettre = async (req, res) => {
    // #swagger.tags = ['Lettres de Recommandation']
    // #swagger.summary = 'Faire une demande de lettre de recommandation (Etudiant)'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations sur la demande (id_professeur, type_lettre, destinataire, description)',
        required: true,
        schema: {
            $id_professeur: 'string',
            $type_lettre: 'STAGE',
            $destinataire: 'Entreprise XYZ',
            description: 'Demande pour mon stage de fin d\'études'
        }
    } */
    try {
        const id_etudiant = req.user.id;
        const resultat = await lettreService.demanderLettre(id_etudiant, req.body);
        return sendResponse(res, 200, true, resultat.message);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la demande de lettre", null, erreur.message);
    }
};

export const creerLettre = async (req, res) => {
    // #swagger.tags = ['Lettres de Recommandation']
    // #swagger.summary = 'Rédiger et uploader une lettre de recommandation (Professeur)'
    // #swagger.consumes = ['multipart/form-data']
    /* #swagger.parameters['id_etudiant'] = {
        in: 'formData',
        type: 'string',
        required: true,
        description: 'ID de l\'étudiant concerné'
    } */
    /* #swagger.parameters['type_lettre'] = {
        in: 'formData',
        type: 'string',
        required: true,
        description: 'Type de lettre (ex: STAGE, PFE)'
    } */
    /* #swagger.parameters['destinataire'] = {
        in: 'formData',
        type: 'string',
        required: true,
        description: 'Destinataire de la lettre'
    } */
    /* #swagger.parameters['description'] = {
        in: 'formData',
        type: 'string',
        description: 'Description de la lettre'
    } */
    /* #swagger.parameters['fichier'] = {
        in: 'formData',
        type: 'file',
        required: true,
        description: 'Fichier PDF de la lettre',
    } */
    try {
        const id_redacteur = req.user.id;
        const { id_etudiant, ...donnees } = req.body;
        
        if (!req.file) {
            return sendResponse(res, 400, false, "Le fichier de la lettre (PDF) est requis");
        }

        const lettre = await lettreService.creerLettre(id_redacteur, id_etudiant, donnees, req.file);
        return sendResponse(res, 201, true, "Lettre de recommandation créée avec succès", lettre);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la création de la lettre", null, erreur.message);
    }
};

export const listerLettresRecues = async (req, res) => {
    // #swagger.tags = ['Lettres de Recommandation']
    // #swagger.summary = 'Lister toutes les lettres reçues (Etudiant)'
    try {
        const id_etudiant = req.user.id;
        const lettres = await lettreService.recupererLettresRecues(id_etudiant);
        return sendResponse(res, 200, true, "Lettres reçues récupérées avec succès", lettres);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des lettres reçues", null, erreur.message);
    }
};

export const listerLettresEmises = async (req, res) => {
    // #swagger.tags = ['Lettres de Recommandation']
    // #swagger.summary = 'Lister toutes les lettres émises (Professeur)'
    try {
        const id_redacteur = req.user.id;
        const lettres = await lettreService.recupererLettresEmises(id_redacteur);
        return sendResponse(res, 200, true, "Lettres émises récupérées avec succès", lettres);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des lettres émises", null, erreur.message);
    }
};
