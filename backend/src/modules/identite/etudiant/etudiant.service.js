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

export const recupererEtudiantsParEcole = async (ecole) => {
    const etudiants = await prisma.etudiant.findMany({
        where: {
            utilisateur: {
                ecole: ecole
            }
        },
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

/**
 * Calcule et met à jour le score et le niveau de crédibilité de l'étudiant
 * - Projet validé: 10 pts
 * - Stage validé: 20 pts
 * - Recommandation validée: 5 pts
 * - Lettre de recommandation: 15 pts
 * - Badge: 10 pts
 * - Activité parascolaire validée: 5 pts
 */
export const calculerEtMettreAJourScoreCredibilite = async (id_etudiant) => {
    const etudiantExiste = await prisma.etudiant.findUnique({ where: { id_etudiant } });
    if (!etudiantExiste) throw new Error("Étudiant non trouvé");

    // Projets validés
    const projetsValidesCount = await prisma.participationProjet.count({
        where: {
            id_etudiant: id_etudiant,
            projet: { status_validation: 'VALIDE' }
        }
    });

    // Stages validés
    const stagesValidesCount = await prisma.stage.count({
        where: {
            id_etudiant: id_etudiant,
            status_validation: 'VALIDE'
        }
    });

    // Recommandations validées
    const recommandationsValideesCount = await prisma.recommandation.count({
        where: {
            id_etudiant: id_etudiant,
            status: 'VALIDE'
        }
    });

    // Lettres de recommandation
    const lettresCount = await prisma.lettreRecommandation.count({
        where: { id_etudiant: id_etudiant }
    });

    // Badges
    const badgesCount = await prisma.etudiantBadge.count({
        where: { id_etudiant: id_etudiant }
    });

    // Activités parascolaires validées
    const activitesValideesCount = await prisma.activiteParascolaire.count({
        where: {
            id_etudiant: id_etudiant,
            status_validation: 'VALIDE'
        }
    });

    // Calcul des "points d'expérience" (XP) bruts
    const xpTotal = 
        (projetsValidesCount * 10) +
        (stagesValidesCount * 15) +
        (recommandationsValideesCount * 1) +
        (lettresCount * 10) +
        (badgesCount * 5) +
        (activitesValideesCount * 5);

    // Calcul non-linéaire du score : Racine carrée
    // Au début, le score monte vite, puis il devient de plus en plus difficile d'augmenter le score.
    // Sans plafond : le score peut monter indéfiniment.
    const scoreTotal = Math.min(100, Math.floor(5 * Math.sqrt(xpTotal)));

    // Détermination du niveau
    let niveau = 'DEBUTANT';
    if (scoreTotal >= 90) {
        niveau = 'EXPERT';
    } else if (scoreTotal >= 75) {
        niveau = 'AVANCE';
    } else if (scoreTotal >= 50) {
        niveau = 'INTERMEDIAIRE';
    }

    // Mise à jour en base
    await prisma.etudiant.update({
        where: { id_etudiant },
        data: {
            score_credibilite: scoreTotal,
            niveau_credibilite: niveau
        }
    });

    return { score: scoreTotal, niveau: niveau, xp: xpTotal };
};
