import * as utilisateurService from '../Services/utilisateurService.js';
import sendResponse from '../Utils/responseHandler.js';

export const obtenirTousLesUtilisateurs = async (req, res) => {
    // #swagger.tags = ['Utilisateurs']
    // #swagger.summary = 'Récupérer tous les utilisateurs (Admin uniquement)'
    try {
        const utilisateurs = await utilisateurService.recupererTousLesUtilisateurs();
        return sendResponse(res, 200, true, "Utilisateurs récupérés avec succès", utilisateurs);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des utilisateurs", null, erreur.message);
    }
};

export const obtenirUtilisateurParId = async (req, res) => {
    // #swagger.tags = ['Utilisateurs']
    // #swagger.summary = 'Récupérer un utilisateur par ID avec ses profils'
    try {
        const { id } = req.params;
        const utilisateur = await utilisateurService.recupererUtilisateurParId(id);
        if (!utilisateur) {
            return sendResponse(res, 404, false, "Utilisateur non trouvé");
        }
        return sendResponse(res, 200, true, "Utilisateur récupéré avec succès", utilisateur);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération de l'utilisateur", null, erreur.message);
    }
};

export const changerRole = async (req, res) => {
    // #swagger.tags = ['Utilisateurs']
    // #swagger.summary = 'Modifier le rôle d\'un utilisateur (Admin uniquement)'
    /* #swagger.parameters['body'] = {
        in: 'body',
        schema: { role: 'PROFESSEUR' }
    } */
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) {
            return sendResponse(res, 400, false, "Le rôle est requis");
        }
        const utilisateur = await utilisateurService.modifierRole(id, role);
        return sendResponse(res, 200, true, "Rôle mis à jour avec succès", utilisateur);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la mise à jour du rôle", null, erreur.message);
    }
};

export const changerStatut = async (req, res) => {
    // #swagger.tags = ['Utilisateurs']
    // #swagger.summary = 'Modifier le statut d\'un utilisateur (Admin uniquement)'
    /* #swagger.parameters['body'] = {
        in: 'body',
        schema: { status: 'ACTIF' }
    } */
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return sendResponse(res, 400, false, "Le statut est requis");
        }
        const utilisateur = await utilisateurService.modifierStatut(id, status);
        return sendResponse(res, 200, true, "Statut mis à jour avec succès", utilisateur);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la mise à jour du statut", null, erreur.message);
    }
};

export const supprimerUnUtilisateur = async (req, res) => {
    // #swagger.tags = ['Utilisateurs']
    // #swagger.summary = 'Supprimer un utilisateur (Admin uniquement)'
    try {
        const { id } = req.params;
        await utilisateurService.supprimerUtilisateur(id);
        return sendResponse(res, 200, true, "Utilisateur supprimé avec succès");
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la suppression de l'utilisateur", null, erreur.message);
    }
};
