import * as portfolioService from './portfolio.service.js';
import sendResponse from '#Utils/response.handler.js';

export const getPublicPortfolio = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Récupérer un portfolio public'
    // #swagger.description = 'Récupère un portfolio public via son URL publique'
    try {
        const { url_publique } = req.params;
        const portfolio = await portfolioService.getPortfolioByUrl(url_publique);

        if (!portfolio) {
            return sendResponse(res, 404, false, "Portfolio introuvable");
        }

        if (!portfolio.est_publie) {
            return sendResponse(res, 404, false, "Portfolio non public");
        }

        await portfolioService.incrementPortfolioViews(portfolio.id_portfolio);
        portfolio.nombre_vues += 1;

        return sendResponse(res, 200, true, "Portfolio récupéré avec succès", portfolio);
    } catch (erreur) {
        console.error("Erreur lors de la récupération du portfolio:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const getTemplates = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Récupérer les modèles actifs'
    // #swagger.description = 'Retourne la liste de tous les modèles de portfolio actifs'
    try {
        const templates = await portfolioService.getActiveTemplates();
        return sendResponse(res, 200, true, "Templates récupérés avec succès", templates);
    } catch (erreur) {
        console.error("Erreur lors de la récupération des templates:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const uploadApercuModele = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Uploader un aperçu pour un modèle'
    // #swagger.description = 'Upload une image d\'aperçu pour un modèle de portfolio (Admin seulement)'
    /* #swagger.consumes = ['multipart/form-data']
       #swagger.parameters['fichier'] = {
           in: 'formData',
           type: 'file',
           required: true,
           description: 'L\'image d\'aperçu à uploader'
       } */
    try {
        const { id_modele } = req.params;
        const fichier = req.file;
        const userId = req.user.id;

        if (!fichier) {
            return sendResponse(res, 400, false, "Aucun fichier fourni.");
        }

        const modele = await portfolioService.uploadApercuModele(id_modele, fichier, userId);

        if (!modele) {
            return sendResponse(res, 404, false, "Modèle introuvable.");
        }

        return sendResponse(res, 200, true, "Aperçu uploadé avec succès", modele);
    } catch (erreur) {
        console.error("Erreur lors de l'upload de l'aperçu du modèle:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const getMyPortfolios = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Récupérer mes portfolios'
    // #swagger.description = 'Récupère la liste de tous les portfolios de l\'étudiant connecté'
    try {
        const userId = req.user.id;
        const portfolios = await portfolioService.getMyPortfolios(userId);
        
        return sendResponse(res, 200, true, "Portfolios récupérés avec succès", portfolios);
    } catch (erreur) {
        console.error("Erreur lors de la récupération de vos portfolios:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const createPortfolio = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Créer un nouveau portfolio'
    // #swagger.description = 'Crée un nouveau portfolio pour l\'étudiant connecté'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            titre_personnalise: "Mon portfolio de développeur",
            sous_titre: "Passionné par le web",
            id_modele: "id_du_modele_ici",
            est_publie: false
        }
    } */
    try {
        const userId = req.user.id;
        
        if (req.body.url_publique) {
            const existing = await portfolioService.getPortfolioByUrl(req.body.url_publique);
            if (existing) {
                return sendResponse(res, 400, false, "Cette URL (username) est déjà prise.");
            }
        }

        const portfolio = await portfolioService.createPortfolio(userId, req.body);
        return sendResponse(res, 201, true, "Portfolio créé avec succès", portfolio);
    } catch (erreur) {
        console.error("Erreur lors de la création du portfolio:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const updatePortfolio = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Mettre à jour un portfolio'
    // #swagger.description = 'Met à jour les informations d\'un portfolio existant'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            titre_personnalise: "Nouveau titre",
            sous_titre: "Nouveau sous-titre",
            id_modele: "nouvel_id_modele",
            url_publique: "nouveau-username-custom"
        }
    } */
    try {
        const userId = req.user.id;
        const { id_portfolio } = req.params;
        
        if (req.body.url_publique) {
            const existing = await portfolioService.getPortfolioByUrl(req.body.url_publique);
            if (existing && existing.id_portfolio !== id_portfolio) {
                return sendResponse(res, 400, false, "Cette URL (username) est déjà prise.");
            }
        }

        const portfolio = await portfolioService.updatePortfolio(id_portfolio, userId, req.body);
        
        if (!portfolio) {
            return sendResponse(res, 404, false, "Portfolio introuvable ou non autorisé.");
        }

        return sendResponse(res, 200, true, "Portfolio mis à jour avec succès", portfolio);
    } catch (erreur) {
        console.error("Erreur lors de la mise à jour du portfolio:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const publishPortfolio = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Publier ou dépublier un portfolio'
    // #swagger.description = 'Modifie la visibilité d\'un portfolio'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            est_publie: true
        }
    } */
    try {
        const userId = req.user.id;
        const { id_portfolio } = req.params;
        const { est_publie } = req.body;
        
        if (est_publie === undefined) {
            return sendResponse(res, 400, false, "Le champ 'est_publie' est requis.");
        }

        const portfolio = await portfolioService.publishPortfolio(id_portfolio, userId, est_publie);
        
        if (!portfolio) {
            return sendResponse(res, 404, false, "Portfolio introuvable ou non autorisé.");
        }

        return sendResponse(res, 200, true, `Portfolio ${est_publie ? 'publié' : 'dépublié'} avec succès`, portfolio);
    } catch (erreur) {
        console.error("Erreur lors du changement de visibilité du portfolio:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};

export const getPortfolioStats = async (req, res) => {
    // #swagger.tags = ['Portfolio']
    // #swagger.summary = 'Statistiques du portfolio'
    // #swagger.description = 'Récupère les statistiques (vues, etc.) d\'un portfolio'
    try {
        const userId = req.user.id;
        const { id_portfolio } = req.params;
        const stats = await portfolioService.getPortfolioStats(id_portfolio, userId);
        
        if (!stats) {
            return sendResponse(res, 404, false, "Portfolio introuvable ou non autorisé.");
        }

        return sendResponse(res, 200, true, "Statistiques récupérées avec succès", stats);
    } catch (erreur) {
        console.error("Erreur lors de la récupération des statistiques:", erreur);
        return sendResponse(res, 500, false, "Erreur serveur", null, erreur.message);
    }
};
