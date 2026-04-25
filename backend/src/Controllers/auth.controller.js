const authService = require('../Services/auth.service');
const { prisma } = require('../prisma/client');

// REGISTER
async function register(req, res) {
  try {
    const { email, password, nom } = req.body;

    if (!email || !password || !nom) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const result = await authService.register(email, password, nom);

    res.status(201).json({
      message: 'Inscription réussie',
      ...result
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
      message: 'Connexion réussie',
      ...result
    });

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

// GET ME (profil)
async function getMe(req, res) {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        status: true,
        niveauAcces: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { register, login, getMe };