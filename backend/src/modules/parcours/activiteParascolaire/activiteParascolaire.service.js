import { PrismaClient } from "@prisma/client";
import * as notificationsService from '#Modules/systeme/notifications/notifications.service.js';
import * as minioService from '#Services/minio.service.js';

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
    const { id_etudiant, ...activiteData } = donnees;

    if (!id_etudiant) {
        throw new Error("L'ID de l'étudiant est requis");
    }

    // Pour les activités parascolaires, plus de choix de validateur par l'étudiant.
    // Ce sont les admins de l'école qui s'en occupent.

    const data = {
        ...activiteData,
        id_etudiant,
        id_validateur: null, // Pas de validateur spécifique assigné à la création
        date_debut: new Date(activiteData.date_debut),
        date_fin: activiteData.date_fin ? new Date(activiteData.date_fin) : null,
    };

    const nouvelleActivite = await prisma.activiteParascolaire.create({
        data
    });

    // On pourrait notifier tous les admins de l'école de l'étudiant
    const etudiant = await prisma.utilisateur.findUnique({
        where: { id_utilisateur: id_etudiant },
        select: { ecole: true }
    });

    if (etudiant.ecole) {
        const admins = await prisma.utilisateur.findMany({
            where: {
                role: 'ADMINISTRATEUR',
                ecole: etudiant.ecole
            },
            select: { id_utilisateur: true }
        });

        for (const admin of admins) {
            await notificationsService.creerNotification(
                admin.id_utilisateur, 
                "VALIDATION", 
                "Nouvelle activité à valider", 
                "L'activité \"" + nouvelleActivite.nom_activite + "\" a été soumise par un étudiant de votre école."
            );
        }
    }

    return nouvelleActivite;
};

export const validerActivite = async (id_activite, id_validateur, decision, commentaire) => {
    const activite = await prisma.activiteParascolaire.findUnique({ 
        where: { id_activite },
        include: { 
            etudiant: {
                include: { utilisateur: true }
            }
        }
    });
    if (!activite) throw new Error("Activité non trouvée");

    // Vérifier que le validateur est un ADMIN de la même école que l'étudiant
    const validateur = await prisma.utilisateur.findUnique({
        where: { id_utilisateur: id_validateur }
    });

    if (!validateur || validateur.role !== 'ADMINISTRATEUR') {
        throw new Error("Seul un administrateur peut valider une activité parascolaire");
    }

    if (validateur.ecole !== activite.etudiant.utilisateur.ecole) {
        throw new Error("Vous ne pouvez valider que les activités des étudiants de votre école (" + activite.etudiant.utilisateur.ecole + ")");
    }

    const updateData = {
        status_validation: decision,
        date_validation: new Date(),
        commentaire_validation: commentaire,
        id_validateur: id_validateur
    };

    const activiteMisAJour = await prisma.activiteParascolaire.update({
        where: { id_activite },
        data: updateData
    });

    await notificationsService.creerNotification(
        activiteMisAJour.id_etudiant, 
        "VALIDATION", 
        "Activité " + (decision === "VALIDE" ? "validé" : "rejeté"), 
        "Votre activité \"" + activiteMisAJour.nom_activite + "\" a été " + decision.toLowerCase() + " par l'administration."
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
            etudiant: {
                include: { utilisateur: true }
            },
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
            etudiant: {
                include: { utilisateur: true }
            },
            attestation: true,
            validateur: true
        }
    });

    if (!activite) return null;

    return await minioService.enrichEntityWithFileUrls(activite, 'attestation');
};

export const recupererActivitesAValider = async (id_admin) => {
    // Récupérer l'école de l'admin
    const admin = await prisma.utilisateur.findUnique({
        where: { id_utilisateur: id_admin },
        select: { ecole: true }
    });

    if (!admin || !admin.ecole) {
        return [];
    }

    const activites = await prisma.activiteParascolaire.findMany({
        where: {
            status_validation: "EN_ATTENTE",
            etudiant: {
                utilisateur: {
                    ecole: admin.ecole
                }
            }
        },
        include: {
            etudiant: {
                include: {
                    utilisateur: {
                        select: {
                            nom: true,
                            prenom: true,
                            photo: true,
                            ecole: true
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
