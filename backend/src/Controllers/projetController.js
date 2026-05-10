import * as projetService from '../Services/projetService.js';
import sendResponse from '../Utils/responseHandler.js';

// --- GESTION DES PROJETS ---

export const creerProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Créer un nouveau projet'
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du projet à créer',
        required: true,
        schema: { $ref: '#/definitions/ProjetRequest' }
    } */
    try {
        const donnees = {
            ...req.body,
            id_etudiant: req.user.id
        };
        const nouveauProjet = await projetService.creerProjet(donnees);
        sendResponse(res, 201, true, "Projet créé avec succès", nouveauProjet);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la création du projet", null, erreur.message);
    }
};

export const listerProjets = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Lister tous les projets'
    try {
        const projetsAvecUrls = await projetService.recupererTousLesProjets(req.query);
        sendResponse(res, 200, true, "Projets récupérés avec succès", projetsAvecUrls);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des projets", null, erreur.message);
    }
};

export const obtenirProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Obtenir un projet par ID'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du projet à récupérer'
    } */
    try {
        const { id } = req.params;
        const projet = await projetService.recupererProjetParId(id);
        if (!projet) {
            return sendResponse(res, 404, false, "Projet non trouvé");
        }
        sendResponse(res, 200, true, "Projet récupéré avec succès", projet);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération du projet", null, erreur.message);
    }
};

export const modifierProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Modifier un projet existant'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du projet à modifier'
    } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du projet à modifier',
        required: true,
        schema: { $ref: '#/definitions/ProjetRequest' }
    } */
    try {
        const { id } = req.params;
        const projetModifie = await projetService.modifierProjet(id, req.body, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Projet modifié avec succès", projetModifie);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la modification du projet", null, erreur.message);
    }
};

export const supprimerProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Supprimer un projet'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du projet à supprimer'
    } */
    try {
        const { id } = req.params;
        await projetService.supprimerProjet(id, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Projet supprimé avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : (erreur.message === "Projet non trouvé" ? 404 : 400);
        sendResponse(res, status, false, "Erreur lors de la suppression du projet", null, erreur.message);
    }
};

// --- GESTION DES FICHIERS DU PROJET ---

export const ajouterFichierAuProjet = async (req, res) => {
    // #swagger.tags = ['Projets - Fichiers']
    // #swagger.summary = 'Ajouter un fichier à un projet'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du projet auquel ajouter le fichier'
    } */
    /* #swagger.parameters['fichier'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Fichier à ajouter au projet',
    } */
    try {
        const { id } = req.params;
        if (!req.file) {
            return sendResponse(res, 400, false, "Aucun fichier fourni");
        }

        const userId = req.user.id;
        const category = 'PROJET';

        const fileRecord = await projetService.ajouterFichier(id, req.file, userId, req.user.role, category);
        sendResponse(res, 201, true, "Fichier ajouté au projet avec succès", fileRecord);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : (erreur.message === "Projet non trouvé" ? 404 : 500);
        sendResponse(res, status, false, "Erreur lors de l'ajout du fichier au projet", null, erreur.message);
    }
};

export const listerFichiersDuProjet = async (req, res) => {
    // #swagger.tags = ['Projets - Fichiers']
    // #swagger.summary = 'Lister les fichiers d un projet'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du projet dont lister les fichiers'
    } */
    try {
        const { id } = req.params;
        const fichiersAvecUrls = await projetService.listerFichiers(id);
        sendResponse(res, 200, true, "Fichiers du projet récupérés avec succès", fichiersAvecUrls);
    } catch (erreur) {
        const status = erreur.message === "Projet non trouvé" ? 404 : 500;
        sendResponse(res, status, false, "Erreur lors de la récupération des fichiers du projet", null, erreur.message);
    }
};

export const supprimerFichierDuProjet = async (req, res) => {
    // #swagger.tags = ['Projets - Fichiers']
    // #swagger.summary = 'Supprimer un fichier d un projet'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID du projet'
    } */
    /* #swagger.parameters['id_fichier'] = {
        in: 'path',
        description: 'ID du fichier'
    } */
    try {
        const { id, id_fichier } = req.params;
        await projetService.supprimerFichier(id, id_fichier, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Fichier supprimé du projet avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : (erreur.message.includes("non trouvé") ? 404 : 400);
        sendResponse(res, status, false, "Erreur lors de la suppression du fichier", null, erreur.message);
    }
};

// --- GESTION DES PARTICIPATIONS AU PROJET ---

export const ajouterParticipant = async (req, res) => {
    // #swagger.tags = ['Participations Projets']
    // #swagger.summary = 'Ajouter un étudiant comme participant à un projet'
    /* #swagger.parameters['id_projet'] = {
        in: 'path',
        description: 'ID du projet auquel ajouter the participant'
    } */
    /* #swagger.parameters['id_etudiant'] = {
        in: 'path',
        description: 'ID de l\'étudiant à ajouter comme participant'
    } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données du participant (ex: rôle dans le projet)',
        required: true,
        schema: { $ref: '#/definitions/ParticipationProjetRequest' }
     } */
    try {
        const { id_projet ,id_etudiant} = req.params;
        const participant = await projetService.ajouterParticipant(id_projet, id_etudiant, req.body, req.user.id, req.user.role);
        sendResponse(res, 201, true, "Participant ajouté avec succès", participant);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de l'ajout du participant", null, erreur.message);
    }
};

export const modifierParticipant = async (req, res) => {
    // #swagger.tags = ['Participations Projets']
    // #swagger.summary = 'Modifier le rôle d un participant dans un projet'
    /* #swagger.parameters['id_projet'] = {
        in: 'path',
        description: 'ID du projet du participant à modifier'
    } */
    /* #swagger.parameters['id_etudiant'] = {
        in: 'path',
        description: 'ID de l\'étudiant participant à modifier'
    } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données à modifier pour le participant (ex: rôle dans le projet)',
        required: true,
        schema: { $ref: '#/definitions/ParticipationProjetRequest' }
     } */
    try {
        const { id_projet, id_etudiant } = req.params;
        const participantModifie = await projetService.modifierParticipant(id_projet, id_etudiant, req.body, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Participation modifiée avec succès", participantModifie);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la modification du participant", null, erreur.message);
    }
};

export const retirerParticipant = async (req, res) => {
    // #swagger.tags = ['Participations Projets']
    // #swagger.summary = 'Retirer un participant d un projet'
    /* #swagger.parameters['id_projet'] = {
        in: 'path',
        description: 'ID du projet du participant à retirer'
    } */
    /* #swagger.parameters['id_etudiant'] = {
        in: 'path',
        description: 'ID de l\'étudiant participant à retirer'
    } */
    try {
        const { id_projet, id_etudiant } = req.params;
        await projetService.retirerParticipant(id_projet, id_etudiant, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Participant retiré avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors du retrait du participant", null, erreur.message);
    }
};

// --- GESTION DES TECHNOLOGIES DU PROJET ---

export const ajouterTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Projets']
    // #swagger.summary = 'Ajouter une technologie à un projet'
    /* #swagger.parameters['id_projet'] = {
        in: 'path',
        description: 'ID du projet auquel ajouter la technologie'
    } */
    /* #swagger.parameters['id_technologie'] = {
        in: 'path',
        description: 'ID de la technologie à ajouter au projet'
    } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données de la technologie pour le projet (ex: niveau d\'utilisation)',
        required: true,
        schema: { $ref: '#/definitions/ProjetTechnologieRequest' }
     } */
    try {
        const { id_projet, id_technologie } = req.params;
        const technologie = await projetService.ajouterTechnologieProjet(id_projet, id_technologie, req.body, req.user.id, req.user.role);
        sendResponse(res, 201, true, "Technologie ajoutée au projet avec succès", technologie);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de l'ajout de la technologie", null, erreur.message);
    }
};

export const modifierTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Projets']
    // #swagger.summary = 'Modifier l utilisation d une technologie dans un projet'
    /* #swagger.parameters['id_projet'] = {
        in: 'path',
        description: 'ID du projet de la technologie à modifier'
    } */
    /* #swagger.parameters['id_technologie'] = {
        in: 'path',
        description: 'ID de la technologie à modifier dans le projet'
    } */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Données à modifier pour la technologie dans le projet (ex: niveau d\'utilisation)',
        required: true,
        schema: { $ref: '#/definitions/ProjetTechnologieRequest' }
     } */
    try {
        const { id_projet, id_technologie } = req.params;
        const technologieModifiee = await projetService.modifierTechnologieProjet(id_projet, id_technologie, req.body, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Technologie du projet modifiée avec succès", technologieModifiee);
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors de la modification de la technologie", null, erreur.message);
    }
};

export const retirerTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Projets']
    // #swagger.summary = 'Retirer une technologie d un projet'
    /* #swagger.parameters['id_projet'] = {
        in: 'path',
        description: 'ID du projet de la technologie à retirer'
    } */
    /* #swagger.parameters['id_technologie'] = {
        in: 'path',
        description: 'ID de la technologie à retirer du projet'
    } */
    try {
        const { id_projet, id_technologie } = req.params;
        await projetService.retirerTechnologieProjet(id_projet, id_technologie, req.user.id, req.user.role);
        sendResponse(res, 200, true, "Technologie retirée du projet avec succès");
    } catch (erreur) {
        const status = erreur.message.includes("autorisé") ? 403 : 400;
        sendResponse(res, status, false, "Erreur lors du retrait de la technologie", null, erreur.message);
    }
};
