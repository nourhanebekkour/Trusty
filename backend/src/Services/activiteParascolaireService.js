import { PrismaClient } from "@prisma/client";
import * as notificationService from './notificationService.js';
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
    const { id_etudiant, id_validateur, ...activiteData } = donnees;

    if (!id_etudiant) {
        throw new Error("L'ID de l'étudiant est requis");
    }

    // Vérification de la filière si un validateur est choisi
    if (id_validateur) {
        const etudiant = await prisma.etudiant.findUnique({
            where: { id_etudiant },
            select: { filiere: true }
        });

        const professeur = await prisma.professeur.findUnique({
            where: { id_professeur: id_validateur },
            select: { filieres_interv: true }
        });

        if (!professeur) {
            throw new Error("Le professeur choisi n'existe pas");
        }

        if (!professeur.filieres_interv.includes(etudiant.filiere)) {
            throw new Error("Le professeur choisi n'intervient pas dans la filière " + etudiant.filiere);
        }
    }

    const data = {
        ...activiteData,
        id_etudiant,
        id_validateur,
        date_debut: new Date(activiteData.date_debut),
        date_fin: activiteData.date_fin ? new Date(activiteData.date_fin) : null,
    };

    const nouvelleActivite = await prisma.activiteParascolaire.create({
        data
    });

    if (id_validateur) {
        await notificationService.creerNotification(
            id_validateur, 
            "VALIDATION", 
            "Nouvelle activité à valider", 
            "L'activité \"" + nouvelleActivite.nom_activite + "\" attend votre validation."
        );
    }

    return nouvelleActivite;
};

export const validerActivite = async (id_activite, id_validateur, decision, commentaire) => {
    const activite = await prisma.activiteParascolaire.findUnique({ where: { id_activite } });
    if (!activite) throw new Error("Activité non trouvée");

    if (activite.id_validateur !== id_validateur) {
        throw new Error("Vous n'êtes pas le validateur désigné pour cette activité");
    }

    const updateData = {
        status_validation: decision,
        date_validation: new Date(),
        commentaire_validation: commentaire
    };

    const activiteMisAJour = await prisma.activiteParascolaire.update({
        where: { id_activite },
        data: updateData
    });

    await notificationService.creerNotification(
        activiteMisAJour.id_etudiant, 
        "VALIDATION", 
        "Activité " + (decision === "VALIDE" ? "validé" : "rejeté"), 
        "Votre activité \"" + activiteMisAJour.nom_activite + "\" a été " + decision.toLowerCase() + "."
    );

    // Créer un historique
    await prisma.historiqueValidation.create({
        data: {
            type_entite: 'ACTIVITE',
            id_entite: id_activite,
            status_validation: decision,
            date_soumission: activite.date_soumission,
            date_decision: new Date(),
            commentaires: commentaire,
            id_validateur: id_validateur
        }
    });

    return activiteMisAJour;
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

export const recupererActivitesAValider = async (id_professeur) => {
    const activites = await prisma.activiteParascolaire.findMany({
        where: {
            id_validateur: id_professeur,
            status_validation: "EN_ATTENTE"
        },
        include: {
            etudiant: {
                include: {
                    utilisateur: {
                        select: {
                            nom: true,
                            prenom: true,
                            photo: true
                        }
                    }
                }
            },
            attestation: true
        },
        orderBy: { date_soumission: "asc" }
    });

    return await minioService.enrichEntitiesWithFileUrls(activites, "attestation");
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
