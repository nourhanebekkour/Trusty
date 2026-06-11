import prisma from "#Config/prismaClient.js";
import * as notificationsService from '#Modules/systeme/notifications/notifications.service.js';

/**
 * Crée un nouveau commentaire
 */
export const creerCommentaire = async (id_auteur, data) => {
    const { id_etudiant_cible, id_projet_cible, id_competence_cible, type_cible, contenu } = data;

    const commentaire = await prisma.commentaire.create({
        data: {
            id_auteur,
            id_etudiant_cible,
            id_projet_cible,
            id_competence_cible,
            type_cible,
            contenu,
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
        id_etudiant_cible,
        'COMMENTAIRE',
        'Nouveau commentaire',
        `Vous avez reçu un nouveau commentaire de ${commentaire.auteur.prenom} ${commentaire.auteur.nom}`,
        id_projet_cible ? `/projets/${id_projet_cible}` : `/profil/${id_etudiant_cible}`
    );

    return commentaire;
};

/**
 * Récupère tous les commentaires (avec filtres optionnels)
 */
export const recupererCommentaires = async (filtres = {}) => {
    return await prisma.commentaire.findMany({
        where: filtres,
        include: {
            auteur: {
                select: { nom: true, prenom: true, photo: true, role: true }
            },
            projet: {
                select: { titre: true }
            }
        },
        orderBy: { date_creation: 'desc' }
    });
};

/**
 * Récupère un commentaire par son ID
 */
export const recupererCommentaireParId = async (id_commentaire) => {
    return await prisma.commentaire.findUnique({
        where: { id_commentaire },
        include: {
            auteur: {
                select: { nom: true, prenom: true, photo: true, role: true }
            },
            projet: {
                select: { titre: true }
            }
        }
    });
};

/**
 * Valide ou rejette un commentaire
 */
export const validerCommentaire = async (id_commentaire, status) => {
    const commentaire = await prisma.commentaire.update({
        where: { id_commentaire },
        data: { 
            status,
            date_validation: new Date()
        }
    });

    // Optionnel : Envoyer une notification à l'auteur du commentaire
    await notificationsService.creerNotification(
        commentaire.id_auteur,
        'VALIDATION',
        `Commentaire ${status === 'VALIDE' ? 'approuvé' : 'rejeté'}`,
        `Votre commentaire a été ${status === 'VALIDE' ? 'approuvé et est maintenant visible' : 'rejeté'}.`,
        null
    );

    return commentaire;
};

/**
 * Supprime un commentaire
 */
export const supprimerCommentaire = async (id_commentaire) => {
    return await prisma.commentaire.delete({
        where: { id_commentaire }
    });
};

/**
 * Récupère les commentaires pour un projet spécifique (validés)
 */
export const recupererCommentairesProjetValidees = async (id_projet) => {
    return await recupererCommentaires({ 
        id_projet_cible: id_projet,
        status: 'VALIDE'
    });
};

/**
 * Récupère les commentaires pour un profil étudiant (validés)
 */
export const recupererCommentairesProfilValidees = async (id_etudiant) => {
    return await recupererCommentaires({ 
        id_etudiant_cible: id_etudiant,
        type_cible: 'PROFIL',
        status: 'VALIDE'
    });
};

/**
 * Récupère tous les commentaires reçus par un étudiant (validés ou non)
 */
export const recupererCommentairesRecus = async (id_etudiant) => {
    return await recupererCommentaires({ 
        id_etudiant_cible: id_etudiant
    });
};

/**
 * Récupère tous les commentaires pour un projet (Admin/Propriétaire)
 */
export const recupererCommentairesProjet = async (id_projet) => {
    return await recupererCommentaires({ 
        id_projet_cible: id_projet,
    });
};

/**
 * Récupère tous les commentaires pour un profil (Admin/Propriétaire)
 */
export const recupererCommentairesProfil = async (id_etudiant) => {
    return await recupererCommentaires({ 
        id_etudiant_cible: id_etudiant,
        type_cible: 'PROFIL',
    });
};
