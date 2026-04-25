function requireRole(...roles) {
  return (req, res, next) => {

    // vérifier si user existe (authMiddleware doit passer avant)
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: 'Accès refusé : rôle requis'
      });
    }

    // vérifier si rôle autorisé
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}`
      });
    }

    next(); // autorisé
  };
}

module.exports = requireRole;