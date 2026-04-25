import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function register(email, password, nom, prenom) {

  // 1. Vérifier si l'email est déjà utilisé
  const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
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

  // 4. Générer le token JWT
  const token = jwt.sign(
    { userId: user.id_utilisateur },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, user };
}

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
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Exclure mot_de_passe de la réponse
  const { mot_de_passe, ...userSafe } = user;
  return { token, user: userSafe };
}

export { register, login };