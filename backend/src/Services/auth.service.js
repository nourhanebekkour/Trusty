const { prisma } = require('../../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================== REGISTER ==================
async function register(email, password, nom) {

  // 1. Vérifier si email existe
  const existingUser = await prisma.utilisateur.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Créer utilisateur
  const user = await prisma.utilisateur.create({
    data: {
      email,
      motDePasse: hashedPassword,
      nom,
      status: 'EN_ATTENTE'
    },
    select: {
      id: true,
      email: true,
      nom: true,
      createdAt: true
    }
  });

  // 4. Générer JWT
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, user };
}

// ================== LOGIN ==================
async function login(email, password) {

  // 1. Chercher utilisateur
  const user = await prisma.utilisateur.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // 2. Vérifier statut
  if (user.status === 'SUSPENDU') {
    throw new Error('Compte suspendu');
  }

  if (user.status === 'INACTIF') {
    throw new Error('Compte inactif');
  }

  // 3. Vérifier mot de passe
  const isMatch = await bcrypt.compare(password, user.motDePasse);

  if (!isMatch) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // 4. Générer token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.niveauAcces
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // enlever mot de passe
  const { motDePasse, ...userSafe } = user;

  return { token, user: userSafe };
}

module.exports = { register, login };