import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- SERVICES CATALOGUE ---

export const recupererToutesLesCompetences = async () => {
    return await prisma.competence.findMany({
        orderBy: { nom: 'asc' }
    });
};

export const recupererCompetenceParId = async (id_competence) => {
    return await prisma.competence.findUnique({
        where: { id_competence }
    });
};

export const creerCompetence = async (donnees) => {
    return await prisma.competence.create({
        data: {
            nom: donnees.nom,
            type: donnees.type,
            categorie: donnees.categorie,
            description: donnees.description,
            icone: donnees.icone
        }
    });
};

export const modifierCompetence = async (id_competence, donnees) => {
    return await prisma.competence.update({
        where: { id_competence },
        data: donnees
    });
};

export const supprimerCompetence = async (id_competence) => {
    return await prisma.competence.delete({
        where: { id_competence }
    });
};

// --- SERVICES ÉTUDIANT ---


export const lierCompetenceAEtudiant = async (id_etudiant, id_competence, niveau_maitrise = 0) => {
    return await prisma.etudiantCompetence.upsert({
        where: {
            id_etudiant_id_competence: { id_etudiant, id_competence }
        },
        update: {
            niveau_maitrise: parseInt(niveau_maitrise)
        },
        create: {
            id_etudiant,
            id_competence,
            niveau_maitrise: parseInt(niveau_maitrise)
        },
        include: {
            competence: true
        }
    });
};

export const retirerCompetenceEtudiant = async (id_etudiant, id_competence) => {
    return await prisma.etudiantCompetence.delete({
        where: {
            id_etudiant_id_competence: { id_etudiant, id_competence }
        }
    });
};

export const recupererCompetencesEtudiant = async (id_etudiant) => {
    return await prisma.etudiantCompetence.findMany({
        where: { id_etudiant },
        include: {
            competence: true
        }
    });
};
