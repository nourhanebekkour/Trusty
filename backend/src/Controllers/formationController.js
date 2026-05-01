import * as formationService from '../Services/formationService.js';
import sendResponse from '../Utils/responseHandler.js';

export const obtenirFormations = async (req, res) => {
    // #swagger.tags = ['Formations']
    // #swagger.summary = 'Récupérer les formations d\'un étudiant'
    try {
        const { id_etudiant } = req.params;
        const formations = await formationService.recupererFormationsParEtudiant(id_etudiant);
        return sendResponse(res, 200, true, "Formations récupérées avec succès", formations);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des formations", null, erreur);
    }
};

export const ajouterFormation = async (req, res) => {
    // #swagger.tags = ['Formations']
    // #swagger.summary = 'Ajouter une formation à un étudiant'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données de la formation',
        required: true,
        schema: { $ref: '#/definitions/FormationRequest' }
    } */
    try {
        const { id_etudiant } = req.params;
        const nouvelleFormation = await formationService.ajouterFormation(id_etudiant, req.body);
        return sendResponse(res, 201, true, "Formation ajoutée avec succès", nouvelleFormation);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de l'ajout de la formation", null, erreur);
    }
};

export const mettreAJourFormation = async (req, res) => {
    // #swagger.tags = ['Formations']
    // #swagger.summary = 'Modifier une formation'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données de la formation à modifier',
        required: true,
        schema: { $ref: '#/definitions/FormationRequest' }
    } */
    try {
        const { id } = req.params;
        const formationModifiee = await formationService.modifierFormation(id, req.body);
        return sendResponse(res, 200, true, "Formation modifiée avec succès", formationModifiee);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la modification", null, erreur);
    }
};

export const supprimerFormation = async (req, res) => {
    // #swagger.tags = ['Formations']
    // #swagger.summary = 'Supprimer une formation'
    try {
        const { id } = req.params;
        await formationService.supprimerFormation(id);
        return sendResponse(res, 200, true, "Formation supprimée avec succès");
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la suppression", null, erreur);
    }
};
