import { PrismaClient } from "@prisma/client";
import * as minioService from '../Utils/minioService.js';

const prisma = new PrismaClient();

// Fonction utilitaire pour vérifier l'accès (Admin ou Propriétaire)
const verifierAccesStage = async (id_stage, userId, userRole) => {
    const stage = await prisma.stage.findUnique({ 
        where: { id_stage },
        include: { rapport: true } 
    });
    
    if (!stage) throw new Error("Stage non trouvé");

    if (userRole !== 'ADMINISTRATEUR' && stage.id_etudiant !== userId) {
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource");
    }
    return stage;
};

// --- GESTION DES STAGES ---

export const creerStage = async (donnees) => {
    const data = {
        ...donnees,
        date_debut: new Date(donnees.date_debut),
        date_fin: donnees.date_fin ? new Date(donnees.date_fin) : null,
    };

    return await prisma.stage.create({
        data
    });
};

export const recupererTousLesStages = async (filtres = {}) => {
    const stages = await prisma.stage.findMany({
        where: filtres,
        include: {
            etudiant: true,
            technologies: {
                include: {
                    technologie: true
                }
            },
            rapport: true
        },
        orderBy: { date_debut: 'desc' }
    });

    return await minioService.enrichEntitiesWithFileUrls(stages, 'rapport');
};

export const recupererStageParId = async (id_stage) => {
    const stage = await prisma.stage.findUnique({
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

    if (!stage) return null;

    return await minioService.enrichEntityWithFileUrls(stage, 'rapport');
};

// un étudiant doit pouvoir voir ses propres stages.
// /api/stages/etudiant/:id_etudiant pour afficher uniquement ses stages
export const recupererStagesParEtudiant = async (id_etudiant) => {
    const stages = await prisma.stage.findMany({
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

    return await minioService.enrichEntitiesWithFileUrls(stages, 'rapport');
};

export const modifierStage = async (id_stage, donnees, userId, userRole) => {
    await verifierAccesStage(id_stage, userId, userRole);

    const data = { ...donnees };
    if (data.date_debut) data.date_debut = new Date(data.date_debut);
    if (data.date_fin) data.date_fin = new Date(data.date_fin);

    return await prisma.stage.update({
        where: { id_stage },
        data
    });
}

export const associerRapport = async (id_stage, file, userId, userRole) => {
    const stage = await verifierAccesStage(id_stage, userId, userRole);

    // Si un rapport existe déjà, on le supprime de MinIO avant de le remplacer
    if (stage.id_rapport) {
        await minioService.deleteFile(stage.id_rapport);
    }

    const fileRecord = await minioService.uploadAndSaveFile(file, userId, 'RAPPORT');

    await prisma.stage.update({
        where: { id_stage },
        data: { id_rapport: fileRecord.id_fichier }
    });

    return fileRecord;
};

export const supprimerRapport = async (id_stage, userId, userRole) => {
    const stage = await verifierAccesStage(id_stage, userId, userRole);

    if (!stage.id_rapport) {
        throw new Error("Aucun rapport associé à ce stage");
    }

    // Suppression physique du fichier dans MinIO et de son enregistrement
    await minioService.deleteFile(stage.id_rapport);

    // Détacher le rapport du stage (id_rapport devient null)
    return await prisma.stage.update({
        where: { id_stage },
        data: { id_rapport: null }
    });
};

export const supprimerStage = async (id_stage, userId, userRole) => {
    const stage = await verifierAccesStage(id_stage, userId, userRole);

    // Supprimer le fichier de MinIO si présent
    if (stage.id_rapport) {
        await minioService.deleteFile(stage.id_rapport);
    }

    return await prisma.stage.delete({
        where: { id_stage }
    });
}

// --- GESTION DES TECHNOLOGIES DU STAGE ---

export const ajouterTechnologieStage = async (id_stage, id_technologie, donneesTechnologie, userId, userRole) => {
    await verifierAccesStage(id_stage, userId, userRole);

    return await prisma.stageTechnologie.create({
        data: {
            id_stage,
            id_technologie,
            version: donneesTechnologie.version,
            niveau_utilisation: donneesTechnologie.niveau_utilisation
        }
    });
};

export const modifierTechnologieStage = async (id_stage, id_technologie, donnees, userId, userRole) => {
    await verifierAccesStage(id_stage, userId, userRole);

    return await prisma.stageTechnologie.update({
        where: {
            id_stage_id_technologie: { id_stage, id_technologie }
        },
        data: donnees
    });
};

export const retirerTechnologieStage = async (id_stage, id_technologie, userId, userRole) => {
    await verifierAccesStage(id_stage, userId, userRole);

    return await prisma.stageTechnologie.delete({
        where: {
            id_stage_id_technologie: { id_stage, id_technologie }
        }
    });
};
