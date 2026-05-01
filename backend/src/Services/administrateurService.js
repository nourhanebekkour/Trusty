import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const ajouterOuModifierAdmin = async (id, donnees) => {
    const donneesProfil = {
      niveau_acces: donnees.niveau_acces || "ADMIN",
        derniere_action: donnees.derniere_action ? new Date(donnees.derniere_action) : undefined,
    };

    return await prisma.administrateur.upsert({
        where: { id_administrateur: id },
        update:  donneesProfil,
        create: {
            id_administrateur: id,
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

// 1. Afficher tous les admins
export const recupererTousLesAdmins = async () => {
    return await prisma.administrateur.findMany({
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

// 2. Afficher un admin par son ID
export const recupererAdminParId = async (id) => {
             
    return await prisma.administrateur.findUnique({
        where: { id_administrateur: id },
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

