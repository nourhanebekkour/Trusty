import { z } from 'zod';

export const recommandationSchema = z.object({
    id_etudiant: z.string({ required_error: "L'ID de l'étudiant cible est requis" }),
    message: z.string().optional(),
});

export const validationRecommandationSchema = z.object({
    status: z.enum(['VALIDE', 'REJETE'], { required_error: "Le status de validation est requis" })
});
