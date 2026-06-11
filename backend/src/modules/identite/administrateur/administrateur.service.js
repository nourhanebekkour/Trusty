import prisma from "#Config/prismaClient.js";
import * as minioService from "#Services/minio.service.js";

const UtilisateurSansMotDePasse = {
    select: {
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        photo: true,
        date_creation: true,
        status_compte: true,
        email_verifie: true
    }
};

/**
 * Enrichit un profil administrateur avec l'URL de sa photo
 */
const enrichirProfil = async (admin) => {
    if (admin && admin.utilisateur && admin.utilisateur.photo) {
        admin.utilisateur.photo_url = await minioService.getFileUrl(admin.utilisateur.photo);
    }
    return admin;
};

export const ajouterOuModifierAdmin = async (id, donnees) => {
    const donneesProfil = {
        niveau_acces: donnees.niveau_acces || "ADMIN",
        derniere_action: donnees.derniere_action ? new Date(donnees.derniere_action) : undefined,
    };

    const admin = await prisma.administrateur.upsert({
        where: { id_administrateur: id },
        update: donneesProfil,
        create: {
            id_administrateur: id,
            ...donneesProfil
        },
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });

    return await enrichirProfil(admin);
};

// 1. Afficher tous les admins
export const recupererTousLesAdmins = async () => {
    const admins = await prisma.administrateur.findMany({
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });
    return await Promise.all(admins.map(enrichirProfil));
};

// 2. Afficher un admin par son ID
export const recupererAdminParId = async (id) => {
    const admin = await prisma.administrateur.findUnique({
        where: { id_administrateur: id },
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });
    return await enrichirProfil(admin);
};

export const mettreAJourAvatar = async (id, fichier, userId) => {
    const admin = await recupererAdminParId(id);
    if (!admin) {
        throw new Error("Administrateur non trouvé");
    }

    // Supprimer l'ancienne photo si elle existe
    if (admin.utilisateur && admin.utilisateur.photo) {
        try {
            await minioService.deleteFile(admin.utilisateur.photo);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien avatar:", error);
        }
    }

    const fileRecord = await minioService.uploadAndSaveFile(fichier, userId, 'AVATAR');
    
    await prisma.utilisateur.update({
        where: { id_utilisateur: id },
        data: { photo: fileRecord.nom_stockage }
    });

    return {
        url: fileRecord.url,
        nom_stockage: fileRecord.nom_stockage
    };
};

