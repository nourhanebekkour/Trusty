import * as technologieService from './technologie.service.js';
import sendResponse from '#Utils/response.handler.js';

export const listerTechnologies = async (req, res) => {
    // #swagger.tags = ['Technologies']
    // #swagger.summary = 'Lister toutes les technologies'
    try {
        const technologies = await technologieService.recupererToutesLesTechnologies();
        sendResponse(res, 200, true,"Technologies récupérées avec succès", technologies);
    } catch (erreur) {
        sendResponse(res, 500, false,"Erreur lors de la récupération des technologies", null, erreur.message);
    }
};

export const obtenirTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies']
    // #swagger.summary = 'Récupérer une technologie par ID'
    try {
        const { id } = req.params;
        const technologie = await technologieService.recupererTechnologieParId(id);
        if (!technologie) {
            return sendResponse(res, 404, false,"Technologie non trouvée");
        }
        sendResponse(res, 200, true,"Technologie récupérée avec succès", technologie);
    } catch (erreur) {
        sendResponse(res, 500, false,"Erreur lors de la récupération de la technologie", null, erreur.message);
    }
};

export const ajouterTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies']
    // #swagger.summary = 'Ajouter une nouvelle technologie'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de la technologie',
            required: true,
            schema: { $ref: '#/definitions/TechnologieRequest' }
    } */
    try {
        const nouvelleTechnologie = await technologieService.creerTechnologie(req.body);
        sendResponse(res, 201, true,"Technologie créée avec succès", nouvelleTechnologie);
    } catch (erreur) {
        sendResponse(res, 400, false,"Erreur lors de la création de la technologie", null, erreur.message);
    }
};

export const modifierTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies']
    // #swagger.summary = 'Modifier une technologie existante'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de la technologie à modifier',
            required: true,
            schema: { $ref: '#/definitions/TechnologieRequest' }
    } */
    try {
        const { id } = req.params;
        const technologieModifiee = await technologieService.modifierTechnologie(id, req.body);
        sendResponse(res, 200, true,"Technologie modifiée avec succès", technologieModifiee);
    } catch (erreur) {
        sendResponse(res, 400, false,"Erreur lors de la modification de la technologie", null, erreur.message);
    }
};

export const supprimerTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies']
    // #swagger.summary = 'Supprimer une technologie'
    try {
        const { id } = req.params;
        await technologieService.supprimerTechnologie(id);
        sendResponse(res, 200, true,"Technologie supprimée avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false,"Erreur lors de la suppression de la technologie", null, erreur.message);
    }
};
