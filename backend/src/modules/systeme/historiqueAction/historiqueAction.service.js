import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const recupererToutesLesActions = async (filtres = {}) => {
    return await prisma.historiqueAction.findMany({
        where: filtres,
        include: {
            utilisateur: true,
        },
        orderBy: { date_action: 'desc' }
    });
};

export const recupererActionParId = async (id_historique) => {
    return await prisma.historiqueAction.findUnique({
        where: { id_historique },
        include: {
            utilisateur: true
        }
    });
};

export const recupererActionsParUtilisateur = async (id_utilisateur) => {
    return await prisma.historiqueAction.findMany({
        where: { id_utilisateur },
        include: {
            utilisateur: true
        },
        orderBy: { date_action: 'desc' }
    });
};

export const logAction = async (id_utilisateur, type_action, entite_concernee, id_entite, details = null) => {
    try {
        await prisma.historiqueAction.create({
            data: { id_utilisateur, type_action, entite_concernee, id_entite, details }
        });
    } catch (erreur) {
        console.error('Erreur log action :', erreur.message);
    }
};
// si logAction échoue on veut pas que ça fasse planter l'action principale
// par exp étudiant crée stage , ça marche mais le log échoue ->
//  on veut pas retourner une erreur à l'étudiant juste psq le log a planté alors que le stage a bien été crée
// => try/catch à l'intérieur de la fct, pas dans le controller 