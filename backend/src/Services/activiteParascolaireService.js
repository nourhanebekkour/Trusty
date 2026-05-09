import { PrismaClient } from "@prisma/client";
import * as minioService from '../Utils/minioService.js';

const prisma = new PrismaClient();

// Fonction utilitaire pour vérifier l'accès (Admin ou Propriétaire)
const verifierAccesActivite = async (id_activite, userId, userRole) => {
    const activite = await prisma.activiteParascolaire.findUnique({ 
        where: { id_activite },
        include: { attestation: true }
    });

    if (!activite) throw new Error("Activité non trouvée");

    if (userRole !== 'ADMINISTRATEUR' && activite.id_etudiant !== userId) {
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource");
    }
    return activite;
};

// --- GESTION DES ACTIVITES ---

export const creerActivite = async (donnees) => {
    const data = {
        ...donnees,
        date_debut: new Date(donnees.date_debut),
        date_fin: donnees.date_fin ? new Date(donnees.date_fin) : null,
    };

    return await prisma.activiteParascolaire.create({
        data
    });
};

export const recupererToutesLesActivites = async (filtres = {}) => {
    const activites = await prisma.activiteParascolaire.findMany({
        where: filtres,
        include: {
            etudiant: true,
            attestation: true
        },
        orderBy: { date_debut: 'desc' }
    });

    return await minioService.enrichEntitiesWithFileUrls(activites, 'attestation');
};

export const recupererActiviteParId = async (id_activite) => {
    const activite = await prisma.activiteParascolaire.findUnique({
        where: { id_activite },
        include: {
            etudiant: true,
            attestation: true,
            validateur: true
        }
    });

    if (!activite) return null;

    return await minioService.enrichEntityWithFileUrls(activite, 'attestation');
};

export const recupererActivitesParEtudiant = async (id_etudiant) => {
    const activites = await prisma.activiteParascolaire.findMany({
        where: { id_etudiant },
        include: {
            attestation: true
        },
        orderBy: { date_debut: 'desc' }
    });

    return await minioService.enrichEntitiesWithFileUrls(activites, 'attestation');
};

export const modifierActivite = async (id_activite, donnees, userId, userRole) => {
    await verifierAccesActivite(id_activite, userId, userRole);

    const data = { ...donnees };
    if (data.date_debut) data.date_debut = new Date(data.date_debut);
    if (data.date_fin) data.date_fin = new Date(data.date_fin);

    return await prisma.activiteParascolaire.update({
        where: { id_activite },
        data: data
    });
};

export const associerAttestation = async (id_activite, file, userId, userRole) => {
    const activite = await verifierAccesActivite(id_activite, userId, userRole);

    // Supprimer l'ancienne attestation si elle existe
    if (activite.id_attestation) {
        await minioService.deleteFile(activite.id_attestation);
    }

    const fileRecord = await minioService.uploadAndSaveFile(file, userId, 'ATTESTATION');

    await prisma.activiteParascolaire.update({
        where: { id_activite },
        data: { id_attestation: fileRecord.id_fichier }
    });

    return fileRecord;
};

export const supprimerAttestation = async (id_activite, userId, userRole) => {
    const activite = await verifierAccesActivite(id_activite, userId, userRole);

    if (!activite.id_attestation) {
        throw new Error("Aucune attestation associée à cette activité");
    }

    // Suppression physique du fichier
    await minioService.deleteFile(activite.id_attestation);

    // Détacher l'attestation
    return await prisma.activiteParascolaire.update({
        where: { id_activite },
        data: { id_attestation: null }
    });
};

export const supprimerActivite = async (id_activite, userId, userRole) => {
    const activite = await verifierAccesActivite(id_activite, userId, userRole);

    // Supprimer le fichier si présent
    if (activite.id_attestation) {
        await minioService.deleteFile(activite.id_attestation);
    }

    return await prisma.activiteParascolaire.delete({
        where: { id_activite }
    });
};
