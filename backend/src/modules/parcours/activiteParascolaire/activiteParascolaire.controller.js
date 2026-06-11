import * as activiteParascolaireService from './activiteParascolaire.service.js';
import sendResponse from '#Utils/response.handler.js';

export const creerActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Créer une nouvelle activité pour un étudiant'
    /* #swagger.parameters['id_etudiant'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations de l\'activité',
        required: true,
        schema: { $ref: '#/definitions/ActiviteRequest' }
    } */
    try {
        const { id_etudiant } = req.params;
        const donnees = {
            ...req.body,
            id_etudiant
        };

        const nouvelleActivite = await activiteParascolaireService.creerActivite(donnees);
        sendResponse(res, 201, true, "Activité créee avec succès", nouvelleActivite);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la création de l'activité", null, erreur.message);
    }

};

export const listerActivites = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Lister toutes les activités'
    try {
        const activitesAvecUrls = await activiteParascolaireService.recupererToutesLesActivites(req.query);
        sendResponse(res, 200, true, "Activités récupérées avec succès", activitesAvecUrls);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des activités", null, erreur.message);
    }
}

export const obtenirActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Obtenir une activité par ID'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        const activite = await activiteParascolaireService.recupererActiviteParId(id);
        if (!activite) {
            return sendResponse(res, 404, false, "Activité non trouvée");
        }
        sendResponse(res, 200, true, "Activité récupérée avec succès", activite);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération de l'activité", null, erreur.message);
    }
};

export const listerActivitesParEtudiant = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Lister les activités d un étudiant'
    /* #swagger.parameters['id_etudiant'] = { in: 'path' } */
    try {
        const { id_etudiant } = req.params;
        const activitesAvecUrls = await activiteParascolaireService.recupererActivitesParEtudiant(id_etudiant);
        sendResponse(res, 200, true, "Activités récupérées avec succès", activitesAvecUrls);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des activités", null, erreur.message);
    }
};

export const listerActivitesAValider = async (req, res) => {
    // #swagger.tags = ['Tableaux de Bord - Admin']
    // #swagger.summary = "Lister les activités en attente de ma validation"
    try {
        const activites = await activiteParascolaireService.recupererActivitesAValider(req.user.id);
        sendResponse(res, 200, true, "Activités à valider récupérés avec succès", activites);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des activités à valider", null, erreur.message);
    }
};

export const modifierActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Modifier une activité existante'
    /* #swagger.parameters['id'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations de l\'activité à modifier',
        required: true,
        schema: { $ref: '#/definitions/ActiviteRequest' }
    } */
    try {
        const { id } = req.params;
        const activiteModifiee = await activiteParascolaireService.modifierActivite(id, req.body, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Activité modifiée avec succès", activiteModifiee);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la modification de l'activité", null, erreur.message);
    }
};

export const validerActivite = async (req, res) => {
    // #swagger.tags = ['Tableaux de Bord - Admin']
    // #swagger.summary = 'Valider ou rejeter une activité (Admin uniquement)'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        const { decision, commentaire } = req.body;
        const activiteValide = await activiteParascolaireService.validerActivite(id, req.user.id, decision, commentaire);
        sendResponse(res, 200, true, `Activité ${decision.toLowerCase()} avec succès`, activiteValide);
    } catch (erreur) {
        const status = erreur.message.includes("validateur") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la validation de l'activité", null, erreur.message);
    }
};

export const supprimerActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Supprimer une activité'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        await activiteParascolaireService.supprimerActivite(id, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Activité supprimée avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : (erreur.message === "Activité non trouvée" ? 404 : 400);
        sendResponse(res, status, false, "Erreur lors de la suppression de l'activité", null, erreur.message);
    }
};

/**
 * Upload de l'attestation d'activité
 */
export const uploadAttestation = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires - Attestation']
    // #swagger.summary = 'Uploader l attestation d activité'
    // #swagger.consumes = ['multipart/form-data']
    /* #swagger.parameters['id'] = { in: 'path' } */
    /* #swagger.parameters['fichier'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Attestation d\'activité (PDF, Image, etc.)',
    } */
    try {
        const { id } = req.params;
        if (!req.file) {
            return sendResponse(res, 400, false, "Aucun fichier fourni");
        }

        const userId = req.user.id;
        const fileRecord = await activiteParascolaireService.associerAttestation(id, req.file, userId, req.user.role);
        
        sendResponse(res, 200, true, "Attestation uploadée avec succès", fileRecord);
    } catch (error) {
        const status = error.message.includes("autorisé") ? 403 : (error.message === "Activité non trouvée" ? 404 : 500);
        sendResponse(res, status, false, "Erreur lors de l'upload de l'attestation", null, error.message);
    }
};

/**
 * Suppression de l'attestation d'activité
 */
export const supprimerAttestation = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires - Attestation']
    // #swagger.summary = 'Supprimer l attestation d activité'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        await activiteParascolaireService.supprimerAttestation(id, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Attestation supprimée avec succès");
    } catch (error) {
        const status = error.message.includes("autorisé") ? 403 : (error.message.includes("non trouvée") || error.message.includes("Aucune attestation") ? 404 : 500);
        sendResponse(res, status, false, "Erreur lors de la suppression de l'attestation", null, error.message);
    }
};
