import jwt from 'jsonwebtoken';
import prisma from '#Config/prismaClient.js';
import sendResponse from '#Utils/response.handler.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Récupérer le token depuis le cookie ou le header Authorization
    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(res, 401, false, 'Aucun token fourni');
      }
      token = authHeader.split(' ')[1];
    }

    // 2. Vérifier la signature du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');

    // 3. Vérifier que l'utilisateur existe et est ACTIF
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: decoded.userId },
      select: {
        id_utilisateur: true,
        status_compte: true,
        role: true,
      },
    });

    if (!user) {
      return sendResponse(res, 401, false, 'Utilisateur non trouvé');
    }

    if (user.status_compte !== 'ACTIF') {
      return sendResponse(res, 401, false, 'Compte inactif ou suspendu');
    }

    // 4. Attacher les infos à la requête
    req.user = {
      id: user.id_utilisateur,
      role: user.role
    };
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, false, 'Token expiré');
    }
    return sendResponse(res, 401, false, 'Token invalide', null, error);
  }
};

export { authMiddleware };

export const optionalAuth = (req, res, next) => {
  let token = req.cookies?.accessToken
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123')
    req.user = { id: decoded.userId, role: decoded.role }
  } catch (e) {
    req.user = null
  }
  next()
}