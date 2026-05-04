import * as stageService from '../Services/stageService.js';
import sendResponse from '../Utils/responseHandler.js';

// --- GESTION DES STAGES ---

export const creerStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Créer un nouveau stage'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations du stage',
            required: true,
            schema: { $ref: '#/definitions/StageRequest' }
    } */
    try {
        const donnees = {
            ...req.body,
            date_debut: new Date(req.body.date_debut),
            date_fin: req.body.date_fin ? new Date(req.body.date_fin) : null,
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
        const stages = await stageService.recupererTousLesStages(req.query);
        sendResponse(res, 200, true, "Stages récupérés avec succès", stages);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des stages", null, erreur.message);
    }
}

export const obtenirStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Obtenir un stage par ID'
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
    try {
        const { id_etudiant } = req.params;
        const stages = await stageService.recupererStagesParEtudiant(id_etudiant);
        sendResponse(res, 200, true, "Stages récupérés avec succès", stages);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des stages", null, erreur.message);
    }
};

export const modifierStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Modifier un stage existant'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations du stage à modifier',
            required: true,
            schema: { $ref: '#/definitions/StageRequest' }
    } */
    try {
        const { id } = req.params;
        const donnees = { ...req.body };
        if (donnees.date_debut) donnees.date_debut = new Date(donnees.date_debut);
        if (donnees.date_fin) donnees.date_fin = new Date(donnees.date_fin);

        const stageModifie = await stageService.modifierStage(id, donnees);
        sendResponse(res, 200, true, "Stage modifié avec succès", stageModifie);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la modification du stage", null, erreur.message);
    }
};

export const supprimerStage = async (req, res) => {
    // #swagger.tags = ['Stages']
    // #swagger.summary = 'Supprimer un stage'
    try {
        const { id } = req.params;
        await stageService.supprimerStage(id);
        sendResponse(res, 200, true, "Stage supprimé avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la suppression du stage", null, erreur.message);
    }
};

// --- GESTION DES TECHNOLOGIES DU STAGE ---

export const ajouterTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Stages']
    // #swagger.summary = 'Ajouter une technologie à un stage'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de l utilisation de la technologie',
            required: true,
            schema: { $ref: '#/definitions/StageTechnologieRequest' }
    } */
    try {
        const { id_stage, id_technologie } = req.params;
        const technologie = await stageService.ajouterTechnologieStage(id_stage, id_technologie, req.body);
        sendResponse(res, 201, true, "Technologie ajoutée au stage avec succès", technologie);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de l'ajout de la technologie", null, erreur.message);
    }
};

export const modifierTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Stages']
    // #swagger.summary = 'Modifier l utilisation d une technologie dans un stage'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de l utilisation de la technologie à modifier',
            required: true,
            schema: { $ref: '#/definitions/StageTechnologieRequest' }
    } */
    try {
        const { id_stage, id_technologie } = req.params;
        const technologieModifiee = await stageService.modifierTechnologieStage(id_stage, id_technologie, req.body);
        sendResponse(res, 200, true, "Technologie du stage modifiée avec succès", technologieModifiee);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la modification de la technologie", null, erreur.message);
    }
};

export const retirerTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Stages']
    // #swagger.summary = 'Retirer une technologie d un stage'
    try {
        const { id_stage, id_technologie } = req.params;
        await stageService.retirerTechnologieStage(id_stage, id_technologie);
        sendResponse(res, 200, true, "Technologie retirée du stage avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors du retrait de la technologie", null, erreur.message);
    }
};
