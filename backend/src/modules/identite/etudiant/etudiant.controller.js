import * as etudiantService from './etudiant.service.js';
import sendResponse from '#Utils/response.handler.js';

export const obtenirTousLesProfils = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Récupérer tous les profils étudiants'
    try {
        const etudiants = await etudiantService.recupererTousLesProfils();
        return sendResponse(res, 200, true, "Profils récupérés avec succès", etudiants);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des profils", null, erreur.message);
    }
};

export const obtenirEtudiantsParEcole = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Récupérer les étudiants appartenant à une école spécifique'
    /* #swagger.parameters['ecole'] = {
        in: 'path',
        description: 'Nom de l\'école'
    } */
    try {
        const { ecole } = req.params;
        const etudiants = await etudiantService.recupererEtudiantsParEcole(ecole);
        return sendResponse(res, 200, true, `Étudiants de l'école ${ecole} récupérés avec succès`, etudiants);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des étudiants", null, erreur.message);
    }
};

export const obtenirProfilParId = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Récupérer un profil étudiant par ID'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID de l\'étudiant (id_utilisateur)'
    } */
    try {
        const { id } = req.params;
        const etudiant = await etudiantService.recupererParId(id);
        if (!etudiant) {
            return sendResponse(res, 404, false, "Étudiant non trouvé");
        }
        return sendResponse(res, 200, true, "Profil récupéré avec succès", etudiant);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération du profil", null, erreur.message);
    }
};

export const traiterProfil = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Créer ou mettre à jour un profil étudiant'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID de l\'étudiant (id_utilisateur)'
    } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations du profil étudiant',
        required: true,
        schema: { $ref: '#/definitions/EtudiantProfileRequest' }
    } */
    try {
        const { id } = req.params;
        const profil = await etudiantService.ajouterOuModifierEtudiant(id, req.body);
        return sendResponse(res, 200, true, "Profil traité avec succès", profil);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors du traitement du profil", null, erreur.message);
    }
};

/**
 * Upload de la photo de profil (Avatar)
 */
export const uploadAvatar = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Uploader la photo de profil'
    // #swagger.consumes = ['multipart/form-data']
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID de l\'étudiant (id_utilisateur)'
    } */
    /* #swagger.parameters['fichier'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Photo de profil (Avatar)',
    } */
    try {
        const { id } = req.params; 
        if (!req.file) {
            return sendResponse(res, 400, false, "Aucun fichier fourni");
        }

        const result = await etudiantService.mettreAJourAvatar(id, req.file, req.user.id);

        return sendResponse(res, 200, true, "Photo de profil mise à jour", result);
    } catch (error) {
        const status = error.message === "Étudiant non trouvé" ? 404 : 500;
        return sendResponse(res, status, false, error.message || "Erreur lors de l'upload de l'avatar", null, error.message);
    }
};

export const recalculerScoreCredibilite = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Recalculer le score et le niveau de crédibilité de l\'étudiant'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID de l\'étudiant (id_utilisateur)'
    } */
    try {
        const { id } = req.params;
        const resultat = await etudiantService.calculerEtMettreAJourScoreCredibilite(id);
        return sendResponse(res, 200, true, "Score de crédibilité recalculé avec succès", resultat);
    } catch (erreur) {
        const status = erreur.message === "Étudiant non trouvé" ? 404 : 500;
        return sendResponse(res, status, false, "Erreur lors du calcul du score", null, erreur.message);
    }
};
