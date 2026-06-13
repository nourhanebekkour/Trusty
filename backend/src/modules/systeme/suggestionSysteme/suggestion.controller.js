import * as suggestionService from './suggestion.service.js';
import sendResponse from '#Utils/response.handler.js';

export const genererSuggestion = async (req, res) => {
    // #swagger.tags = ['Suggestions IA']
    // #swagger.summary = 'Générer une suggestion personnalisée via l IA'
    // #swagger.description = 'Analyse le profil de l étudiant connecté (compétences, projets, formations) avec Gemini et génère une recommandation.'
    try {
        const id_etudiant = req.user.id;
        const suggestion = await suggestionService.genererEtSauvegarderSuggestion(id_etudiant);
        sendResponse(res, 201, true, "Suggestion générée avec succès", suggestion);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la génération de la suggestion", null, erreur.message);
    }
};

export const listerSuggestions = async (req, res) => {
    // #swagger.tags = ['Suggestions IA']
    // #swagger.summary = 'Lister toutes les suggestions de l étudiant connecté'
    try {
        const id_etudiant = req.user.id;
        const suggestions = await suggestionService.recupererSuggestions(id_etudiant);
        sendResponse(res, 200, true, "Suggestions récupérées avec succès", suggestions);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des suggestions", null, erreur.message);
    }
};

export const marquerLue = async (req, res) => {
    // #swagger.tags = ['Suggestions IA']
    // #swagger.summary = 'Marquer une suggestion spécifique comme lue'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID de la suggestion'
    } */
    try {
        const { id } = req.params;
        const id_etudiant = req.user.id;
        
        const suggestionLue = await suggestionService.marquerCommeLue(id, id_etudiant);
        sendResponse(res, 200, true, "Suggestion marquée comme lue", suggestionLue);
    } catch (erreur) {
        const status = erreur.message.includes("refusé") ? 403 : 500;
        sendResponse(res, status, false, "Erreur lors de la mise à jour de la suggestion", null, erreur.message);
    }
};
