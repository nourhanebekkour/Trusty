// Vérifie le niveau d'accès de l'utilisateur
// S'utilise APRÈS authMiddleware
// authMiddleware → "es-tu connecté ?"
// requireRole → "as-tu le bon rôle ?"
const requireRole = (...roles) => {
  return (req, res, next) => {

    // Vérifier que req.user existe et a un rôle
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Accès refusé : rôle requis' });
    }

    // Vérifier que le rôle est dans la liste autorisée
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}`,
      });
    }

    // Rôle valide → on continue
    next();
  };
};

export { requireRole };