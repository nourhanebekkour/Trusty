import * as AdminService from './administrateur.service.js';
import sendResponse from '#Utils/response.handler.js';

export const createOrUpdateProfile = async (req, res) => {
    // #swagger.tags = ['Administrateurs']
    // #swagger.summary = 'Créer ou mettre à jour un profil administrateur'
    /* #swagger.parameters['id'] = { in: 'path' } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations du profil administrateur',
        required: true,
        schema: { $ref: '#/definitions/AdminProfileRequest' }
    } */
    try {
        const id = req.params.id;
        const profil = await AdminService.ajouterOuModifierAdmin(id, req.body);
        return sendResponse(res, 200, true, "Administrateur créé ou mis à jour avec succès", profil);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors du traitement du profil", null, error.message);
    }
};

export const getProfileByID = async (req, res) => {
    // #swagger.tags = ['Administrateurs']
    // #swagger.summary = 'Récupérer un profil administrateur par ID'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const id = req.params.id;
        const profil = await AdminService.recupererAdminParId(id);
        
        if (!profil) {
            return sendResponse(res, 404, false, "Utilisateur introuvable");
        }
        return sendResponse(res, 200, true, "Profil récupéré avec succès", profil);
    }
     catch (error) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération du profil", null, error.message);
    }
};

export const getProfiles = async (req,res) => {
    // #swagger.tags = ['Administrateurs']
    // #swagger.summary = 'Récupérer tous les profils administrateurs'
    try{
        const profils = await AdminService.recupererTousLesAdmins();
        return sendResponse(res, 200, true, "Profils récupérés avec succès", profils);
    } catch (error){
        return sendResponse(res, 500, false, "Erreur lors de la récupération des profils", null, error.message);
    }
}

/**
 * Upload de la photo de profil (Avatar)
 */
export const uploadAvatar = async (req, res) => {
    // #swagger.tags = ['Administrateurs']
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

        const result = await AdminService.mettreAJourAvatar(id, req.file, req.user.id);

        return sendResponse(res, 200, true, "Photo de profil mise à jour", result);
    } catch (error) {
        const status = error.message === "Administrateur non trouvé" ? 404 : 500;
        return sendResponse(res, status, false, error.message || "Erreur lors de l'upload de l'avatar", null, error.message);
    }
};
