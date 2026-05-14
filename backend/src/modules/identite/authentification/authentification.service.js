import prisma from "#Config/prismaClient.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { envoyerEmailReinitialisation } from '#Modules/systeme/emails/emails.service.js';

const ROLES_AUTORISES = ['ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL'];

async function register(email, password, nom, prenom, role) {
  // 1. Vérifier si l'email est déjà utilisé
  const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  // 2. Valider le rôle — ADMINISTRATEUR interdit à l'inscription
  const roleValide = ROLES_AUTORISES.includes(role) ? role : 'ETUDIANT';

  // 3. Hasher le mot de passe
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Créer l'utilisateur en BDD
  const user = await prisma.utilisateur.create({
    data: {
      email,
      mot_de_passe: hashedPassword,
      nom,
      prenom,
      role: roleValide,
      status_compte: 'INACTIF',
    },
    select: {
      id_utilisateur: true,
      email: true,
      nom: true,
      prenom: true,
      date_creation: true,
    },
  });

  return { user };
}

async function login(email, password) {
  // 1. Chercher l'utilisateur par email
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // 2. Vérifier le statut du compte
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

  // 4. Générer l'access token (15 minutes)
  const accessToken = jwt.sign(
    { userId: user.id_utilisateur },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // 5. Générer le refresh token (7 jours)
  const refreshToken = jwt.sign(
    { userId: user.id_utilisateur },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // 6. Sauvegarder le refresh token en BDD
  await prisma.utilisateur.update({
    where: { email },
    data: {
      refresh_token: refreshToken,
      date_expiration_refresh: new Date(Date.now() + 7 * 24 * 3600000)
    }
  });

  const { mot_de_passe, ...userSafe } = user;
  return { accessToken, refreshToken, user: userSafe };
}

async function refreshToken(token) {
  // 1. Vérifier la signature du refresh token
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error('Refresh token invalide ou expiré');
  }

  // 2. Chercher l'utilisateur en BDD
  const user = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: payload.userId }
  });
  if (!user) throw new Error('Utilisateur introuvable');

  // 3. Vérifier que le refresh token en BDD correspond
  if (user.refresh_token !== token) {
    throw new Error('Refresh token invalide');
  }

  // 4. Vérifier l'expiration en BDD
  if (user.date_expiration_refresh < new Date()) {
    throw new Error('Refresh token expiré');
  }

  // 5. Générer un nouvel access token
  const newAccessToken = jwt.sign(
    { userId: user.id_utilisateur },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { accessToken: newAccessToken };
}

async function logout(userId) {
  // Supprimer le refresh token de la BDD
  await prisma.utilisateur.update({
    where: { id_utilisateur: userId },
    data: {
      refresh_token: null,
      date_expiration_refresh: null
    }
  });
}

async function getMe(id_utilisateur) {
  const user = await prisma.utilisateur.findUnique({
    where: { id_utilisateur },
    select: {
      id_utilisateur: true,
      email: true,
      nom: true,
      prenom: true,
      telephone: true,
      role: true,
      status_compte: true,
      date_creation: true,
      derniere_connexion: true,
    },
  });
  return user;
}

async function oublierMDP(email) {
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000);

  await prisma.utilisateur.update({
    where: { email },
    data: {
      token_reinitialisation: token,
      date_expiration_token: expires
    }
  });

  await envoyerEmailReinitialisation(email, token);
}

async function changerMDP(token, newPassword) {
  const user = await prisma.utilisateur.findFirst({
    where: { token_reinitialisation: token }
  });
  if (!user) {
    throw new Error('Token de réinitialisation invalide');
  }

  if (user.date_expiration_token < new Date()) {
    throw new Error('ce lien a expiré');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.utilisateur.update({
    where: { id_utilisateur: user.id_utilisateur },
    data: {
      mot_de_passe: hashedPassword,
      token_reinitialisation: null,
      date_expiration_token: null
    }
  });
}

export { register, login, refreshToken, logout, oublierMDP, changerMDP, getMe };
