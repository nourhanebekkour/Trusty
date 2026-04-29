import * as formationService from '../Services/formationService.js';

export const obtenirFormations = async (req, res) => {
    try {
        const { id_etudiant } = req.params;
        const formations = await formationService.recupererFormationsParEtudiant(id_etudiant);
        res.status(200).json(formations);
    } catch (erreur) {
        res.status(500).json({ message: "Erreur lors de la récupération des formations", erreur: erreur.message });
    }
};

export const ajouterFormation = async (req, res) => {
    try {
        const { id_etudiant } = req.params;
        const nouvelleFormation = await formationService.ajouterFormation(id_etudiant, req.body);
        res.status(201).json(nouvelleFormation);
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de l'ajout de la formation", erreur: erreur.message });
    }
};

export const mettreAJourFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const formationModifiee = await formationService.modifierFormation(id, req.body);
        res.status(200).json(formationModifiee);
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de la modification", erreur: erreur.message });
    }
};

export const supprimerFormation = async (req, res) => {
    try {
        const { id } = req.params;
        await formationService.supprimerFormation(id);
        res.status(200).json({ message: "Formation supprimée avec succès" });
    } catch (erreur) {
        res.status(400).json({ message: "Erreur lors de la suppression", erreur: erreur.message });
    }
};
