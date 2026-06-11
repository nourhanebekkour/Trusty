import { PrismaClient } from '@prisma/client';
import * as notificationsService from '#Modules/systeme/notifications/notifications.service.js';
import * as minioService from '#Services/minio.service.js';
import { calculerEtMettreAJourScoreCredibilite } from '#Modules/identite/etudiant/etudiant.service.js';

const prisma = new PrismaClient();

// Vérifier que le prof appartient à la même école
const validerEcoleProfesseur = async (id_etudiant, id_professeur) => {
    const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant },
        include: { utilisateur: { select: { ecole: true } } }
    });

    const professeur = await prisma.professeur.findUnique({
        where: { id_professeur },
        include: { utilisateur: { select: { ecole: true } } }
    });

    if (!professeur) {
        throw new Error("Le professeur choisi n'existe pas");
    }

    if (professeur.utilisateur.ecole !== etudiant.utilisateur.ecole) {
        throw new Error(`Le professeur choisi doit appartenir à la même école (${etudiant.utilisateur.ecole})`);
    }

    return { etudiant, professeur };
};

export const demanderLettre = async (id_etudiant, donnees) => {
    const { id_professeur, type_lettre, destinataire, description } = donnees;

    if (!id_professeur || !type_lettre || !destinataire) {
        throw new Error("L'id_professeur, le type_lettre et le destinataire sont requis");
    }

    const { etudiant } = await validerEcoleProfesseur(id_etudiant, id_professeur);

    const msg = `L'étudiant(e) ${etudiant.utilisateur.prenom} ${etudiant.utilisateur.nom} vous a demandé une lettre de recommandation de type ${type_lettre} destinée à ${destinataire}.\nDescription: ${description || "Aucune"}`;

    await notificationsService.creerNotification(
        id_professeur,
        "SUGGESTION",
        "Nouvelle demande de lettre de recommandation",
        msg
    );

    return { message: "Demande envoyée avec succès au professeur." };
};

export const creerLettre = async (id_redacteur, id_etudiant, donnees, fichier) => {
    if (!fichier) {
        throw new Error("Le fichier PDF de la lettre est requis");
    }

    const { type_lettre, destinataire, description } = donnees;

    // Vérifier appartenance
    await validerEcoleProfesseur(id_etudiant, id_redacteur);

    // Upload du fichier sur MinIO
    const fileRecord = await minioService.uploadAndSaveFile(fichier, id_redacteur, 'LETTRE');

    // Création de la lettre dans la DB
    const lettre = await prisma.lettreRecommandation.create({
        data: {
            id_etudiant: id_etudiant,
            id_redacteur: id_redacteur,
            type_lettre: type_lettre,
            destinataire: destinataire,
            description: description,
            id_fichier_pdf: fileRecord.id_fichier
        },
        include: {
            etudiant: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
            fichier_pdf: true
        }
    });

    // Notifier l'étudiant
    await notificationsService.creerNotification(
        id_etudiant,
        "RECOMMANDATION",
        "Nouvelle lettre de recommandation",
        `Un professeur a rédigé une lettre de recommandation (${type_lettre}) pour vous.`
    );

    // Mettre à jour le score de crédibilité
    await calculerEtMettreAJourScoreCredibilite(id_etudiant);

    return await minioService.enrichEntityWithFileUrls(lettre, 'fichier_pdf');
};

export const recupererLettresRecues = async (id_etudiant) => {
    const lettres = await prisma.lettreRecommandation.findMany({
        where: { id_etudiant: id_etudiant },
        include: {
            redacteur: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
            fichier_pdf: true
        },
        orderBy: { date_redaction: "desc" }
    });

    return await minioService.enrichEntitiesWithFileUrls(lettres, 'fichier_pdf');
};

export const recupererLettresEmises = async (id_redacteur) => {
    const lettres = await prisma.lettreRecommandation.findMany({
        where: { id_redacteur: id_redacteur },
        include: {
            etudiant: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
            fichier_pdf: true
        },
        orderBy: { date_redaction: "desc" }
    });

    return await minioService.enrichEntitiesWithFileUrls(lettres, 'fichier_pdf');
};
