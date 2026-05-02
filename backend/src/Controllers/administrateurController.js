import * as AdminService from '../Services/administrateurService.js';
import sendResponse from '../Utils/responseHandler.js';
import prisma from '../Config/prismaClient.js';

export const createOrUpdateProfile = async (req, res) => {
    // #swagger.tags = ['Administrateurs']
    // #swagger.summary = 'Créer ou mettre à jour un profil administrateur'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du profil admin',
        required: true,
        schema: { $ref: '#/definitions/AdminProfileRequest' }
    } */
    try {
         const id = req.params.id;
        const user = await AdminService.recupererAdminParId(id);
        
        if (!user) {
            return sendResponse(res, 404, false, "Utilisateur introuvable");
        }
        
        const profil = await AdminService.ajouterOuModifierAdmin(id, req.body);
        
        return sendResponse(res, 200, true, "Administrateur créé ou mis à jour avec succès", profil);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors du traitement du profil", null, error);
    }
};

export const getProfileByID = async (req, res) => {
    // #swagger.tags = ['Administrateurs']
    // #swagger.summary = 'Récupérer un profil administrateur par ID'
    try {
        const id = req.params.id;
        const profil = await AdminService.recupererAdminParId(id);
        
        if (!profil) {
            return sendResponse(res, 404, false, "Utilisateur introuvable");
        }
        
        return sendResponse(res, 200, true, "Profil récupéré avec succès", profil);
    }
     catch (error) {
        return sendResponse(res, 404, false, error.message, null, error);
    }
};

export const getProfiles = async (req,res) => {
    // #swagger.tags = ['Administrateurs']
    // #swagger.summary = 'Récupérer tous les profils administrateurs'
    try{
        const profil = await AdminService.recupererTousLesAdmins();
        return sendResponse(res, 200, true, "Profils récupérés avec succès", profil);
    } catch (error){
        return sendResponse(res, 500, false, "Erreur lors de la récupération des profils", null, error);
    }
}
