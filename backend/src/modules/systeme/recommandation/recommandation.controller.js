import * as recommandationService from './recommandation.service.js';
import sendResponse from '#Utils/response.handler.js';

export const creerRecommandation = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Créer une nouvelle recommandation'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données de la recommandation à créer',
        required: true,
        schema: { $ref: '#/definitions/RecommandationRequest' }
    } */
    try {
        const id_recommandeur = req.user.id;
        const recommandation = await recommandationService.creerRecommandation(id_recommandeur, req.body);
        return sendResponse(res, 201, true, "Recommandation créée avec succès, en attente de validation", recommandation);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la création de la recommandation", null, error.message);
    }
};

export const recupererRecommandations = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Récupérer toutes les recommandations (Admin uniquement)'
    try {
        const recommandations = await recommandationService.recupererRecommandations();
        return sendResponse(res, 200, true, "Recommandations récupérées", recommandations);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des recommandations", null, error.message);
    }
};

export const recupererRecommandationParId = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Récupérer une recommandation par ID'
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID de la recommandation' } */
    try {
        const { id } = req.params;
        const recommandation = await recommandationService.recupererRecommandationParId(id);
        if (!recommandation) return sendResponse(res, 404, false, "Recommandation non trouvé");
        return sendResponse(res, 200, true, "Recommandation récupérée", recommandation);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération de la recommandation", null, error.message);
    }
};

export const validerRecommandation = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Valider ou rejeter une recommandation (Étudiant cible ou Admin)'
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID de la recommandation' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Status de validation',
        required: true,
        schema: { status: 'VALIDE' }
    } */
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const recommandation = await recommandationService.recupererRecommandationParId(id);
        
        if (!recommandation) {
            return sendResponse(res, 404, false, "Recommandation non trouvé");
        }

        // Seul l'étudiant cible de la recommandation ou un administrateur peut valider/rejeter
        if (userRole !== 'ADMINISTRATEUR' && recommandation.id_etudiant !== userId) {
            return sendResponse(res, 403, false, "Vous n'êtes pas autorisé à valider cette recommandation");
        }

        const recommandationValidee = await recommandationService.validerRecommandation(id, status);
        return sendResponse(res, 200, true, `Recommandation ${status.toLowerCase()} avec succès`, recommandationValidee);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la validation de la recommandation", null, error.message);
    }
};

export const supprimerRecommandation = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Supprimer une recommandation (Auteur ou Admin)'
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID de la recommandation' } */
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const recommandation = await recommandationService.recupererRecommandationParId(id);
        
        if (!recommandation) {
            return sendResponse(res, 404, false, "Recommandation non trouvé");
        }

        // Seul l'auteur de la recommandation ou un administrateur peut la supprimer
        if (userRole !== 'ADMINISTRATEUR' && recommandation.id_recommandeur !== userId) {
            return sendResponse(res, 403, false, "Vous n'êtes pas autorisé à supprimer cette recommandation");
        }

        await recommandationService.supprimerRecommandation(id);
        return sendResponse(res, 200, true, "Recommandation supprimée avec succès");
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la suppression de la recommandation", null, error.message);
    }
};

export const recupererRecommandationsValidees = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Récupérer les recommandations validées d\'un étudiant (Public)'
    /* #swagger.parameters['id_etudiant'] = { in: 'path', description: 'ID de l\'étudiant' } */
    try {
        const { id_etudiant } = req.params;
        const recommandations = await recommandationService.recupererRecommandationsValidees(id_etudiant);
        return sendResponse(res, 200, true, "Recommandations validées récupérées", recommandations);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des recommandations validées", null, error.message);
    }
};

export const recupererMesRecommandationsRecus = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Récupérer toutes les recommandations reçues par l\'utilisateur connecté'
    try {
        const id_etudiant = req.user.id;
        const recommandations = await recommandationService.recupererRecommandationsRecus(id_etudiant);
        return sendResponse(res, 200, true, "Recommandations reçues récupérées", recommandations);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des recommandations reçues", null, error.message);
    }
};

export const recupererMesRecommandationsEmises = async (req, res) => {
    // #swagger.tags = ['Recommandations']
    // #swagger.summary = 'Récupérer toutes les recommandations émises par l\'utilisateur connecté'
    try {
        const id_recommandeur = req.user.id;
        const recommandations = await recommandationService.recupererRecommandationsEmises(id_recommandeur);
        return sendResponse(res, 200, true, "Recommandations émises récupérées", recommandations);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des recommandations émises", null, error.message);
    }
};
