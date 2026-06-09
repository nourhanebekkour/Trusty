import { PrismaClient } from '@prisma/client';
import * as minioService from '#Services/minio.service.js';

const prisma = new PrismaClient();

const portfolioIncludeConfig = {
    modele: true,
    etudiant: {
        include: {
            utilisateur: {
                select: {
                    id_utilisateur: true,
                    email: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    photo: true,
                    role: true,
                    date_creation: true,
                    ecole: true
                }
            },
            competences: {
                include: {
                    competence: true
                }
            },
            stages: {
                where: {
                    status_validation: 'VALIDE'
                },
                include: {
                    technologies: {
                        include: {
                            technologie: true
                        }
                    }
                }
            },
            badges: {
                include: {
                    badge: true
                }
            },
            activites_parascolaires: {
                where: {
                    status_validation: 'VALIDE',
                    est_public: true
                }
            },
            depots_github: true,
            formations: {
                orderBy: { date_debut: 'asc' }
            },
            participations_projets: {
                where: {
                    projet: {
                        status_validation: 'VALIDE',
                        est_public: true
                    },
                    est_visible_portfolio: true
                },
                include: {
                    projet: {
                        include: {
                            technologies: {
                                include: {
                                    technologie: true
                                }
                            }
                        }
                    }
                }
            },
            recommendation: {
                where: {
                    status: 'VALIDE'
                },
                include: {
                    auteur: {
                        select: {
                            nom: true,
                            prenom: true,
                            photo: true,
                            role: true
                        }
                    }
                }
            },
            lettres_recommandation: {
                include: {
                    redacteur: {
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
            }
        }
    }
};

export const getPortfolioById = async (id) => {
    return prisma.portfolio.findUnique({
        where: { id_portfolio: id },
        include: portfolioIncludeConfig
    });
};

export const getPortfolioByUrl = async (url) => {
    return prisma.portfolio.findUnique({
        where: { url_publique: url },
        include: portfolioIncludeConfig
    });
};

export const incrementPortfolioViews = async (id_portfolio) => {
    return prisma.portfolio.update({
        where: { id_portfolio },
        data: {
            nombre_vues: {
                increment: 1
            }
        }
    });
};

export const getActiveTemplates = async () => {
    return prisma.modelePortfolio.findMany({
        where: {
            est_actif: true
        },
        include: {
            apercu: true
        }
    });
};

export const uploadApercuModele = async (id_modele, fichier, userId) => {
    // Vérifier si le modèle existe
    const modele = await prisma.modelePortfolio.findUnique({
        where: { id_modele }
    });
    if (!modele) return null;

    // S'il y a déjà un aperçu, on le supprime d'abord
    if (modele.id_apercu) {
        try {
            await minioService.deleteFile(modele.id_apercu);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien aperçu:", error);
            // On continue quand même l'upload du nouveau même si la suppression échoue
        }
    }

    // Upload vers MinIO avec la catégorie APERCU ou PUBLIC
    const fileRecord = await minioService.uploadAndSaveFile(fichier, userId, 'PUBLIC');

    // Mettre à jour le modèle avec le nouvel aperçu
    return prisma.modelePortfolio.update({
        where: { id_modele },
        data: {
            id_apercu: fileRecord.id_fichier
        },
        include: {
            apercu: true
        }
    });
};

export const getMyPortfolios = async (id_etudiant) => {
    return prisma.portfolio.findMany({
        where: { id_etudiant },
        include: {
            modele: true
        }
    });
};

export const createPortfolio = async (id_etudiant, data) => {
    const { titre_personnalise, sous_titre, id_modele, est_publie } = data;

    let url_publique = data.url_publique;

    if (!url_publique) {
        // Fetch user to generate URL
        const etudiant = await prisma.etudiant.findUnique({
            where: { id_etudiant },
            include: { utilisateur: true }
        });

        if (!etudiant || !etudiant.utilisateur) {
            throw new Error("Étudiant introuvable");
        }

        const nom = etudiant.utilisateur.nom.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const prenom = etudiant.utilisateur.prenom.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const titre = titre_personnalise ? titre_personnalise.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'portfolio';

        let base_url = `${prenom}-${nom}-${titre}`;
        url_publique = base_url;
        let counter = 1;

        let existingUrl = await prisma.portfolio.findUnique({ where: { url_publique } });
        while (existingUrl) {
            url_publique = `${base_url}-${counter}`;
            existingUrl = await prisma.portfolio.findUnique({ where: { url_publique } });
            counter++;
        }
    }

    return prisma.portfolio.create({
        data: {
            id_etudiant,
            titre_personnalise,
            sous_titre,
            url_publique,
            id_modele,
            est_publie: est_publie || false,
            ...(est_publie ? { date_publication: new Date() } : {})
        }
    });
};

export const updatePortfolio = async (id_portfolio, id_etudiant, data) => {
    const { titre_personnalise, sous_titre, url_publique, id_modele, est_publie, sections_config, projets_selectionnes, competences_selectionnees, stages_selectionnes, couleur_accent } = data;
    // First, verify the portfolio belongs to the student
    const existing = await prisma.portfolio.findFirst({
        where: { id_portfolio, id_etudiant }
    });

    if (!existing) return null;

    return prisma.portfolio.update({
        where: { id_portfolio },
        data: {
            titre_personnalise,
            sous_titre,
            url_publique,
            id_modele,
            est_publie,
            sections_config,
            projets_selectionnes,
            competences_selectionnees,
            stages_selectionnes,
            couleur_accent,
            date_derniere_maj: new Date(),
            ...(est_publie !== undefined && est_publie !== existing.est_publie ? { date_publication: est_publie ? new Date() : null } : {})
        }
    });
};

export const publishPortfolio = async (id_portfolio, id_etudiant, est_publie) => {
    // Verify ownership
    const existing = await prisma.portfolio.findFirst({
        where: { id_portfolio, id_etudiant }
    });

    if (!existing) return null;

    return prisma.portfolio.update({
        where: { id_portfolio },
        data: {
            est_publie,
            date_publication: est_publie ? new Date() : null,
            date_derniere_maj: new Date()
        }
    });
};

export const getPortfolioStats = async (id_portfolio, id_etudiant) => {
    return prisma.portfolio.findFirst({
        where: { id_portfolio, id_etudiant },
        select: {
            nombre_vues: true,
            nombre_recommandations: true,
            date_publication: true,
            est_publie: true
        }
    });
};

export const deletePortfolio = async (id_portfolio) => {
    return prisma.portfolio.delete({
        where: { id_portfolio }
    })
}

// ==========================================
// IA: PORTFOLIO ADAPTATIF
// ==========================================

export const genererSelectionAdaptative = async (id_etudiant, objectif) => {
    const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant },
        include: {
            participations_projets: {
                where: { projet: { status_validation: 'VALIDE' } },
                include: { projet: true }
            },
            competences: {
                include: { competence: true }
            },
            stages: {
                where: { status_validation: 'VALIDE' }
            }
        }
    });

    if (!etudiant) throw new Error("Étudiant introuvable");

    const dataForPrompt = {
        projets: etudiant.participations_projets.map(p => ({
            id: p.id_projet,
            titre: p.projet.titre,
            description: p.projet.description
        })),
        competences: etudiant.competences.map(c => ({
            id: c.id_competence,
            nom: c.competence.nom,
            niveau: c.niveau
        })),
        stages: etudiant.stages.map(s => ({
            id: s.id_stage,
            titre: s.titre,
            entreprise: s.entreprise,
            description: s.description
        }))
    };

    const promptText = `Voici les projets, compétences et stages de cet étudiant. 
Son objectif professionnel est : ${objectif}. 
Analyse et sélectionne uniquement les IDs des éléments les plus pertinents pour atteindre cet objectif. 
Renvoie le résultat STRICTEMENT sous forme de JSON (sans markdown ni backticks).

Données de l'étudiant:
${JSON.stringify(dataForPrompt, null, 2)}

Format JSON attendu:
{
  "projets_selectionnes": ["id_projet_1", "id_projet_2"],
  "competences_selectionnees": ["id_competence_1"],
  "stages_selectionnes": ["id_stage_1"]
}`;

    // Import dynamique
    let GoogleGenAI;
    try {
        const genaiLib = await import('@google/genai');
        GoogleGenAI = genaiLib.GoogleGenAI;
    } catch (e) {
        throw new Error("La librairie @google/genai n'est pas installée. Exécutez 'npm install @google/genai'");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });

    const resultText = response.text;
    
    try {
        return JSON.parse(resultText);
    } catch (e) {
        throw new Error("L'IA n'a pas renvoyé un format JSON valide: " + resultText);
    }
};