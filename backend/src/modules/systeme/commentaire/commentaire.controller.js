import * as commentaireService from './commentaire.service.js';
import sendResponse from '#Utils/response.handler.js';

export const creerCommentaire = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Créer un nouveau commentaire'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du commentaire à créer',
        required: true,
        schema: { $ref: '#/definitions/CommentaireRequest' }
    } */
    try {
        const id_auteur = req.user.id;
        const commentaire = await commentaireService.creerCommentaire(id_auteur, req.body);
        return sendResponse(res, 201, true, "Commentaire créé avec succès, en attente de validation", commentaire);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la création du commentaire", null, error.message);
    }
};

export const recupererCommentaires = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer tous les commentaires (Admin uniquement)'
    try {
        const commentaires = await commentaireService.recupererCommentaires();
        return sendResponse(res, 200, true, "Commentaires récupérés", commentaires);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des commentaires", null, error.message);
    }
};

export const recupererCommentaireParId = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer un commentaire par ID (Admin uniquement)'
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID du commentaire' } */
    try {
        const { id } = req.params;
        const commentaire = await commentaireService.recupererCommentaireParId(id);
        if (!commentaire) return sendResponse(res, 404, false, "Commentaire non trouvé");
        return sendResponse(res, 200, true, "Commentaire récupéré", commentaire);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération du commentaire", null, error.message);
    }
};

export const validerCommentaire = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Valider ou rejeter un commentaire (Étudiant cible ou Admin)'
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID du commentaire' } */
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

        const commentaire = await commentaireService.recupererCommentaireParId(id);
        
        if (!commentaire) {
            return sendResponse(res, 404, false, "Commentaire non trouvé");
        }

        if (userRole !== 'ADMINISTRATEUR' && commentaire.id_etudiant_cible !== userId) {
            return sendResponse(res, 403, false, "Vous n'êtes pas autorisé à valider ce commentaire");
        }

        const commentaireValide = await commentaireService.validerCommentaire(id, status);
        return sendResponse(res, 200, true, `Commentaire ${status.toLowerCase()} avec succès`, commentaireValide);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la validation du commentaire", null, error.message);
    }
};

export const supprimerCommentaire = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Supprimer un commentaire (Auteur ou Admin)'
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID du commentaire' } */
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const commentaire = await commentaireService.recupererCommentaireParId(id);
        
        if (!commentaire) {
            return sendResponse(res, 404, false, "Commentaire non trouvé");
        }

        if (userRole !== 'ADMINISTRATEUR' && commentaire.id_auteur !== userId) {
            return sendResponse(res, 403, false, "Vous n'êtes pas autorisé à supprimer ce commentaire");
        }

        await commentaireService.supprimerCommentaire(id);
        return sendResponse(res, 200, true, "Commentaire supprimé avec succès");
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la suppression du commentaire", null, error.message);
    }
};

export const recupererCommentairesProjetValidees = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer les commentaires validés d\'un projet'
    /* #swagger.parameters['id_projet'] = { in: 'path', description: 'ID du projet' } */
    try {
        const { id_projet } = req.params;
        const commentaires = await commentaireService.recupererCommentairesProjetValidees(id_projet);
        return sendResponse(res, 200, true, "Commentaires du projet récupérés", commentaires);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des commentaires du projet", null, error.message);
    }
};

export const recupererCommentairesProfilValidees = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer les commentaires validés d\'un profil étudiant'
    /* #swagger.parameters['id_etudiant'] = { in: 'path', description: 'ID de l\'étudiant' } */
    try {
        const { id_etudiant } = req.params;
        const commentaires = await commentaireService.recupererCommentairesProfilValidees(id_etudiant);
        return sendResponse(res, 200, true, "Commentaires du profil récupérés", commentaires);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des commentaires du profil", null, error.message);
    }
};

export const recupererMesCommentairesRecus = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer tous les commentaires reçus par l\'utilisateur connecté'
    try {
        const id_etudiant = req.user.id;
        const commentaires = await commentaireService.recupererCommentairesRecus(id_etudiant);
        return sendResponse(res, 200, true, "Commentaires reçus récupérés", commentaires);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des commentaires reçus", null, error.message);
    }
};

export const recupererCommentairesProfil = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer les commentaires d\'un profil étudiant'
    /* #swagger.parameters['id_etudiant'] = { in: 'path', description: 'ID de l\'étudiant' } */
    try {
        const { id_etudiant } = req.params;
        const commentaires = await commentaireService.recupererCommentairesProfil(id_etudiant);
        return sendResponse(res, 200, true, "Commentaires du profil récupérés", commentaires);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des commentaires du profil", null, error.message);
    }
};

export const recupererCommentairesProjet = async (req, res) => {
    // #swagger.tags = ['Commentaires']
    // #swagger.summary = 'Récupérer les commentaires d\'un projet'
    /* #swagger.parameters['id_projet'] = { in: 'path', description: 'ID du projet' } */
    try {
        const { id_projet } = req.params;
        const commentaires = await commentaireService.recupererCommentairesProjet(id_projet);
        return sendResponse(res, 200, true, "Commentaires du projet récupérés", commentaires);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des commentaires du projet", null, error.message);
    }
};
