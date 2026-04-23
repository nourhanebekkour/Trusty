import * as etudiantService from '../services/etudiantService.js';

export const obtenirTousLesProfils = async (req, res) => {
    try {
        const etudiants = await etudiantService.recupererTousLesProfils();
        res.status(200).json(etudiants);
    } catch (erreur) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération des profils", 
            erreur: erreur.message 
        });
    }
};

export const obtenirProfilParId = async (req, res) => {
    try {
        const { id } = req.params;
        const etudiant = await etudiantService.recupererParId(id);
        if (!etudiant) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }
        res.status(200).json(etudiant);
    } catch (erreur) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération du profil", 
            erreur: erreur.message 
        });
    }
};

export const traiterProfil = async (req, res) => {
    try {
        const { id } = req.params;
        const profil = await etudiantService.ajouterOuModifierEtudiant(id, req.body);
        res.status(200).json({
            message: "Profil traité avec succès (créé ou mis à jour)",
            donnees: profil
        });
    } catch (erreur) {
        res.status(400).json({ 
            message: "Erreur lors du traitement du profil", 
            details: erreur.message 
        });
    }
};

