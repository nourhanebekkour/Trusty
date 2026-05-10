import { z } from 'zod';
export const registerSchema = z.object({
       email: z.string().email('Email invalide'),
       password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
       nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
       prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
});
export const loginSchema = z.object({
       email: z.string().email('Email invalide'),
       password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});
export const oublierMDPSchema = z.object({
       email: z.string().email('Email invalide'),
});
export const changerMDPSchema = z.object({
       token: z.string().min(1, 'Token est requis'),
       nouveauMotDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});