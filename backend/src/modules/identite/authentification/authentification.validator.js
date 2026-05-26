import { z } from 'zod';

const ECOLES = [
  'ENSATanger','ENCGTanger','FSTTanger','FSJESTanger',
  'ENSATetouan','ENSTetouan','FSTetouan','FLSHMartil','FSJESTetouan',
  'ENSAAlHoceima','FSTAlHoceima','FPDAlHoceima',
];

export const registerSchema = z.object({
  email:    z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  nom:      z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom:   z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  role:     z.enum(['ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL'], {
              errorMap: () => ({ message: 'Rôle invalide. Valeurs acceptées : ETUDIANT, PROFESSEUR, PROFESSIONNEL' }),
            }),
  ecole:    z.enum(ECOLES, { errorMap: () => ({ message: `École invalide. Valeurs : ${ECOLES.join(', ')}` }) }).optional(),
}).refine(
  (data) => data.role === 'PROFESSIONNEL' || !!data.ecole,
  { message: 'L\'école est obligatoire pour les rôles ETUDIANT et PROFESSEUR', path: ['ecole'] }
);

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token est requis'),
});

export const createUserAdminSchema = z.object({
  nom:          z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom:       z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email:        z.string().email({ message: 'Email invalide' }),
  niveau_acces: z.enum(['SUPER_ADMIN', 'ADMIN'], {
                  errorMap: () => ({ message: 'Niveau d\'accès invalide. Valeurs : SUPER_ADMIN, ADMIN' }),
                }),
  ecole:        z.enum(ECOLES, { errorMap: () => ({ message: `École invalide` }) }).optional(),
});

export const requestAccountSchema = z.object({
  nom:     z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom:  z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email:   z.string().email({ message: 'Email invalide' }),
  role:    z.enum(['ETUDIANT', 'PROFESSEUR'], {
             errorMap: () => ({ message: 'Rôle invalide. Valeurs acceptées : ETUDIANT, PROFESSEUR' }),
           }),
  message: z.string().max(500, 'Message trop long (max 500 caractères)').optional(),
});
export const loginSchema = z.object({
       email: z.string().email('Email invalide'),
       password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});
export const forgotPasswordSchema = z.object({
       email: z.string().email('Email invalide'),
});
export const resetPasswordSchema = z.object({
       token: z.string().min(1, 'Token est requis'),
       nouveauMotDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});