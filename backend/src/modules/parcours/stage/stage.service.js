import { PrismaClient } from "@prisma/client";
import * as notificationsService from '#Modules/systeme/notifications/notifications.service.js';
import * as minioService from '#Services/minio.service.js';

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

// Fonction utilitaire pour vérifier que le professeur appartient à la même école que l'étudiant
const validerEcoleProfesseur = async (id_etudiant, id_professeur) => {
    const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant },
        include: { utilisateur: { select: { ecole: true } } }
    });

    const professeur = await prisma.professeur.findUnique({
        where: { id_professeur },
        include: { utilisateur: { select: { ecole: true } } }
    });

    if (!professeur) {
        throw new Error("Le professeur choisi n'existe pas");
    }

    if (professeur.utilisateur.ecole !== etudiant.utilisateur.ecole) {
        throw new Error("Le professeur choisi doit appartenir à la même école (" + etudiant.utilisateur.ecole + ")");
    }
};

// --- GESTION DES STAGES ---

export const creerStage = async (donnees) => {
    const { id_etudiant, id_validateur, ...stageData } = donnees;

    if (!id_etudiant) {
        throw new Error("L'ID de l'étudiant est requis");
    }

    // Vérification de l'école si un validateur est choisi
    if (id_validateur) {
        await validerEcoleProfesseur(id_etudiant, id_validateur);
    }

    const data = {
        ...stageData,
        id_etudiant,
        id_validateur,
        date_debut: new Date(stageData.date_debut),
        date_fin: stageData.date_fin ? new Date(stageData.date_fin) : null,
    };

    const nouveauStage = await prisma.stage.create({
        data
    });

    if (id_validateur) {
        await notificationsService.creerNotification(
            id_validateur, 
            "VALIDATION", 
            "Nouveau stage à valider", 
            "Un nouveau stage chez " + nouveauStage.entreprise + " attend votre validation."
        );
    }

    return nouveauStage;
};

export const validerStage = async (id_stage, id_validateur, decision, commentaire) => {
    const stage = await prisma.stage.findUnique({ where: { id_stage } });
    if (!stage) throw new Error("Stage non trouvé");

    if (stage.id_validateur !== id_validateur) {
        throw new Error("Vous n'êtes pas le validateur désigné pour ce stage");
    }

    const updateData = {
        status_validation: decision,
        date_validation: new Date(),
        commentaire_validation: commentaire
    };

    const stageMisAJour = await prisma.stage.update({
        where: { id_stage },
        data: updateData
    });

    await notificationsService.creerNotification(
        stageMisAJour.id_etudiant, 
        "VALIDATION", 
        "Stage " + (decision === "VALIDE" ? "validé" : "rejeté"), 
        "Votre stage chez " + stageMisAJour.entreprise + " a été " + decision.toLowerCase() + "."
    );

    // Créer un historique
    await prisma.historiqueValidation.create({
        data: {
            type_entite: 'STAGE',
            id_entite: id_stage,
            status_validation: decision,
            date_soumission: stage.date_soumission,
            date_decision: new Date(),
            commentaires: commentaire,
            id_validateur: id_validateur
        }
    });

    return stageMisAJour;
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

export const recupererStagesAValider = async (id_professeur) => {
    const stages = await prisma.stage.findMany({
        where: {
            id_validateur: id_professeur,
            status_validation: "EN_ATTENTE"
        },
        include: {
            etudiant: {
                include: {
                    utilisateur: {
                        select: {
                            nom: true,
                            prenom: true,
                            photo: true
                        }
                    }
                }
            },
            technologies: {
                include: {
                    technologie: true
                }
            },
            rapport: true
        },
        orderBy: { date_soumission: "asc" }
    });

    return await minioService.enrichEntitiesWithFileUrls(stages, "rapport");
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
    const stage = await verifierAccesStage(id_stage, userId, userRole);

    const data = { ...donnees };
    if (data.date_debut) data.date_debut = new Date(data.date_debut);
    if (data.date_fin) data.date_fin = new Date(data.date_fin);

    // Vérification de l'école si un nouveau validateur est choisi
    if (data.id_validateur) {
        await validerEcoleProfesseur(stage.id_etudiant, data.id_validateur);
    }

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
