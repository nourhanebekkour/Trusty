import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Aucun token fourni' });
    }
    const token = authHeader.split(' ')[1];

    // 2. Vérifier la signature du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Vérifier que l'utilisateur existe et est ACTIF
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: decoded.userId }, // ← vrai nom du champ
      select: {
        id_utilisateur: true,
        status_compte: true,   // ← vrai nom du champ
      },
    });

    if (!user || user.status_compte !== 'ACTIF') {
      return res.status(401).json({ message: 'Compte inactif ou suspendu' });
    }

    // 4. Attacher les infos à la requête
    req.user = { id: user.id_utilisateur };
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    return res.status(401).json({ message: 'Token invalide' });
  }
};

export { authMiddleware };