import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- GESTION DES PROJETS ---

export const creerProjet = async (donnees) => {
    return await prisma.projet.create({
        data: donnees
    });
};

export const recupererTousLesProjets = async (filtres = {}) => {
    return await prisma.projet.findMany({
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
            }
        },
        orderBy: { date_creation: 'desc' }
    });
};

export const recupererProjetParId = async (id_projet) => {
    return await prisma.projet.findUnique({
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
            validateur: true
        }
    });
};

export const modifierProjet = async (id_projet, donnees) => {
    return await prisma.projet.update({
        where: { id_projet },
        data: donnees
    });
};

export const supprimerProjet = async (id_projet) => {
    return await prisma.projet.delete({
        where: { id_projet }
    });
};

// --- GESTION DES PARTICIPATIONS AU PROJET ---

export const ajouterParticipant = async (id_projet,id_etudiant, donneesParticipant) => {
    return await prisma.participationProjet.create({
        data: {
            id_projet,
            id_etudiant,
            est_visible_portfolio: donneesParticipant.est_visible_portfolio,
            role_joue: donneesParticipant.role_joue,
            date_debut: new Date(donneesParticipant.date_debut),
            date_fin: donneesParticipant.date_fin ? new Date(donneesParticipant.date_fin) : null,
            est_createur: donneesParticipant.est_createur
        }
    });
};

export const modifierParticipant = async (id_projet, id_etudiant, donnees) => {
    return await prisma.participationProjet.update({
        where: {
            id_projet_id_etudiant: { id_projet, id_etudiant }
        },
        data: donnees
    });
};

export const retirerParticipant = async (id_projet, id_etudiant) => {
    return await prisma.participationProjet.delete({
        where: {
            id_projet_id_etudiant: { id_projet, id_etudiant }
        }
    });
};

// --- GESTION DES TECHNOLOGIES DU PROJET ---

export const ajouterTechnologieProjet = async (id_projet, id_technologie, donneesTechnologie) => {
    return await prisma.projetTechnologie.create({
        data: {
            id_projet,
            id_technologie,
            version: donneesTechnologie.version,
            niveau_utilisation: donneesTechnologie.niveau_utilisation
        }
    });
};

export const modifierTechnologieProjet = async (id_projet, id_technologie, donnees) => {
    return await prisma.projetTechnologie.update({
        where: {
            id_projet_id_technologie: { id_projet, id_technologie }
        },
        data: donnees
    });
};

export const retirerTechnologieProjet = async (id_projet, id_technologie) => {
    return await prisma.projetTechnologie.delete({
        where: {
            id_projet_id_technologie: { id_projet, id_technologie }
        }
    });
};
