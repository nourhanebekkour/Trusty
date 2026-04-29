import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const recupererFormationsParEtudiant = async (id_etudiant) => {
    return await prisma.formation.findMany({
        where: { id_etudiant },
        orderBy: { date_debut: 'desc' }
    });
};

export const recupererFormationParId = async (id_formation) => {
    return await prisma.formation.findUnique({
        where: { id_formation }
    });
};

export const ajouterFormation = async (id_etudiant, donnees) => {
    return await prisma.formation.create({
        data: {
            id_etudiant,
            diplome: donnees.diplome,
            etablissement: donnees.etablissement,
            date_debut: new Date(donnees.date_debut),
            date_fin: donnees.date_fin ? new Date(donnees.date_fin) : null,
            description: donnees.description,
            mention: donnees.mention,
            est_actuelle: donnees.est_actuelle || false
        }
    });
};

export const modifierFormation = async (id_formation, donnees) => {
    return await prisma.formation.update({
        where: { id_formation },
        data: {
            ...donnees,
        }
    });
};

export const supprimerFormation = async (id_formation) => {
    return await prisma.formation.delete({
        where: { id_formation }
    });
};
