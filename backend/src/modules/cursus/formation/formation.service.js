import prisma from "#Config/prismaClient.js";

// Fonction utilitaire pour vérifier l'accès (Admin ou Propriétaire)
const verifierAccesFormation = async (id_formation, userId, userRole) => {
    const formation = await prisma.formation.findUnique({ 
        where: { id_formation }
    });
    
    if (!formation) throw new Error("Formation non trouvée");

    if (userRole !== 'ADMINISTRATEUR' && formation.id_etudiant !== userId) {
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource");
    }
    return formation;
};

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
            est_actuelle: donnees.est_actuelle === true || donnees.est_actuelle === 'true'
        }
    });
};

export const modifierFormation = async (id_formation, donnees, userId, userRole) => {
    await verifierAccesFormation(id_formation, userId, userRole);

    const donneesUpdate = { ...donnees };
    
    if (donneesUpdate.date_debut) donneesUpdate.date_debut = new Date(donneesUpdate.date_debut);
    if (donneesUpdate.date_fin) donneesUpdate.date_fin = new Date(donneesUpdate.date_fin);

    return await prisma.formation.update({
        where: { id_formation },
        data: donneesUpdate
    });
};

export const supprimerFormation = async (id_formation, userId, userRole) => {
    await verifierAccesFormation(id_formation, userId, userRole);

    return await prisma.formation.delete({
        where: { id_formation }
    });
};
