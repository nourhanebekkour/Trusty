import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const UtilisateurSansMotDePasse = {
    select: {
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        date_creation: true,
        status_compte: true,
        email_verifie: true
    }
};

export const recupererTousLesProfils = async () => {
    return await prisma.etudiant.findMany({
        include: {
            utilisateur: UtilisateurSansMotDePasse,
        }
    });
};

export const recupererParId = async (id_etudiant) => {
    return await prisma.etudiant.findUnique({
        where: { id_etudiant },
        include: {
            utilisateur: selectUtilisateurSansMotDePasse,

        }
    });
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

    return await prisma.etudiant.upsert({
        where: { id_etudiant: id },
        update: donneesProfil,
        create: {
            id_etudiant: id,
            ...donneesProfil
        },
        include: {
            utilisateur: selectUtilisateurSansMotDePasse,
        }
    });
};
