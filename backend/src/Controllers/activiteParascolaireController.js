import * as activiteParascolaireService from '../Services/activiteParascolaireService.js';
import sendResponse from '../Utils/responseHandler.js';

export const creerActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Créer une nouvelle activité'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de l activité',
            required: true,
            schema: { $ref: '#/definitions/ActiviteRequest' }
    } */
    try {
        const donnees = {
            ...req.body,
            date_debut: new Date(req.body.date_debut),
            date_fin: req.body.date_fin ? new Date(req.body.date_fin) : null,
        };

        const nouvelleActivite = await activiteParascolaireService.creerActivite(donnees);
        sendResponse(res, 201, true, "Activité créee avec succès", nouvelleActivite);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la création de l'activité", null, erreur.message);
    }

};

export const listerActivites = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Lister toutes les activités'
    try {
        const activites = await activiteParascolaireService.recupererToutesLesActivites(req.query);
        sendResponse(res, 200, true, "Activités récupérées avec succès", activites);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des activités", null, erreur.message);
    }
}

export const obtenirActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Obtenir une activité par ID'
    try {
        const { id } = req.params;
        const activite = await activiteParascolaireService.recupererActiviteParId(id);
        if (!activite) {
            return sendResponse(res, 404, false, "Activité non trouvée");
        }
        sendResponse(res, 200, true, "Activité récupérée avec succès", activite);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération de l'activité", null, erreur.message);
    }
};

export const listerActivitesParEtudiant = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Lister les activités d un étudiant'
    try {
        const { id_etudiant } = req.params;
        const activites = await activiteParascolaireService.recupererActivitesParEtudiant(id_etudiant);
        sendResponse(res, 200, true, "Activités récupérées avec succès", activites);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des activités", null, erreur.message);
    }
};

export const modifierActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Modifier une activité existante'
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations de l activité à modifier',
            required: true,
            schema: { $ref: '#/definitions/ActiviteRequest' }
    } */
    try {
        const { id } = req.params;
        const donnees = { ...req.body };
        if (donnees.date_debut) donnees.date_debut = new Date(donnees.date_debut);
        if (donnees.date_fin) donnees.date_fin = new Date(donnees.date_fin);

        const activiteModifiee = await activiteParascolaireService.modifierActivite(id, donnees);
        sendResponse(res, 200, true, "Activité modifiée avec succès", activiteModifiee);
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la modification de l'activité", null, erreur.message);
    }
};

export const supprimerActivite = async (req, res) => {
    // #swagger.tags = ['Activités Parascolaires']
    // #swagger.summary = 'Supprimer une activité'
    try {
        const { id } = req.params;
        await activiteParascolaireService.supprimerActivite(id);
        sendResponse(res, 200, true, "Activité supprimée avec succès");
    } catch (erreur) {
        sendResponse(res, 400, false, "Erreur lors de la suppression de l'activité", null, erreur.message);
    }
};