import sendResponse from '#Utils/response.handler.js';

// Vérifie le niveau d'accès de l'utilisateur
// S'utilise APRÈS authMiddleware
const requireRole = (...roles) => {
  return (req, res, next) => {

    // Vérifier que req.user existe et a un rôle
    if (!req.user || !req.user.role) {
      return sendResponse(res, 403, false, 'Accès refusé : rôle requis');
    }

    // Vérifier que le rôle est dans la liste autorisée
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, false, `Accès refusé. Rôle requis : ${roles.join(' ou ')}`);
    }

    // Rôle valide → on continue
    next();
  };
};

/**
 * Middleware pour autoriser l'accès si l'utilisateur est un ADMIN 
 * OU si l'ID passé en paramètre correspond à son propre ID.
 * @param {string} idParamName - Le nom du paramètre d'ID dans l'URL (ex: 'id', 'id_etudiant')
 */
const requireOwnerOrAdmin = (idParamName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, 401, false, 'Authentification requise');
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const resourceId = req.params[idParamName];

    // L'admin a tous les droits, ou l'utilisateur modifie son propre profil
    if (userRole === 'ADMINISTRATEUR' || userId === resourceId) {
      return next();
    }

    return sendResponse(res, 403, false, "Accès refusé : vous n'êtes pas autorisé à modifier cette ressource");
  };
};

export { requireRole, requireOwnerOrAdmin };
