import prisma from "../Config/prismaClient.js";

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

    return await prisma.professeur.upsert({
        where: { id_professeur: id },
        update: donneesProfil,
        create: {
            id_professeur: id,
            ...donneesProfil
        },
        include: {
            utilisateur: {
                select: {
                    email: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    date_creation: true,
                    status_compte: true,
                    email_verifie: true

                }
            }
        }
    });
};

// 1. Afficher tous les professeurs
export const recupererTousLesProfesseurs = async () => {
    return await prisma.professeur.findMany({
        include: {
            utilisateur: {
                select: {
                    email: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    date_creation: true,
                    status_compte: true,
                    email_verifie: true
                }
            }
        }
    });
};

// 2. Afficher un professeur par son ID
export const recupererProfesseurParId = async (id) => {
             
    return await prisma.professeur.findUnique({
        where: { id_professeur: id },
        include: {
            utilisateur: {
                select: {
                    email: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    date_creation: true,
                    status_compte: true,
                    email_verifie: true
                }
            },
        }
    });
};
