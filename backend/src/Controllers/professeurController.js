import * as ProfesseurService from '../Services/professeurService.js';
import prisma from "../config/prismaClient.js";

export const createOrUpdateProfile = async (req, res) => {
    try {
         const id = req.body.id_professeur;
         const user = await prisma.utilisateur.findUnique({
            where: { id_utilisateur: id }
            });

            if (!user) {
            return res.status(404).json({
                error: "Utilisateur introuvable"
            });
            }
        
        const profil = await ProfesseurService.ajouterOuModifierProfesseur(id, req.body);
        
        res.status(200).json({
            message: "professeur créé ou mis à jour avec succès",
            data: profil
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProfileByID = async (req, res) => {
    try {
        const id = req.params.id;

        
        const profil = await ProfesseurService.recupererProfesseurParId(id);
         if (!profil) {
            return res.status(404).json({
                error: "Utilisateur introuvable"
            });
            }
        
        res.status(200).json(profil);
    }
     catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const getProfiles = async (req,res) => {
    try{
        
        const profil = await ProfesseurService.recupererTousLesProfesseurs();
        res.status(200).json(profil)       
    } catch (error){
        res.status(500).json({error : error.message});
    }
}

export const deleteProfesseur = async (req,res) => {
    try {
        const id = req.params.id;
        const professeur = await ProfesseurService.recupererProfesseurParId(id);

        if (!professeur) {
            return res.status(404).json({
                error: "Professeur non trouvé"
            });
        }

        const supprimer = await ProfesseurService.supprimerProfesseur(id);   
        res.status(200).json({message:" professeur supprimé avec succé"})

    } catch(error) {
         res.status(500).json({error : error.message })
        
    }
}