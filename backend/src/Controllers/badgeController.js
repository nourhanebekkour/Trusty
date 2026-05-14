import * as badgeService from '../Services/badgeService.js';
import sendResponse from '../Utils/responseHandler.js';

// ============================================================================
// CRUD BADGES
// ============================================================================

export const creerBadge = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Créer un nouveau badge'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations du badge',
            required: true,
            schema: { $ref: '#/definitions/BadgeRequest' }
    } */
    try {
        const nouveauBadge = await badgeService.creerBadge(req.body);
        return sendResponse(res, 201, true, 'Badge créé avec succès', nouveauBadge);
    } catch (erreur) {
        if (erreur.code === 'P2002') {
            return sendResponse(res, 409, false, 'Un badge avec ce nom existe déjà', null, erreur.message);
        }
        return sendResponse(res, 400, false, 'Erreur lors de la création du badge', null, erreur.message);
    }
};

export const listerBadges = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Lister tous les badges'
    try {
        const resultat = await badgeService.recupererTousLesBadges(req.query);
        return sendResponse(res, 200, true, 'Badges récupérés avec succès', resultat);
    } catch (erreur) {
        return sendResponse(res, 500, false, 'Erreur lors de la récupération des badges', null, erreur.message);
    }
};

export const obtenirBadge = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Obtenir un badge par ID'
    try {
        const { id } = req.params;
        const badge = await badgeService.recupererBadgeParId(id);
        if (!badge) {
            return sendResponse(res, 404, false, 'Badge non trouvé');
        }
        return sendResponse(res, 200, true, 'Badge récupéré avec succès', badge);
    } catch (erreur) {
        return sendResponse(res, 500, false, 'Erreur lors de la récupération du badge', null, erreur.message);
    }
};

export const modifierBadge = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Modifier un badge existant'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations du badge à modifier',
            required: true,
            schema: { $ref: '#/definitions/BadgeRequest' }
    } */
    try {
        const { id } = req.params;
        const badgeModifie = await badgeService.modifierBadge(id, req.body);
        return sendResponse(res, 200, true, 'Badge modifié avec succès', badgeModifie);
    } catch (erreur) {
        if (erreur.code === 'P2025') {
            return sendResponse(res, 404, false, 'Badge non trouvé', null, erreur.message);
        }
        if (erreur.code === 'P2002') {
            return sendResponse(res, 409, false, 'Un badge avec ce nom existe déjà', null, erreur.message);
        }
        return sendResponse(res, 400, false, 'Erreur lors de la modification du badge', null, erreur.message);
    }
};

export const supprimerBadge = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Supprimer un badge'
    try {
        const { id } = req.params;
        await badgeService.supprimerBadge(id);
        return sendResponse(res, 200, true, 'Badge supprimé avec succès');
    } catch (erreur) {
        if (erreur.code === 'P2025') {
            return sendResponse(res, 404, false, 'Badge non trouvé', null, erreur.message);
        }
        return sendResponse(res, 400, false, 'Erreur lors de la suppression du badge', null, erreur.message);
    }
};

/**
 * Upload de l'icône du badge
 */
export const uploadIcone = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Uploader l\'icône du badge'
    // #swagger.consumes = ['multipart/form-data']
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du badge'
    } */
    /* #swagger.parameters['icone'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Icône du badge',
    } */
    try {
        const { id } = req.params; 
        if (!req.file) {
            return sendResponse(res, 400, false, "Aucun fichier fourni");
        }

        const result = await badgeService.mettreAJourIcone(id, req.file, req.user.id);

        return sendResponse(res, 200, true, "Icône du badge mise à jour", result);
    } catch (error) {
        const status = error.message === "Badge non trouvé" ? 404 : 500;
        return sendResponse(res, status, false, error.message || "Erreur lors de l'upload de l'icône", null, error.message);
    }
};

// ============================================================================
// ATTRIBUTION DES BADGES AUX ÉTUDIANTS
// ============================================================================

export const attribuerBadgeEtudiant = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Attribuer un badge à un étudiant'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'ID de l étudiant à qui attribuer le badge',
            required: true,
            schema: { $ref: '#/definitions/AttributionBadgeRequest' }
    } */
    try {
        const { id } = req.params;           // id_badge
        const { id_etudiant } = req.body;

        if (!id_etudiant) {
            return sendResponse(res, 400, false, 'id_etudiant est requis');
        }

        const attribution = await badgeService.attribuerBadge(id_etudiant, id);
        return sendResponse(res, 201, true, 'Badge attribué à l\'étudiant avec succès', attribution);
    } catch (erreur) {
        if (erreur.code === 'P2002') {
            return sendResponse(res, 409, false, 'Cet étudiant possède déjà ce badge', null, erreur.message);
        }
        return sendResponse(res, 400, false, 'Erreur lors de l\'attribution du badge', null, erreur.message);
    }
};

export const retirerBadgeEtudiant = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Retirer un badge d un étudiant'
    try {
        const { id, id_etudiant } = req.params;
        await badgeService.retirerBadge(id_etudiant, id);
        return sendResponse(res, 200, true, 'Badge retiré de l\'étudiant avec succès');
    } catch (erreur) {
        if (erreur.code === 'P2025') {
            return sendResponse(res, 404, false, 'Attribution non trouvée — cet étudiant ne possède pas ce badge', null, erreur.message);
        }
        return sendResponse(res, 400, false, 'Erreur lors du retrait du badge', null, erreur.message);
    }
};

export const listerBadgesEtudiant = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Lister les badges d un étudiant'
    try {
        const { id_etudiant } = req.params;
        const resultat = await badgeService.recupererBadgesEtudiant(id_etudiant);
        return sendResponse(res, 200, true, 'Badges de l\'étudiant récupérés avec succès', resultat);
    } catch (erreur) {
        return sendResponse(res, 500, false, 'Erreur lors de la récupération des badges', null, erreur.message);
    }
};

export const listerEtudiantsDuBadge = async (req, res) => {
    // #swagger.tags = ['Badges']
    // #swagger.summary = 'Lister les étudiants qui possèdent un badge'
    try {
        const { id } = req.params;
        const resultat = await badgeService.recupererEtudiantsDuBadge(id);
        return sendResponse(res, 200, true, 'Étudiants récupérés avec succès', resultat);
    } catch (erreur) {
        return sendResponse(res, 500, false, 'Erreur lors de la récupération des étudiants', null, erreur.message);
    }
};