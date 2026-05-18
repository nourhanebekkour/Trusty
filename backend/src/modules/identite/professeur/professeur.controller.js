import * as ProfesseurService from './professeur.service.js';
import sendResponse from '#Utils/response.handler.js';

export const createOrUpdateProfile = async (req, res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Créer ou mettre à jour un profil professeur'
    /* #swagger.parameters['id'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations du profil professeur',
        required: true,
        schema: { $ref: '#/definitions/ProfesseurProfileRequest' }
    } */
    try {
        const id = req.params.id;
        const profil = await ProfesseurService.ajouterOuModifierProfesseur(id, req.body);
        return sendResponse(res, 200, true, "Professeur créé ou mis à jour avec succès", profil);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors du traitement du profil", null, error.message);
    }
};

export const obtenirProfilParId = async (req, res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Récupérer un profil professeur par ID'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const id = req.params.id;
        const profil = await ProfesseurService.recupererProfesseurParId(id);
         
        if (!profil) {
            return sendResponse(res, 404, false, "Utilisateur introuvable");
        }
        return sendResponse(res, 200, true, "Profil récupéré avec succès", profil);
    }
     catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération du profil", null, error.message);
    }
};

export const obtenirTousLesProfils = async (req,res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Récupérer tous les profils professeurs'
    try{
        const profils = await ProfesseurService.recupererTousLesProfesseurs();
        return sendResponse(res, 200, true, "Profils récupérés avec succès", profils);
    } catch (error){
        return sendResponse(res, 500, false, "Erreur lors de la récupération des profils", null, error.message);
    }
};

export const obtenirProfesseursParFiliere = async (req, res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Récupérer les professeurs par filière'
    /* #swagger.parameters['filiere'] = { in: 'path' } */
    try {
        const { filiere } = req.params;
        const profils = await ProfesseurService.recupererProfesseursParFiliere(filiere.toUpperCase());
        return sendResponse(res, 200, true, `Professeurs de la filière ${filiere} récupérés avec succès`, profils);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des professeurs", null, error.message);
    }
};

/**
 * Upload de la photo de profil (Avatar)
 */
export const uploadAvatar = async (req, res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Uploader la photo de profil'
    // #swagger.consumes = ['multipart/form-data']
    /* #swagger.parameters['id'] = { in: 'path' } */
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

        const result = await ProfesseurService.mettreAJourAvatar(id, req.file, req.user.id);

        return sendResponse(res, 200, true, "Photo de profil mise à jour", result);
    } catch (error) {
        const status = error.message === "Professeur non trouvé" ? 404 : 500;
        return sendResponse(res, status, false, error.message || "Erreur lors de l'upload de l'avatar", null, error.message);
    }
};
