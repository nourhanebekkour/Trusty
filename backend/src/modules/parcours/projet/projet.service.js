import { PrismaClient } from '@prisma/client';
import * as notificationsService from '#Modules/systeme/notifications/notifications.service.js';
import * as minioService from '#Services/minio.service.js';
import { calculerEtMettreAJourScoreCredibilite } from '#Modules/identite/etudiant/etudiant.service.js';

const prisma = new PrismaClient();

// Fonction utilitaire pour vérifier l'accès (Admin ou Participant)
const verifierAccesProjet = async (id_projet, userId, userRole) => {
    const projet = await prisma.projet.findUnique({ 
        where: { id_projet },
        include: { participations: true, fichiers: true } 
    });

    if (!projet) throw new Error("Projet non trouvé");

    if (userRole === 'ADMINISTRATEUR') return projet;

    const estParticipant = projet.participations.some(p => p.id_etudiant === userId);
    if (!estParticipant) {
        throw new Error("Vous n'êtes pas autorisé à accéder à ce projet");
    }
    return projet;
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

// --- GESTION DES PROJETS ---

export const creerProjet = async (donnees) => {
    const { id_etudiant, role_joue, id_validateur, ...projetData } = donnees;

    if (!id_etudiant) {
        throw new Error("L'ID de l'étudiant créateur est requis");
    }

    // Vérification de l'école si un validateur est choisi
    if (id_validateur) {
        await validerEcoleProfesseur(id_etudiant, id_validateur);
    }

    const data = {
        ...projetData,
        id_validateur,
        date_debut: new Date(projetData.date_debut),
        date_fin: projetData.date_fin ? new Date(projetData.date_fin) : null,
        participations: {
            create: {
                id_etudiant: id_etudiant,
                role_joue: role_joue || "Créateur",
                est_createur: true,
                date_debut: new Date(projetData.date_debut),
                date_fin: projetData.date_fin ? new Date(projetData.date_fin) : null,
                est_visible_portfolio: true
            }
        }
    };

    const nouveauProjet = await prisma.projet.create({
        data,
        include: {
            participations: true,
            technologies: {
                include: {
                    technologie: true
                }
            }
        }
    });

    if (id_validateur) {
        await notificationsService.creerNotification(
            id_validateur, 
            "VALIDATION", 
            "Nouveau projet à valider", 
            "Le projet \"" + nouveauProjet.titre + "\" attend votre validation."
        );
    }

    return nouveauProjet;
};

export const validerProjet = async (id_projet, id_validateur, decision, commentaire, appreciation) => {
    const projet = await prisma.projet.findUnique({ where: { id_projet } });
    if (!projet) throw new Error("Projet non trouvé");

    if (projet.id_validateur !== id_validateur) {
        throw new Error("Vous n'êtes pas le validateur désigné pour ce projet");
    }

    const updateData = {
        status_validation: decision,
        date_validation: new Date(),
        commentaire_validation: commentaire,
        appreciation: appreciation
    };

    const projetMisAJour = await prisma.projet.update({
        where: { id_projet },
        data: updateData,
        include: { participations: true }
    });

    await notificationsService.creerNotification(
        projetMisAJour.participations[0].id_etudiant, 
        "VALIDATION", 
        "Projet " + (decision === "VALIDE" ? "validé" : "rejeté"), 
        "Votre projet \"" + projetMisAJour.titre + "\" a été " + decision.toLowerCase() + " par le professeur."
    );

    // Créer un historique
    await prisma.historiqueValidation.create({
        data: {
            type_entite: 'PROJET',
            id_entite: id_projet,
            status_validation: decision,
            date_soumission: projet.date_soumission,
            date_decision: new Date(),
            commentaires: commentaire,
            appreciation: appreciation,
            id_validateur: id_validateur
        }
    });

    return projetMisAJour;
};

export const recupererTousLesProjets = async (filtres = {}) => {
    const projets = await prisma.projet.findMany({
        where: filtres,
        include: {
            participations: {
                include: {
                    etudiant: true
                }
            },
            technologies: {
                include: {
                    technologie: true
                }
            },
            fichiers: true
        },
        orderBy: { date_creation: 'desc' }
    });

    return await minioService.enrichEntitiesWithFileUrls(projets, 'fichiers');
};

export const recupererProjetParId = async (id_projet) => {
    const projet = await prisma.projet.findUnique({
        where: { id_projet },
        include: {
            participations: {
                include: {
                    etudiant: true
                }
            },
            technologies: {
                include: {
                    technologie: true
                }
            },
            validateur: true,
            fichiers: true
        }
    });

    if (!projet) return null;

    return await minioService.enrichEntityWithFileUrls(projet, 'fichiers');
};

export const recupererProjetsAValider = async (id_professeur) => {
    const projets = await prisma.projet.findMany({
        where: {
            id_validateur: id_professeur,
            status_validation: "EN_ATTENTE"
        },
        include: {
            participations: {
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
                    }
                }
            },
            technologies: {
                include: {
                    technologie: true
                }
            },
            fichiers: true
        },
        orderBy: { date_soumission: "asc" }
    });

    return await minioService.enrichEntitiesWithFileUrls(projets, "fichiers");
};

export const recupererProjetsParEtudiant = async (id_etudiant) => {
    const projets = await prisma.projet.findMany({
        where: {
            participations: {
                some: {
                    id_etudiant: id_etudiant
                }
            }
        },
        include: {
            participations: {
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
                    }
                }
            },
            technologies: {
                include: {
                    technologie: true
                }
            },
            validateur: true,
            fichiers: true
        },
        orderBy: { date_creation: "desc" }
    });

    return await minioService.enrichEntitiesWithFileUrls(projets, "fichiers");
};

export const modifierProjet = async (id_projet, donnees, userId, userRole) => {
    const projet = await verifierAccesProjet(id_projet, userId, userRole);

    const data = { ...donnees };
    if (data.date_debut) data.date_debut = new Date(data.date_debut);
    if (data.date_fin) data.date_fin = new Date(data.date_fin);

    // Vérification de l'école si un nouveau validateur est choisi
    if (data.id_validateur) {
        const createur = projet.participations.find(p => p.est_createur);
        if (createur) {
            await validerEcoleProfesseur(createur.id_etudiant, data.id_validateur);
        }
    }

    return await prisma.projet.update({
        where: { id_projet },
        data
    });
};

export const supprimerProjet = async (id_projet, userId, userRole) => {
    const projet = await verifierAccesProjet(id_projet, userId, userRole);

    if (projet.fichiers && projet.fichiers.length > 0) {
        for (const fichier of projet.fichiers) {
            await minioService.deleteFile(fichier.id_fichier);
        }
    }

    return await prisma.projet.delete({
        where: { id_projet }
    });
};

// --- GESTION DES FICHIERS DU PROJET ---

export const ajouterFichier = async (id_projet, file, userId, userRole, category = 'PROJET') => {
    await verifierAccesProjet(id_projet, userId, userRole);

    return await minioService.uploadAndSaveFile(file, userId, category, { id_projet });
};

export const listerFichiers = async (id_projet) => {
    const projet = await prisma.projet.findUnique({
        where: { id_projet },
        include: { fichiers: true }
    });

    if (!projet) {
        throw new Error("Projet non trouvé");
    }

    const fichiers = projet.fichiers || [];
    return await Promise.all(fichiers.map(async (f) => ({
        ...f,
        url: await minioService.getFileUrl(f.nom_stockage)
    })));
};

export const supprimerFichier = async (id_projet, id_fichier, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    const fichier = await minioService.getFileInfo(id_fichier);
    if (!fichier || fichier.id_projet !== id_projet) {
        throw new Error("Fichier non trouvé ou n'appartient pas à ce projet");
    }

    return await minioService.deleteFile(id_fichier);
};

// --- GESTION DES PARTICIPATIONS AU PROJET ---

export const ajouterParticipant = async (id_projet, id_etudiant, donneesParticipant, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    return await prisma.participationProjet.create({
        data: {
            id_projet,
            id_etudiant,
            role_joue: donneesParticipant.role_joue,
            date_debut: new Date(donneesParticipant.date_debut),
            date_fin: donneesParticipant.date_fin ? new Date(donneesParticipant.date_fin) : null,
            est_visible_portfolio: donneesParticipant.est_visible_portfolio ?? true,
            est_createur: false
        }
    });
};

export const modifierParticipant = async (id_projet, id_etudiant, donnees, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    const data = { ...donnees };
    if (data.date_debut) data.date_debut = new Date(data.date_debut);
    if (data.date_fin) data.date_fin = new Date(data.date_fin);
    
    delete data.est_createur;

    return await prisma.participationProjet.update({
        where: {
            id_projet_id_etudiant: { id_projet, id_etudiant }
        },
        data
    });
};

export const retirerParticipant = async (id_projet, id_etudiant, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    return await prisma.participationProjet.delete({
        where: {
            id_projet_id_etudiant: { id_projet, id_etudiant }
        }
    });
};

// --- GESTION DES TECHNOLOGIES DU PROJET ---

export const ajouterTechnologieProjet = async (id_projet, id_technologie, donneesTechnologie, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    return await prisma.projetTechnologie.create({
        data: {
            id_projet,
            id_technologie,
            version: donneesTechnologie.version,
            niveau_utilisation: donneesTechnologie.niveau_utilisation
        }
    });
};

export const modifierTechnologieProjet = async (id_projet, id_technologie, donnees, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    return await prisma.projetTechnologie.update({
        where: {
            id_projet_id_technologie: { id_projet, id_technologie }
        },
        data: donnees
    });
};

export const retirerTechnologieProjet = async (id_projet, id_technologie, userId, userRole) => {
    await verifierAccesProjet(id_projet, userId, userRole);

    return await prisma.projetTechnologie.delete({
        where: {
            id_projet_id_technologie: { id_projet, id_technologie }
        }
    });
};
