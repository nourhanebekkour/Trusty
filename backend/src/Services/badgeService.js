import prisma from '../Config/prismaClient.js';

// ============================================================================
// CRUD BADGES
// ============================================================================

export const creerBadge = async (donnees) => {
    return await prisma.badge.create({
        data: {
            nom: donnees.nom,
            description: donnees.description,
            categorie: donnees.categorie,
            icone: donnees.icone,
            condition_attribution: donnees.condition_attribution,
            est_actif: donnees.est_actif ?? true,
        },
    });
};

export const recupererTousLesBadges = async (filtres = {}) => {
    const where = {};

    if (filtres.categorie) where.categorie = filtres.categorie;
    if (filtres.est_actif !== undefined) where.est_actif = filtres.est_actif === 'true';
    if (filtres.recherche) where.nom = { contains: filtres.recherche, mode: 'insensitive' };

    const page = parseInt(filtres.page) || 1;
    const limite = parseInt(filtres.limite) || 10;
    const skip = (page - 1) * limite;

    const [badges, total] = await Promise.all([
        prisma.badge.findMany({
            where,
            skip,
            take: limite,
            orderBy: { nom: 'asc' },
            include: {
                _count: { select: { etudiants: true } },
            },
        }),
        prisma.badge.count({ where }),
    ]);

    return { badges, total, page, pages: Math.ceil(total / limite) };
};

export const recupererBadgeParId = async (id_badge) => {
    return await prisma.badge.findUnique({
        where: { id_badge },
        include: {
            _count: { select: { etudiants: true } },
        },
    });
};

export const modifierBadge = async (id_badge, donnees) => {
    return await prisma.badge.update({
        where: { id_badge },
        data: {
            ...(donnees.nom !== undefined && { nom: donnees.nom }),
            ...(donnees.description !== undefined && { description: donnees.description }),
            ...(donnees.categorie !== undefined && { categorie: donnees.categorie }),
            ...(donnees.icone !== undefined && { icone: donnees.icone }),
            ...(donnees.condition_attribution !== undefined && { condition_attribution: donnees.condition_attribution }),
            ...(donnees.est_actif !== undefined && { est_actif: donnees.est_actif }),
        },
    });
};

export const supprimerBadge = async (id_badge) => {
    // Cascade supprime automatiquement etudiants_badges via Prisma schema
    return await prisma.badge.delete({
        where: { id_badge },
    });
};

// ============================================================================
// ATTRIBUTION DES BADGES AUX ÉTUDIANTS
// ============================================================================

export const attribuerBadge = async (id_etudiant, id_badge) => {
    // Vérifie que le badge existe et est actif
    const badge = await prisma.badge.findUnique({ where: { id_badge } });
    if (!badge) throw new Error('Badge introuvable');
    if (!badge.est_actif) throw new Error('Ce badge est inactif et ne peut pas être attribué');

    // Vérifie que l'étudiant existe
    const etudiant = await prisma.etudiant.findUnique({ where: { id_etudiant } });
    if (!etudiant) throw new Error('Étudiant introuvable');

    // Crée l'attribution (l'index unique @@id empêche les doublons)
    return await prisma.etudiantBadge.create({
        data: { id_etudiant, id_badge },
        include: {
            badge: true,
            etudiant: {
                include: {
                    utilisateur: { select: { nom: true, prenom: true, email: true } },
                },
            },
        },
    });
};

export const retirerBadge = async (id_etudiant, id_badge) => {
    return await prisma.etudiantBadge.delete({
        where: { id_etudiant_id_badge: { id_etudiant, id_badge } },
    });
};

export const recupererBadgesEtudiant = async (id_etudiant) => {
    // Vérifie que l'étudiant existe
    const etudiant = await prisma.etudiant.findUnique({ where: { id_etudiant } });
    if (!etudiant) throw new Error('Étudiant introuvable');

    const attributions = await prisma.etudiantBadge.findMany({
        where: { id_etudiant },
        include: { badge: true },
        orderBy: { date_attribution: 'desc' },
    });

    return {
        total: attributions.length,
        badges: attributions,
    };
};

export const recupererEtudiantsDuBadge = async (id_badge) => {
    const badge = await prisma.badge.findUnique({ where: { id_badge } });
    if (!badge) throw new Error('Badge introuvable');

    const attributions = await prisma.etudiantBadge.findMany({
        where: { id_badge },
        include: {
            etudiant: {
                include: {
                    utilisateur: { select: { nom: true, prenom: true, email: true } },
                },
            },
        },
        orderBy: { date_attribution: 'desc' },
    });

    return {
        badge,
        total: attributions.length,
        etudiants: attributions,
    };
};