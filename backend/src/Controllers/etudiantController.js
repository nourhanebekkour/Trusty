import * as etudiantService from '../Services/etudiantService.js';
import sendResponse from '../Utils/responseHandler.js';

export const obtenirTousLesProfils = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Récupérer tous les profils étudiants'
    try {
        const etudiants = await etudiantService.recupererTousLesProfils();
        return sendResponse(res, 200, true, "Profils récupérés avec succès", etudiants);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération des profils", null, erreur);
    }
};

export const obtenirProfilParId = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Récupérer un profil étudiant par ID'
    try {
        const { id } = req.params;
        const etudiant = await etudiantService.recupererParId(id);
        if (!etudiant) {
            return sendResponse(res, 404, false, "Étudiant non trouvé");
        }
        return sendResponse(res, 200, true, "Profil récupéré avec succès", etudiant);
    } catch (erreur) {
        return sendResponse(res, 500, false, "Erreur lors de la récupération du profil", null, erreur);
    }
};

export const traiterProfil = async (req, res) => {
    // #swagger.tags = ['Etudiants']
    // #swagger.summary = 'Créer ou mettre à jour un profil étudiant'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du profil étudiant',
        required: true,
        schema: { $ref: '#/definitions/EtudiantProfileRequest' }
    } */
    try {
        const { id } = req.params;
        const profil = await etudiantService.ajouterOuModifierEtudiant(id, req.body);
        return sendResponse(res, 200, true, "Profil traité avec succès (créé ou mis à jour)", profil);
    } catch (erreur) {
        return sendResponse(res, 400, false, "Erreur lors du traitement du profil", null, erreur);
    }
};
