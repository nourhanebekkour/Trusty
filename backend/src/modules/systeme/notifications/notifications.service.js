import prisma from "#Config/prismaClient.js";

/**
 * Crée une notification pour un utilisateur
 */
export const creerNotification = async (id_destinataire, type, titre, message, lien_action = null) => {
    try {
        return await prisma.notification.create({
            data: {
                id_destinataire,
                type_notification: type,
                titre,
                message,
                lien_action
            }
        });
    } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
        return null;
    }
};

/**
 * Récupère les notifications d'un utilisateur
 */
export const recupererNotificationsUtilisateur = async (id_utilisateur) => {
    return await prisma.notification.findMany({
        where: { id_destinataire: id_utilisateur },
        orderBy: { date_creation: 'desc' }
    });
};

/**
 * Marque une notification comme lue
 */
export const marquerCommeLue = async (id_notification) => {
    return await prisma.notification.update({
        where: { id_notification },
        data: { 
            est_lue: true,
            date_lecture: new Date()
        }
    });
};
