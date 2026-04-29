import * as AdminService from '../Services/administrateurService.js';
import prisma from "../config/prismaClient.js";

export const createOrUpdateProfile = async (req, res) => {
    try {
         const id = req.body.id_administrateur;
         const user = await prisma.utilisateur.findUnique({
            where: { id_utilisateur: id }
            });

            if (!user) {
            return res.status(404).json({
                error: "Utilisateur introuvable"
            });
            }
        
        const profil = await AdminService.ajouterOuModifierAdmin(id, req.body);
        
        res.status(200).json({
            message: "administrateur créé ou mis à jour avec succès",
            data: profil
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProfileByID = async (req, res) => {
    try {
        const id = req.params.id;

        
        const profil = await AdminService.recupererAdminParId(id);
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
        
        const profil = await AdminService.recupererTousLesAdmins();
        res.status(200).json(profil)       
    } catch (error){
        res.status(500).json({error : error.message});
    }
}

