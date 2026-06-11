import * as stageService from './stage.service.js';
import sendResponse from '#Utils/response.handler.js';

// --- GESTION DES STAGES ---

export const creerStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Créer un nouveau stage pour un étudiant'
    /* #swagger.parameters['id_etudiant'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations du stage',
        required: true,
        schema: { $ref: '#/definitions/StageRequest' }
    } */
    try {
        const { id_etudiant } = req.params;
        const donnees = {
            ...req.body,
            id_etudiant
        };

        const nouveauStage = await stageService.creerStage(donnees);
        sendResponse(res, 201, true, "Stage crée avec succès", nouveauStage);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la création du stage", null, erreur.message);
    }

};

export const listerStages = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Lister tous les stages'
    try {
        const stagesAvecUrls = await stageService.recupererTousLesStages(req.query);
        sendResponse(res, 200, true, "Stages récupérés avec succès", stagesAvecUrls);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des stages", null, erreur.message);
    }
}

export const obtenirStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Obtenir un stage par ID'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        const stage = await stageService.recupererStageParId(id);
        if (!stage) {
            return sendResponse(res, 404, false, "Stage non trouvé");
        }
        sendResponse(res, 200, true, "Stage récupéré avec succès", stage);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération du stage", null, erreur.message);
    }
};

export const listerStagesParEtudiant = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Lister les stages d un étudiant'
    /* #swagger.parameters['id_etudiant'] = { in: 'path' } */
    try {
        const { id_etudiant } = req.params;
        const stagesAvecUrls = await stageService.recupererStagesParEtudiant(id_etudiant);
        sendResponse(res, 200, true, "Stages récupérés avec succès", stagesAvecUrls);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des stages", null, erreur.message);
    }
};

export const listerStagesAValider = async (req, res) => {
    // #swagger.tags = ['Tableaux de Bord - Professeurs']
    // #swagger.summary = "Lister les stages en attente de ma validation"
    try {
        const stages = await stageService.recupererStagesAValider(req.user.id);
        sendResponse(res, 200, true, "Stages à valider récupérés avec succès", stages);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des stages à valider", null, erreur.message);
    }
};

export const modifierStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Modifier un stage existant'
    /* #swagger.parameters['id'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations du stage à modifier',
        required: true,
        schema: { $ref: '#/definitions/StageRequest' }
    } */
    try {
        const { id } = req.params;
        const stageModifie = await stageService.modifierStage(id, req.body, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Stage modifié avec succès", stageModifie);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la modification du stage", null, erreur.message);
    }
};

export const validerStage = async (req, res) => {
    // #swagger.tags = ['Tableaux de Bord - Professeurs']
    // #swagger.summary = 'Valider ou rejeter un stage (Professeur uniquement)'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        const { decision, commentaire } = req.body;
        const stageValide = await stageService.validerStage(id, req.user.id, decision, commentaire);
        sendResponse(res, 200, true, `Stage ${decision.toLowerCase()} avec succès`, stageValide);
    } catch (erreur) {
        const status = erreur.message.includes("validateur") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la validation du stage", null, erreur.message);
    }
};

export const supprimerStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Supprimer un stage'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        await stageService.supprimerStage(id, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Stage supprimé avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : (erreur.message === "Stage non trouvé" ? 404 : 400);
        sendResponse(res, status, false, "Erreur lors de la suppression du stage", null, erreur.message);
    }
};

/**
 * Upload du rapport de stage
 */
export const uploadRapport = async (req, res) => {
    // #swagger.tags = ['Stages-Rapports']
    // #swagger.summary = 'Uploader le rapport de stage'
    // #swagger.consumes = ['multipart/form-data']
    /* #swagger.parameters['id'] = { in: 'path' } */
    /* #swagger.parameters['fichier'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Rapport de stage (PDF, etc.)',
    } */
    try {
        const { id } = req.params;
        if (!req.file) {
            return sendResponse(res, 400, false, "Aucun fichier fourni");
        }

        const userId = req.user.id;
        const fileRecord = await stageService.associerRapport(id, req.file, userId, req.user.role);
        
        sendResponse(res, 200, true, "Rapport de stage uploadé avec succès", fileRecord);
    } catch (error) {
        const status = error.message.includes("autorisé") ? 403 : (error.message === "Stage non trouvé" ? 404 : 500);
        sendResponse(res, status, false, "Erreur lors de l'upload du rapport", null, error.message);
    }
};

/**
 * Suppression du rapport de stage
 */
export const supprimerRapport = async (req, res) => {
    // #swagger.tags = ['Stages-Rapports']
    // #swagger.summary = 'Supprimer le rapport de stage'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        await stageService.supprimerRapport(id, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Rapport de stage supprimé avec succès");
    } catch (error) {
        const status = error.message.includes("autorisé") ? 403 : (error.message.includes("non trouvé") || error.message.includes("Aucun rapport") ? 404 : 500);
        sendResponse(res, status, false, "Erreur lors de la suppression du rapport", null, error.message);
    }
};

// --- GESTION DES TECHNOLOGIES DU STAGE ---

export const ajouterTechnologie = async (req, res) => {
    // #swagger.tags = ['Stages - Technologies']
    // #swagger.summary = 'Ajouter une technologie à un stage'
    /* #swagger.parameters['id_stage'] = { in: 'path' } */
    /* #swagger.parameters['id_technologie'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations de l\'utilisation de la technologie',
        required: true,
        schema: { $ref: '#/definitions/StageTechnologieRequest' }
    } */
    try {
        const { id_stage, id_technologie } = req.params;
        const technologie = await stageService.ajouterTechnologieStage(id_stage, id_technologie, req.body, req.user.id, req.user.role);
        sendResponse(res, 201, true, "Technologie ajoutée au stage avec succès", technologie);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de l'ajout de la technologie", null, erreur.message);
    }
};

export const modifierTechnologie = async (req, res) => {
    // #swagger.tags = ['Stages - Technologies']
    // #swagger.summary = 'Modifier l utilisation d une technologie dans un stage'
    /* #swagger.parameters['id_stage'] = { in: 'path' } */
    /* #swagger.parameters['id_technologie'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations de l\'utilisation de la technologie à modifier',
        required: true,
        schema: { $ref: '#/definitions/StageTechnologieRequest' }
    } */
    try {
        const { id_stage, id_technologie } = req.params;
        const technologieModifiee = await stageService.modifierTechnologieStage(id_stage, id_technologie, req.body, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Technologie du stage modifiée avec succès", technologieModifiee);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la modification de la technologie", null, erreur.message);
    }
};

export const retirerTechnologie = async (req, res) => {
    // #swagger.tags = ['Stages - Technologies']
    // #swagger.summary = 'Retirer une technologie d un stage'
    /* #swagger.parameters['id_stage'] = { in: 'path' } */
    /* #swagger.parameters['id_technologie'] = { in: 'path' } */
    try {
        const { id_stage, id_technologie } = req.params;
        await stageService.retirerTechnologieStage(id_stage, id_technologie, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Technologie retirée du stage avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors du retrait de la technologie", null, erreur.message);
    }
};
