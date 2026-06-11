import * as historiqueActionService from './historiqueAction.service.js';
import sendResponse from '#Utils/response.handler.js';

export const listerActions = async (req, res) => {
    // #swagger.tags = ['Historique Actions']
    // #swagger.summary = 'Lister l historique des actions'
    try {
        const actions = await historiqueActionService.recupererToutesLesActions(req.query);
        sendResponse(res, 200, true, "Actions récupérées avec succès", actions);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des actions", null, erreur.message);
    }
};

export const obtenirAction = async (req, res) => {
    // #swagger.tags = ['Historique Actions']
    // #swagger.summary = 'Obtenir une action par ID'
    try {
        const { id } = req.params;
        const action = await historiqueActionService.recupererActionParId(id);
        if (!action) {
            return sendResponse(res, 404, false, "Action non trouvée");
        }
        sendResponse(res, 200, true, "Action récupérée avec succès", action);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération de l'action", null, erreur.message);
    }
};

export const listerActionsParUtilisateur = async (req, res) => {
    // #swagger.tags = ['Historique Actions']
    // #swagger.summary = 'Lister l historique d actions d un utilisateur'
    try {
        const { id_utilisateur } = req.params;
        const actions = await historiqueActionService.recupererActionsParUtilisateur(id_utilisateur);
        sendResponse(res, 200, true, "Actions récupérées avec succès", actions);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des actions", null, erreur.message);
    }
};

export const listerMesActions = async (req, res) => {
    // #swagger.tags = ['Historique Actions']
    // #swagger.summary = 'Lister mes propres actions'
    try {
        const id_utilisateur = req.user.id;
        const actions = await historiqueActionService.recupererActionsParUtilisateur(id_utilisateur);
        sendResponse(res, 200, true, "Mes actions récupérées avec succès", actions);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération de mes actions", null, erreur.message);
    }
};