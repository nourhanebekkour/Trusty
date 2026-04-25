import * as authService from '../Services/auth.service.js';
import { prisma } from '../prisma/client.js';

const register = async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body; // ← ajouter prenom

    // Vérifier que tous les champs sont présents
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ message: 'Champs manquants (email, password, nom, prenom)' });
    }

    const result = await authService.register(email, password, nom, prenom); // ← passer prenom
    res.status(201).json({ message: 'Inscription réussie', ...result });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ message: 'Connexion réussie', ...result });

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: req.user.id }, // ← vrai nom du champ
      select: {
        id_utilisateur: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        status_compte: true,
        date_creation: true,
        derniere_connexion: true,
        // mot_de_passe absent → jamais renvoyé
      },
    });

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export { register, login, getMe };