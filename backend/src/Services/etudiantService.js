import prisma from "../Config/prismaClient.js";
import * as minioService from "../Utils/minioService.js";

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
 * Enrichit un profil étudiant avec l'URL de sa photo
 */
const enrichirProfil = async (etudiant) => {
    if (etudiant && etudiant.utilisateur && etudiant.utilisateur.photo) {
        etudiant.utilisateur.photo_url = await minioService.getFileUrl(etudiant.utilisateur.photo);
    }
    return etudiant;
};

export const recupererTousLesProfils = async () => {
    const etudiants = await prisma.etudiant.findMany({
        include: {
            utilisateur: UtilisateurSansMotDePasse,
        }
    });
    return await Promise.all(etudiants.map(enrichirProfil));
};

export const recupererParId = async (id_etudiant) => {
    const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant },
        include: {
            utilisateur: UtilisateurSansMotDePasse,
        }
    });
    return await enrichirProfil(etudiant);
};

export const ajouterOuModifierEtudiant = async (id, donnees) => {
    const donneesProfil = {
        numero_etudiant: donnees.numero_etudiant,
        filiere: donnees.filiere,
        annee: donnees.annee ? parseInt(donnees.annee) : null,
        date_naissance: donnees.date_naissance ? new Date(donnees.date_naissance) : null,
        adresse: donnees.adresse,
        ville: donnees.ville,
        pays: donnees.pays || "Maroc",
        biographie: donnees.biographie,
        linkedin_url: donnees.linkedin_url,
        github_username: donnees.github_username,
        site_web: donnees.site_web,
        objectif_professionnel: donnees.objectif_professionnel,
        score_credibilite: donnees.score_credibilite ? parseInt(donnees.score_credibilite) : 0,
        niveau_credibilite: donnees.niveau_credibilite || "DEBUTANT",
        visibilite_profil: donnees.visibilite_profil || "PUBLIC"
    };

    const etudiant = await prisma.etudiant.upsert({
        where: { id_etudiant: id },
        update: donneesProfil,
        create: {
            id_etudiant: id,
            ...donneesProfil
        },
        include: {
            utilisateur: UtilisateurSansMotDePasse,
        }
    });

    return await enrichirProfil(etudiant);
};

export const mettreAJourAvatar = async (id, fichier, userId) => {
    const etudiant = await recupererParId(id);
    if (!etudiant) {
        throw new Error("Étudiant non trouvé");
    }

    // Supprimer l'ancienne photo si elle existe
    if (etudiant.utilisateur && etudiant.utilisateur.photo) {
        try {
            await minioService.deleteFile(etudiant.utilisateur.photo);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien avatar:", error);
            // On continue quand même l'upload du nouveau même si la suppression de l'ancien échoue
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
