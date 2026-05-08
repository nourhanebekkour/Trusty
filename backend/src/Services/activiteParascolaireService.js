import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- GESTION DES ACTIVITES ---

export const creerActivite = async (donnees) => {
    return await prisma.activiteParascolaire.create({
        data: donnees
    });
};

export const recupererToutesLesActivites = async (filtres = {}) => {
    return await prisma.activiteParascolaire.findMany({
        where: filtres,
        include: {
            etudiant: true
        },
        orderBy: { date_debut: 'desc' }
    });
};

export const recupererActiviteParId = async (id_activite) => {
    return await prisma.activiteParascolaire.findUnique({
        where: { id_activite },
        include: {
            etudiant: true,
            attestation: true,
            validateur: true
        }
    });
};

export const recupererActivitesParEtudiant = async (id_etudiant) => {
    return await prisma.activiteParascolaire.findMany({
        where: { id_etudiant },
        include: {
            attestation: true
        },
        orderBy: { date_debut: 'desc' }
    });
};

export const modifierActivite = async (id_activite, donnees) => {
    return await prisma.activiteParascolaire.update({
        where: { id_activite },
        data: donnees
    });
};

export const supprimerActivite = async (id_activite) => {
    return await prisma.activiteParascolaire.delete({
        where: { id_activite }
    });
};