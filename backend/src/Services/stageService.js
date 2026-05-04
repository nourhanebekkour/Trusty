import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- GESTION DES STAGES ---

export const creerStage = async (donnees) => {
    return await prisma.stage.create({
        data: donnees
    });
};

export const recupererTousLesStages = async (filtres = {}) => {
    return await prisma.stage.findMany({
        where: filtres,
        include: {
            etudiant: true,
            technologies: {
                include: {
                    technologie: true
                }
            }
        },
        orderBy: { date_debut: 'desc' }
    });
};

export const recupererStageParId = async (id_stage) => {
    return await prisma.stage.findUnique({
        where: { id_stage },
        include: {
            etudiant: true,
            technologies: {
                include: {
                    technologie: true
                }
            },
            validateur: true,
            rapport: true
        }
    });
};

// un étudiant doit pouvoir voir ses propres stages.
// /api/stages/etudiant/:id_etudiant pour afficher uniquement ses stages
export const recupererStagesParEtudiant = async (id_etudiant) => {
    return await prisma.stage.findMany({
        where: { id_etudiant },
        include: {
            technologies: {
                include: {
                    technologie: true
                }
            },
            rapport: true
        },
        orderBy: { date_debut: 'desc' }
    });
};

export const modifierStage = async (id_stage, donnees) => {
    return await prisma.stage.update({
        where: { id_stage },
        data: donnees
    });
}

export const supprimerStage = async (id_stage) => {
    return await prisma.stage.delete({
        where: { id_stage }
    });
}

// --- GESTION DES TECHNOLOGIES DU STAGE ---

export const ajouterTechnologieStage = async (id_stage, id_technologie, donneesTechnologie) => {
    return await prisma.stageTechnologie.create({
        data: {
            id_stage,
            id_technologie,
            version: donneesTechnologie.version,
            niveau_utilisation: donneesTechnologie.niveau_utilisation
        }
    });
};

export const modifierTechnologieStage = async (id_stage, id_technologie, donnees) => {
    return await prisma.stageTechnologie.update({
        where: {
            id_stage_id_technologie: { id_stage, id_technologie }
        },
        data: donnees
    });
};

export const retirerTechnologieStage = async (id_stage, id_technologie) => {
    return await prisma.stageTechnologie.delete({
        where: {
            id_stage_id_technologie: { id_stage, id_technologie }
        }
    });
};

// optionnel 
// export const recupererTechnologiesStage = async (id_stage) => {
//     return await prisma.stageTechnologie.findMany({
//         where: { id_stage },
//         include: {
//             technologie: true
//         }
//     });
// };
