import prisma from "../Config/prismaClient.js";

/**
 * Récupérer tous les utilisateurs
 */
export const recupererTousLesUtilisateurs = async () => {
    return await prisma.utilisateur.findMany({
        select: {
            id_utilisateur: true,
            email: true,
            nom: true,
            prenom: true,
            telephone: true,
            photo: true,
            role: true,
            status_compte: true,
            date_creation: true,
            derniere_connexion: true,
            email_verifie: true
        },
        orderBy: {
            date_creation: 'desc'
        }
    });
};

/**
 * Récupérer un utilisateur par son ID avec ses profils liés
 */
export const recupererUtilisateurParId = async (id) => {
    return await prisma.utilisateur.findUnique({
        where: { id_utilisateur: id },
        include: {
            etudiant: true,
            professeur: true,
            administrateur: true,
            professionnel: true
        }
    });
};

/**
 * Modifier le rôle d'un utilisateur
 */
export const modifierRole = async (id, nouveauRole) => {
    return await prisma.utilisateur.update({
        where: { id_utilisateur: id },
        data: { role: nouveauRole },
        select: {
            id_utilisateur: true,
            email: true,
            role: true
        }
    });
};

/**
 * Modifier le statut du compte d'un utilisateur
 */
export const modifierStatut = async (id, nouveauStatut) => {
    return await prisma.utilisateur.update({
        where: { id_utilisateur: id },
        data: { status_compte: nouveauStatut },
        select: {
            id_utilisateur: true,
            email: true,
            status_compte: true
        }
    });
};

/**
 * Supprimer un utilisateur (la suppression en cascade gère les profils liés)
 */
export const supprimerUtilisateur = async (id) => {
    return await prisma.utilisateur.delete({
        where: { id_utilisateur: id }
    });
};
