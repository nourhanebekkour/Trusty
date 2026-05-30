import prisma from "#Config/prismaClient.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  envoyerEmailReinitialisation,
  envoyerEmailCredentiels,
  envoyerEmailDemandeCompte,
  envoyerEmailVerification,
} from '#Modules/systeme/emails/emails.service.js';

async function register(email, password, nom, prenom, role, ecole) {
  const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
  if (existingUser) throw new Error('Cet email est déjà utilisé');

  if (role === 'ETUDIANT') {
    if (!email.endsWith('@etu.uae.ac.ma')) {
      throw new Error('Un email étudiant (@etu.uae.ac.ma) est requis');
    }
  } else if (role === 'PROFESSEUR') {
    if (!email.endsWith('@uae.ac.ma')) {
      throw new Error('Un email professeur (@uae.ac.ma) est requis');
    }
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const tokenEmail = crypto.randomBytes(32).toString('hex');
  const expiresEmail = new Date(Date.now() + 24 * 3600000);

  // Pour un professionnel, l'école doit être null
  const finalEcole = role === 'PROFESSIONNEL' ? null : (ecole ?? null);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe: hashedPassword,
        nom,
        prenom,
        role,
        ecole: finalEcole,
        status_compte: 'INACTIF',
        email_verifie: false,
        token_reinitialisation_email: tokenEmail,
        date_expiration_token_email: expiresEmail,
      },
      select: {
        id_utilisateur: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        date_creation: true,
      },
    });

    if (role === 'ETUDIANT') {
      await tx.etudiant.create({
        data: { id_etudiant: created.id_utilisateur },
      });
    } else if (role === 'PROFESSEUR') {
      await tx.professeur.create({
        data: { id_professeur: created.id_utilisateur, filieres_interv: [] },
      });
    } else if (role === 'PROFESSIONNEL') {
      await tx.professionnel.create({
        data: { id_professionnel: created.id_utilisateur, status_validation: 'EN_ATTENTE' },
      });
    }

    return created;
  });

  await envoyerEmailVerification(email, tokenEmail);

  return { user };
}

async function verifierEmail(token) {
  const user = await prisma.utilisateur.findFirst({
    where: { token_reinitialisation_email: token },
  });
  if (!user) throw new Error('Token de vérification invalide');

  if (user.date_expiration_token_email < new Date()) {
    throw new Error('Ce lien de vérification a expiré');
  }

  const nouveauStatut = user.role === 'PROFESSIONNEL' ? 'INACTIF' : 'ACTIF';

  await prisma.utilisateur.update({
    where: { id_utilisateur: user.id_utilisateur },
    data: {
      email_verifie: true,
      status_compte: nouveauStatut,
      token_reinitialisation_email: null,
      date_expiration_token_email: null,
    },
  });

  return { role: user.role, status_compte: nouveauStatut };
}

async function creerUtilisateurAdmin({ nom, prenom, email, niveau_acces, ecole }) {
  const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
  if (existingUser) throw new Error('Cet email est déjà utilisé');

  const motDePasseGenere = crypto.randomBytes(8).toString('hex');
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(motDePasseGenere, salt);

  // Pour un super admin, l'école doit être null
  const finalEcole = niveau_acces === 'SUPER_ADMIN' ? null : (ecole ?? null);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe: hashedPassword,
        nom,
        prenom,
        role: 'ADMINISTRATEUR',
        ecole: finalEcole,
        status_compte: 'ACTIF',
        email_verifie: true,
      },
      select: {
        id_utilisateur: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        date_creation: true,
      },
    });

    await tx.administrateur.create({
      data: { id_administrateur: created.id_utilisateur, niveau_acces },
    });

    return created;
  });

  await envoyerEmailCredentiels(email, nom, prenom, motDePasseGenere, 'ADMINISTRATEUR');

  return { user };
}

async function demanderCreationCompte({ nom, prenom, email, role, message }) {
  await envoyerEmailDemandeCompte(nom, prenom, email, role, message);
}

async function login(email, password) {
  // 1. Chercher l'utilisateur par email
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // 2. Vérifier si l'email est vérifié
  if (!user.email_verifie) {
    throw new Error('Veuillez vérifier votre email avant de vous connecter');
  }

  // 3. Vérifier le statut du compte
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

export { register, verifierEmail, creerUtilisateurAdmin, demanderCreationCompte, login, refreshToken, logout, oublierMDP, changerMDP, getMe };
