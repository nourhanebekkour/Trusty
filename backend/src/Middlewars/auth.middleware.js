const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma/client');

async function authMiddleware(req, res, next) {
  try {
    // 1. Récupérer header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Aucun token fourni' });
    }

    // 2. Extraire token
    const token = authHeader.split(' ')[1];

    // 3. Vérifier JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Vérifier user en DB
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        status: true,
        niveauAcces: true
      }
    });

    if (!user || user.status !== 'ACTIF') {
      return res.status(401).json({ message: 'Compte inactif ou suspendu' });
    }

    // 5. Attacher user à req
    req.user = {
      id: user.id,
      role: user.niveauAcces
    };

    next(); // passer à la route

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }

    return res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = authMiddleware;