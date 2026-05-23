import prisma from "#Config/prismaClient.js";
import * as notificationsService from '#Modules/systeme/notifications/notifications.service.js';

/**
 * Crée une nouvelle recommandation
 */
export const creerRecommandation = async (id_recommandeur, data) => {
    const { id_etudiant, message } = data;

    const recommandation = await prisma.recommandation.create({
        data: {
            id_recommandeur,
            id_etudiant,
            message,
            status: 'EN_ATTENTE'
        },
        include: {
            auteur: {
                select: { 
                    nom: true, 
                    prenom: true,
                    photo: true,
                    role: true
                }
            }
        }
    });

    // Envoyer une notification à l'étudiant cible
    await notificationsService.creerNotification(
        id_etudiant,
        'RECOMMANDATION',
        'Nouvelle recommandation',
        `Vous avez reçu une nouvelle recommandation de ${recommandation.auteur.prenom} ${recommandation.auteur.nom}`,
        `/profil/${id_etudiant}`
    );

    return recommandation;
};

/**
 * Récupère toutes les recommandations (avec filtres optionnels)
 */
export const recupererRecommandations = async (filtres = {}) => {
    return await prisma.recommandation.findMany({
        where: filtres,
        include: {
            auteur: {
                select: { nom: true, prenom: true, photo: true, role: true }
            },
            cible: {
                include: {
                    utilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            }
        },
        orderBy: { date_creation: 'desc' }
    });
};

/**
 * Récupère une recommandation par son ID
 */
export const recupererRecommandationParId = async (id_recommandation) => {
    return await prisma.recommandation.findUnique({
        where: { id_recommandation },
        include: {
            auteur: {
                select: { nom: true, prenom: true, photo: true, role: true }
            },
            cible: {
                include: {
                    utilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            }
        }
    });
};

/**
 * Valide ou rejette une recommandation
 */
export const validerRecommandation = async (id_recommandation, status) => {
    const recommandation = await prisma.recommandation.update({
        where: { id_recommandation },
        data: { 
            status,
            date_validation: new Date()
        }
    });

    // Optionnel : Envoyer une notification à l'auteur de la recommandation
    await notificationsService.creerNotification(
        recommandation.id_recommandeur,
        'VALIDATION',
        `Recommandation ${status === 'VALIDE' ? 'acceptée' : 'refusée'}`,
        `Votre recommandation pour l'étudiant a été ${status === 'VALIDE' ? 'acceptée et est maintenant visible' : 'refusée'}.`,
        null
    );

    return recommandation;
};

/**
 * Supprime une recommandation
 */
export const supprimerRecommandation = async (id_recommandation) => {
    return await prisma.recommandation.delete({
        where: { id_recommandation }
    });
};

/**
 * Récupère les recommandations validées pour un profil étudiant
 */
export const recupererRecommandationsValidees = async (id_etudiant) => {
    return await recupererRecommandations({ 
        id_etudiant: id_etudiant,
        status: 'VALIDE'
    });
};

/**
 * Récupère toutes les recommandations reçues par un étudiant (validées ou non)
 */
export const recupererRecommandationsRecus = async (id_etudiant) => {
    return await recupererRecommandations({ 
        id_etudiant: id_etudiant
    });
};

