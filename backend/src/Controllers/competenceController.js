import * as competenceService from '../Services/competenceService.js';
import sendResponse from '../Utils/responseHandler.js';

// --- CONTRÔLEURS CATALOGUE ---

export const listerCompetences = async (req, res) => {
    // #swagger.tags = ['Compétences']
    // #swagger.summary = 'Lister toutes les compétences du catalogue'
    try {
        const competences = await competenceService.recupererToutesLesCompetences();
        return sendResponse(res, 200, true, "Compétences récupérées avec succès", competences);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des compétences", null, erreur);
    }
};

export const recupererCompetence = async (req, res) => {
    // #swagger.tags = ['Compétences']
    // #swagger.summary = 'Récupérer une compétence par ID'
    try {
        const { id } = req.params;
        const competence = await competenceService.recupererCompetenceParId(id);
        if (competence) {
            return sendResponse(res, 200, true, "Compétence récupérée avec succès", competence);
        } else {
            return sendResponse(res, 404, false, "Compétence non trouvée");
        }
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération", null, erreur);
    }
};

export const ajouterCompetence = async (req, res) => {
    // #swagger.tags = ['Compétences']
    // #swagger.summary = 'Ajouter une nouvelle compétence au catalogue'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données de la compétence',
        required: true,
        schema: { $ref: '#/definitions/CompetenceRequest' }
    } */
    try {
        const nouvelleCompetence = await competenceService.creerCompetence(req.body);
        return sendResponse(res, 201, true, "Compétence créée avec succès", nouvelleCompetence);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la création de la compétence", null, erreur);
    }
};

export const modifierCompetence = async (req, res) => {
    // #swagger.tags = ['Compétences']
    // #swagger.summary = 'Modifier une compétence existante'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données de la compétence à modifier',
        required: true,
        schema: { $ref: '#/definitions/CompetenceRequest' }
    } */
    try {
        const { id } = req.params;
        const competenceModifiee = await competenceService.modifierCompetence(id, req.body);
        return sendResponse(res, 200, true, "Compétence modifiée avec succès", competenceModifiee);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la modification de la compétence", null, erreur);
    }
};

export const supprimerCompetence = async (req, res) => {
    // #swagger.tags = ['Compétences']
    // #swagger.summary = 'Supprimer une compétence du catalogue'
    try {
        const { id } = req.params;
        await competenceService.supprimerCompetence(id);
        return sendResponse(res, 200, true, "Compétence supprimée avec succès");
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de la suppression", null, erreur);
    }
};

// --- CONTRÔLEURS ÉTUDIANT ---

export const listerCompetencesEtudiant = async (req, res) => {
    // #swagger.tags = ['Compétences Étudiant']
    // #swagger.summary = 'Lister les compétences d\'un étudiant'
    try {
        const { id_etudiant } = req.params;
        const competences = await competenceService.recupererCompetencesEtudiant(id_etudiant);
        return sendResponse(res, 200, true, "Compétences de l'étudiant récupérées avec succès", competences);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération", null, erreur);
    }
};

export const associerCompetence = async (req, res) => {
    // #swagger.tags = ['Compétences Étudiant']
    // #swagger.summary = 'Associer une compétence à un étudiant'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Niveau de maîtrise',
        required: true,
        schema: { niveau_maitrise: 3 }
    } */
    try {
        const { id_etudiant, id_competence } = req.params;
        const { niveau_maitrise } = req.body;
        const association = await competenceService.lierCompetenceAEtudiant(id_etudiant, id_competence, niveau_maitrise);
        return sendResponse(res, 200, true, "Compétence associée avec succès", association);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors de l'association", null, erreur);
    }
};

export const detacherCompetence = async (req, res) => {
    // #swagger.tags = ['Compétences Étudiant']
    // #swagger.summary = 'Retirer une compétence d\'un étudiant'
    try {
        const { id_etudiant, id_competence } = req.params;
        await competenceService.retirerCompetenceEtudiant(id_etudiant, id_competence);
        return sendResponse(res, 200, true, "Compétence retirée de l'étudiant avec succès");
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors du retrait", null, erreur);
    }
};
