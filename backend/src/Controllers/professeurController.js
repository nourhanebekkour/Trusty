import * as ProfesseurService from '../Services/professeurService.js';
import sendResponse from '../Utils/responseHandler.js';

export const createOrUpdateProfile = async (req, res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Créer ou mettre à jour un profil professeur'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du profil professeur',
        required: true,
        schema: { $ref: '#/definitions/ProfesseurProfileRequest' }
    } */
    try {
        const id = req.params.id;
        const user = await ProfesseurService.recupererProfesseurParId(id);
         
        if (!user) {
            return sendResponse(res, 404, false, "Utilisateur introuvable");
        }
    
        
        const profil = await ProfesseurService.ajouterOuModifierProfesseur(id, req.body);
        
        return sendResponse(res, 200, true, "Professeur créé ou mis à jour avec succès", profil);
    } catch (error) {
        return sendResponse(res, 500, false, "Erreur lors du traitement du profil", null, error);
    }
};

export const obtenirProfilParId = async (req, res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Récupérer un profil professeur par ID'
    try {
        const id = req.params.id;
        const profil = await ProfesseurService.recupererProfesseurParId(id);
         
        if (!profil) {
            return sendResponse(res, 404, false, "Utilisateur introuvable");
        }
        
        return sendResponse(res, 200, true, "Profil récupéré avec succès", profil);
    }
     catch (error) {
        return sendResponse(res, 404, false, error.message, null, error);
    }
};

export const obtenirTousLesProfils = async (req,res) => {
    // #swagger.tags = ['Professeurs']
    // #swagger.summary = 'Récupérer tous les profils professeurs'
    try{
        const profil = await ProfesseurService.recupererTousLesProfesseurs();
        return sendResponse(res, 200, true, "Profils récupérés avec succès", profil);
    } catch (error){
        return sendResponse(res, 500, false, "Erreur lors de la récupération des profils", null, error);
    }
}