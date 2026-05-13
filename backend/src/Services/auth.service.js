import prisma from "../Config/prismaClient.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { envoyerEmailReinitialisation } from './email.service.js';

async function register(email, password, nom, prenom) {

  // 1. Vérifier si l'email est déjà utilisé
  const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }
}
  // 2. Hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Créer l'utilisateur en BDD
  const user = await prisma.utilisateur.create({
    data: {
      email,
      mot_de_passe: hashedPassword,
      nom,
      prenom,
      status_compte: 'INACTIF', // ← valeur correcte de l'enum
    },
    select: {
      id_utilisateur: true,
      email: true,
      nom: true,
      prenom: true,
      date_creation: true,
    },
  });


async function login(email, password) {

  // 1. Chercher l'utilisateur par email
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // 2. Vérifier le statut du compte
  // INACTIF = compte créé mais pas encore activé par un admin
  if (user.status_compte === 'INACTIF') {
    throw new Error('Compte inactif. En attente de validation par un administrateur');
  }
  if (user.status_compte === 'SUSPENDU') {
    throw new Error("Compte suspendu. Contactez l'administrateur");
  }

  // 3. Comparer le mot de passe avec le hash en BDD
  const isMatch = await bcrypt.compare(password, user.mot_de_passe);
  if (!isMatch) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // 4. Générer le JWT
  const token = jwt.sign(
    { userId: user.id_utilisateur },
    process.env.JWT_SECRET || 'secret_key_123',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Exclure mot_de_passe de la réponse
  const { mot_de_passe, ...userSafe } = user;
  return { token, user: userSafe };
}
async function oublierMDP(email) {
  // 1. Chercher l'utilisateur par email
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) return;
  //2. Générer un token de réinitialisation
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 heure
  
  // 3. Sauvegarder le token et sa date d'expiration en BDD
  await prisma.utilisateur.update({
    where: { email },
    data: {
      token_reinitialisation: token,
      date_expiration_token : expires
    }
  });
  
  // 4. Envoyer l'email de réinitialisation
  await envoyerEmailReinitialisation(email, token);
}
async function changerMDP(token, newPassword) {
  // 1. Trouver l'utilisateur avec le token 
  const user = await prisma.utilisateur.findFirst({
    where: { token_reinitialisation: token }
  });
  if (!user) {
    throw new Error('Token de réinitialisation invalide');
  }
  
  // 2. Vérifier que le token n'est pas expiré
  if (user.date_expiration_token < new Date()) {
    throw new Error('ce lien a expiré');
  }
  // 3. Hasher le nouveau mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  // 4. Mettre à jour le mot de passe en BDD et supprimer le token
  await prisma.utilisateur.update({
    where: { id_utilisateur: user.id_utilisateur },
    data: {
      mot_de_passe: hashedPassword,
      token_reinitialisation: null,
      date_expiration_token : null
    }
  });
}
export { register, login, oublierMDP, changerMDP }
