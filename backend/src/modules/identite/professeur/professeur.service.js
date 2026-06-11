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
 * Enrichit un profil professeur avec l'URL de sa photo
 */
const enrichirProfil = async (professeur) => {
    if (professeur && professeur.utilisateur && professeur.utilisateur.photo) {
        professeur.utilisateur.photo_url = await minioService.getFileUrl(professeur.utilisateur.photo);
    }
    return professeur;
};

export const ajouterOuModifierProfesseur = async (id, donnees) => {
    const donneesProfil = {
        departement: donnees.departement,
        specialite: donnees.specialite,
        date_naissance: donnees.date_naissance ? new Date(donnees.date_naissance) : null,
        adresse: donnees.adresse,
        ville: donnees.ville,
        pays: donnees.pays || "Maroc",
        biographie: donnees.biographie,
        filieres_interv: donnees.filieres || []
    };

    const professeur = await prisma.professeur.upsert({
        where: { id_professeur: id },
        update: donneesProfil,
        create: {
            id_professeur: id,
            ...donneesProfil
        },
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });

    return await enrichirProfil(professeur);
};

// 1. Afficher tous les professeurs
export const recupererTousLesProfesseurs = async () => {
    const professeurs = await prisma.professeur.findMany({
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });
    return await Promise.all(professeurs.map(enrichirProfil));
};

// 2. Afficher un professeur par son ID
export const recupererProfesseurParId = async (id) => {
    const professeur = await prisma.professeur.findUnique({
        where: { id_professeur: id },
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });
    return await enrichirProfil(professeur);
};

// 3. Récupérer les professeurs par filière
export const recupererProfesseursParFiliere = async (filiere) => {
    const professeurs = await prisma.professeur.findMany({
        where: {
            filieres_interv: {
                has: filiere
            }
        },
        include: {
            utilisateur: UtilisateurSansMotDePasse
        }
    });
    return await Promise.all(professeurs.map(enrichirProfil));
};

// 4. Récupérer les professeurs par école
export const recupererProfesseursParEcole = async (ecole) => {
    const professeurs = await prisma.professeur.findMany({
        where: {
            utilisateur: {
                ecole: ecole
            }
        },
        select: {
             id_professeur: true,
            utilisateur: {
                select: {
                    email: true,
                    nom: true,
                    prenom: true,
                    photo: true,

                }
            }
        }
    });
    return await Promise.all(professeurs.map(enrichirProfil));
}

export const mettreAJourAvatar = async (id, fichier, userId) => {
    const professeur = await recupererProfesseurParId(id);
    if (!professeur) {
        throw new Error("Professeur non trouvé");
    }

    // Supprimer l'ancienne photo si elle existe
    if (professeur.utilisateur && professeur.utilisateur.photo) {
        try {
            await minioService.deleteFile(professeur.utilisateur.photo);
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
