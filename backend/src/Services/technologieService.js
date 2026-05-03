import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const recupererToutesLesTechnologies = async () => {
    return await prisma.technologie.findMany({
        orderBy: { nom: 'asc' }
    });
};

export const recupererTechnologieParId = async (id_technologie) => {
    return await prisma.technologie.findUnique({
        where: { id_technologie }
    });
};

export const creerTechnologie = async (donnees) => {
    return await prisma.technologie.create({
        data: {
            nom: donnees.nom,
            categorie: donnees.categorie,
            sous_categorie: donnees.sous_categorie,
            description: donnees.description,
            icone: donnees.icone
        }
    });
};

export const modifierTechnologie = async (id_technologie, donnees) => {
    return await prisma.technologie.update({
        where: { id_technologie },
        data: donnees
    });
};

export const supprimerTechnologie = async (id_technologie) => {
    return await prisma.technologie.delete({
        where: { id_technologie }
    });
};
