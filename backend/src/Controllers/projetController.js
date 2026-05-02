import * as projetService from '../Services/projetService.js';
import sendResponse from '../Utils/responseHandler.js';

// --- GESTION DES PROJETS ---

export const creerProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Créer un nouveau projet'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations du projet',
            required: true,
            schema: { $ref: '#/definitions/ProjetRequest' }
    } */
    try {
        const donnees = {
            ...req.body,
            date_debut: new Date(req.body.date_debut),
            date_fin: req.body.date_fin ? new Date(req.body.date_fin) : null,
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
        const projets = await projetService.recupererTousLesProjets(req.query);
        sendResponse(res, 200, true, "Projets récupérés avec succès", projets);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des projets", null, erreur.message);
    }
};

export const obtenirProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Obtenir un projet par ID'
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
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations du projet à modifier',
            required: true,
            schema: { $ref: '#/definitions/ProjetRequest' }
    } */
    try {
        const { id } = req.params;
        const donnees = { ...req.body };
        if (donnees.date_debut) donnees.date_debut = new Date(donnees.date_debut);
        if (donnees.date_fin) donnees.date_fin = new Date(donnees.date_fin);

        const projetModifie = await projetService.modifierProjet(id, donnees);
        sendResponse(res, 200, true, "Projet modified avec succès", projetModifie);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la modification du projet", null, erreur.message);
    }
};

export const supprimerProjet = async (req, res) => {
    // #swagger.tags = ['Projets']
    // #swagger.summary = 'Supprimer un projet'
    try {
        const { id } = req.params;
        await projetService.supprimerProjet(id);
        sendResponse(res, 200, true, "Projet supprimé avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la suppression du projet", null, erreur.message);
    }
};

// --- GESTION DES PARTICIPATIONS AU PROJET ---

export const ajouterParticipant = async (req, res) => {
    // #swagger.tags = ['Participations Projets']
    // #swagger.summary = 'Ajouter un étudiant comme participant à un projet'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de la participation',
            required: true,
            schema: { $ref: '#/definitions/ParticipationProjetRequest' }
    } */
    try {
        const { id_projet ,id_etudiant} = req.params;
        const donnees = {
            ...req.body,
            date_debut: new Date(req.body.date_debut),
            date_fin: req.body.date_fin ? new Date(req.body.date_fin) : null,
        };
        const participant = await projetService.ajouterParticipant(id_projet, id_etudiant, donnees);
        sendResponse(res, 201, true, "Participant ajouté avec succès", participant);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de l'ajout du participant", null, erreur.message);
    }
};

export const modifierParticipant = async (req, res) => {
    // #swagger.tags = ['Participations Projets']
    // #swagger.summary = 'Modifier le rôle d un participant dans un projet'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de la participation à modifier',
            required: true,
            schema: { $ref: '#/definitions/ParticipationProjetRequest' }
    } */
    try {
        const { id_projet, id_etudiant } = req.params;
        const donnees = { ...req.body };
        if (donnees.date_debut) donnees.date_debut = new Date(donnees.date_debut);
        if (donnees.date_fin) donnees.date_fin = new Date(donnees.date_fin);
        const participantModifie = await projetService.modifierParticipant(id_projet, id_etudiant, donnees);
        sendResponse(res, 200, true, "Participation modifiée avec succès", participantModifie);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la modification du participant", null, erreur.message);
    }
};

export const retirerParticipant = async (req, res) => {
    // #swagger.tags = ['Participations Projets']
    // #swagger.summary = 'Retirer un participant d un projet'
    try {
        const { id_projet, id_etudiant } = req.params;
        await projetService.retirerParticipant(id_projet, id_etudiant);
        sendResponse(res, 200, true, "Participant retiré avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors du retrait du participant", null, erreur.message);
    }
};

// --- GESTION DES TECHNOLOGIES DU PROJET ---

export const ajouterTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Projets']
    // #swagger.summary = 'Ajouter une technologie à un projet'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de l utilisation de la technologie',
            required: true,
            schema: { $ref: '#/definitions/ProjetTechnologieRequest' }
    } */
    try {
        const { id_projet, id_technologie } = req.params;
        const technologie = await projetService.ajouterTechnologieProjet(id_projet, id_technologie, req.body);
        sendResponse(res, 201, true, "Technologie ajoutée au projet avec succès", technologie);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de l'ajout de la technologie", null, erreur.message);
    }
};

export const modifierTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Projets']
    // #swagger.summary = 'Modifier l utilisation d une technologie dans un projet'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de l utilisation de la technologie à modifier',
            required: true,
            schema: { $ref: '#/definitions/ProjetTechnologieRequest' }
    } */
    try {
        const { id_projet, id_technologie } = req.params;
        const technologieModifiee = await projetService.modifierTechnologieProjet(id_projet, id_technologie, req.body);
        sendResponse(res, 200, true, "Technologie du projet modifiée avec succès", technologieModifiee);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la modification de la technologie", null, erreur.message);
    }
};

export const retirerTechnologie = async (req, res) => {
    // #swagger.tags = ['Technologies Projets']
    // #swagger.summary = 'Retirer une technologie d un projet'
    try {
        const { id_projet, id_technologie } = req.params;
        await projetService.retirerTechnologieProjet(id_projet, id_technologie);
        sendResponse(res, 200, true, "Technologie retirée du projet avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors du retrait de la technologie", null, erreur.message);
    }
};
