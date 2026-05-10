import * as ProfessionnelService from '../Services/professionnelService.js';
import sendResponse from '../Utils/responseHandler.js';

export const afficherProfessionnelEnAttente= async (req,res) =>{
  // #swagger.tags = ['Tableaux de Bord - Admin']
  // #swagger.summary = "Afficher les professionnels en attente de validation"
  try {
    const professionnels = await ProfessionnelService.professionnelEnAttente();
     return sendResponse(res, 200, "Les professionnels en attente de validation : ", professionnels);
  }
  catch (error) {
        return sendResponse(res, 500, "Erreur lors de la récupération des profils", null, error);
      
}}


export const validerProfessionnel = async (req,res) => {
  // #swagger.tags = ['Tableaux de Bord - Admin']
  // #swagger.summary = "Valider ou rejeter un professionnel (Admin uniquement)"
  /* #swagger.parameters['id'] = { in: 'path' } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: "Action à effectuer sur le professionnel (VALIDE ou REJETE)",
        required: true,
        schema: {
          action: "VALIDE" // ou "REJETE"
        }
    } */
  try {
      const id = req.params.id;
     const donnee = req.body;
     const professionnel = await prisma.professionnel.findUnique({
    where: { id_professionnel: id },
  });
  if (!professionnel) {
    return sendResponse(res,404,false,"Professionnel introuvable",null,null);
  }
  if (professionnel.status_validation !== 'EN_ATTENTE'){
    return sendResponse(res,400,false,`Ce professionnel est déjà ${professionnel.status_validation}`);
  }

    const valider = await ProfessionnelService.validateProfessionnel(id,donnee.action);
    return sendResponse(res,200,true,`Professionnel ${donnee.action} avec succés`,valider)

  } catch (error) {
     return sendResponse(res, 500, "Erreur lors de la validation du professionnel", null, error.message);
  }
}