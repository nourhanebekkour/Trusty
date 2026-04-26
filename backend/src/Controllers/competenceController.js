import * as competenceService from '../Services/competenceService.js';

// --- CONTRÔLEURS CATALOGUE ---

export const listerCompetences = async (req, res) => {
    try {
        const competences = await competenceService.recupererToutesLesCompetences();
        res.status(200).json(competences);
    } catch (erreur) {
        res.status(500).json({ message: "Erreur lors de la récupération des compétences", erreur: erreur.message });
    }
};

export const recupererCompetence = async (req, res) => {
    try {
        const { id } = req.params;
        const competence = await competenceService.recupererCompetenceParId(id);
        if (competence) {
            res.status(200).json(competence);
        } else {
            res.status(404).json({ message: "Compétence non trouvée" });
        }
    } catch (erreur) {
        res.status(500).json({ message: "Erreur lors de la récupération", erreur: erreur.message });
    }
};

export const ajouterCompetence = async (req, res) => {
    try {
        const nouvelleCompetence = await competenceService.creerCompetence(req.body);
        res.status(201).json(nouvelleCompetence);
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de la création de la compétence", erreur: erreur.message });
    }
};

export const modifierCompetence = async (req, res) => {
    try {
        const { id } = req.params;
        const competenceModifiee = await competenceService.modifierCompetence(id, req.body);
        res.status(200).json(competenceModifiee);
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de la modification de la compétence", erreur: erreur.message });
    }
};

export const supprimerCompetence = async (req, res) => {
    try {
        const { id } = req.params;
        await competenceService.supprimerCompetence(id);
        res.status(200).json({ message: "Compétence supprimée avec succès" });
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de la suppression", erreur: erreur.message });
    }
};

// --- CONTRÔLEURS ÉTUDIANT ---

export const listerCompetencesEtudiant = async (req, res) => {
    try {
        const { id_etudiant } = req.params;
        const competences = await competenceService.recupererCompetencesEtudiant(id_etudiant);
        res.status(200).json(competences);
    } catch (erreur) {
        res.status(500).json({ message: "Erreur lors de la récupération", erreur: erreur.message });
    }
};

export const associerCompetence = async (req, res) => {
    try {
        const { id_etudiant, id_competence } = req.params;
        const { niveau_maitrise } = req.body;
        const association = await competenceService.lierCompetenceAEtudiant(id_etudiant, id_competence, niveau_maitrise);
        res.status(200).json(association);
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de l'association", erreur: erreur.message });
    }
};

export const detacherCompetence = async (req, res) => {
    try {
        const { id_etudiant, id_competence } = req.params;
        await competenceService.retirerCompetenceEtudiant(id_etudiant, id_competence);
        res.status(200).json({ message: "Compétence retirée de l'étudiant" });
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors du retrait", erreur: erreur.message });
    }
};
