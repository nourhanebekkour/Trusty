import { z } from 'zod';

export const commentaireSchema = z.object({
    id_etudiant_cible: z.string({ required_error: "L'ID de l'étudiant cible est requis" }),
    id_projet_cible: z.string().optional(),
    id_competence_cible: z.string().optional(),
    type_cible: z.enum(['PROJET', 'COMPETENCE', 'PROFIL'], { required_error: "Le type de cible est requis" }),
    contenu: z.string().min(1, "Le contenu du commentaire ne peut pas être vide").max(2000, "Le commentaire est trop long"),
});

export const validationCommentaireSchema = z.object({
    status: z.enum(['VALIDE', 'REJETE'], { required_error: "Le status de validation est requis" })
});
