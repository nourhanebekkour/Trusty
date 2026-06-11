import prisma from "#Config/prismaClient.js";

const UtilisateurSansMotDePasse = {
    select: {
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        date_creation: true,
        status_compte: true,
        email_verifie: true
    }
};

export const professionnelEnAttente = async () => {
  return prisma.professionnel.findMany({
    where : {status_validation : 'EN_ATTENTE'},
    include : { utilisateur : UtilisateurSansMotDePasse,},
    orderBy: { date_demande : 'asc'}
  })
};

export const validateProfessionnel = async(id,action) => {
    return prisma.professionnel.update({
      where : {id_professionnel : id},
      data : { status_validation : action},
      include : {utilisateur : UtilisateurSansMotDePasse}
    })
    
}

