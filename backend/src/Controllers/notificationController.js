import * as notificationService from '../Services/notificationService.js';
import sendResponse from '../Utils/responseHandler.js';

export const listerMesNotifications = async (req, res) => {
    // #swagger.tags = ['Notifications']
    // #swagger.summary = 'Lister les notifications de l utilisateur connecté'
    try {
        const notifications = await notificationService.recupererNotificationsUtilisateur(req.user.id);
        sendResponse(res, 200, true, "Notifications récupérées avec succès", notifications);
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la récupération des notifications", null, erreur.message);
    }
};

export const marquerLue = async (req, res) => {
    // #swagger.tags = ['Notifications']
    // #swagger.summary = 'Marquer une notification comme lue'
    /* #swagger.parameters['id'] = { in: 'path' } */
    try {
        const { id } = req.params;
        await notificationService.marquerCommeLue(id);
        sendResponse(res, 200, true, "Notification marquée comme lue");
    } catch (erreur) {
        sendResponse(res, 500, false, "Erreur lors de la mise à jour de la notification", null, erreur.message);
    }
};
