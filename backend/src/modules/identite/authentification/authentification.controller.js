import * as authentificationService from './authentification.service.js';
import sendResponse from '#Utils/response.handler.js';

const register = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Inscription publique — crée un compte selon le rôle'
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/RegisterRequest' }
  } */
  try {
    const { email, password, nom, prenom, role, ecole } = req.body;
    const result = await authentificationService.register(email, password, nom, prenom, role, ecole);
    return sendResponse(res, 201, true, 'Inscription réussie. Un email de vérification a été envoyé.', result);
  } catch (err) {
    console.error('[register]', err);
    return sendResponse(res, 400, false, err.message);
  }
};

const verifierEmail = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Vérifier l\'adresse email via le token reçu par email'
  try {
    const { token } = req.body;
    const result = await authentificationService.verifierEmail(token);
    const message = result.role === 'ETUDIANT'
      ? 'Email vérifié. Votre compte est maintenant actif.'
      : 'Email vérifié. Votre compte est en attente de validation par un administrateur.';
    return sendResponse(res, 200, true, message, result);
  } catch (err) {
    console.error('[verifierEmail]', err);
    return sendResponse(res, 400, false, err.message);
  }
};

const creerUtilisateurAdmin = async (req, res) => {
  // #swagger.tags = ['Admin']
  // #swagger.summary = 'Créer un compte utilisateur (admin uniquement)'
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/CreateUserAdminRequest' }
  } */
  try {
    const { nom, prenom, email, niveau_acces, ecole } = req.body;
    const result = await authentificationService.creerUtilisateurAdmin({ nom, prenom, email, niveau_acces, ecole });
    return sendResponse(res, 201, true, 'Compte administrateur créé. Les identifiants ont été envoyés par email.', result);
  } catch (err) {
    console.error('[creerUtilisateurAdmin]', err);
    return sendResponse(res, 400, false, err.message);
  }
};

const demanderCreationCompte = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Demander la création d\'un compte à l\'admin'
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/definitions/RequestAccountRequest' }
  } */
  try {
    const { nom, prenom, email, role, message } = req.body;
    await authentificationService.demanderCreationCompte({ nom, prenom, email, role, message });
    return sendResponse(res, 200, true, 'Votre demande a été envoyée à l\'administrateur.');
  } catch (err) {
    console.error('[demanderCreationCompte]', err);
    return sendResponse(res, 500, false, 'Erreur lors de l\'envoi de la demande.');
  }
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
};

const login = async (req, res) => {

  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Connexion d\'un utilisateur'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Identifiants de connexion',
        required: true,
        schema: { $ref: '#/definitions/LoginRequest' }
  } */
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authentificationService.login(email, password);

    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, true, 'Connexion réussie', { user });

  } catch (err) {
    console.error('[login]', err);
    return sendResponse(res, 401, false, err.message);
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return sendResponse(res, 401, false, 'Refresh token manquant');
    }
    const { accessToken } = await authentificationService.refreshToken(token);
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    return sendResponse(res, 200, true, 'Token renouvelé');
  } catch (err) {
    return sendResponse(res, 401, false, err.message);
  }
};

const logout = async (req, res) => {
  try {
    await authentificationService.logout(req.user.id);
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return sendResponse(res, 200, true, 'Déconnexion réussie');
  } catch (err) {
    return sendResponse(res, 500, false, 'Erreur serveur');
  }
};

const getMe = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Récupérer les informations de l\'utilisateur connecté'
   try {
    const user = await authentificationService.getMe(req.user.id);
    if (!user) return sendResponse(res, 404, false, 'Utilisateur non trouvé');
    return sendResponse(res, 200, true, 'Utilisateur récupéré', user);

  } catch (err) {
    console.error('[getMe]', err);
    return sendResponse(res, 500, false, 'Erreur serveur');
  }
};
const oublierMDP = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Demande de réinitialisation de mot de passe'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Email de l\'utilisateur',
        required: true,
        schema: { $ref: '#/definitions/ForgotPasswordRequest' }
  } */
  try {
    const { email } = req.body;
    if(!email) {
      return sendResponse(res, 400, false, 'Email est requis');
    }
    await authentificationService.oublierMDP(email);
    return sendResponse(res, 200, true, 'Email de réinitialisation envoyé');
  } catch (err) {
    console.error("Erreur Forget Password:", err);
    return sendResponse(res, 400, false, "Erreur lors de l'envoi de l'email", null, err.message || err);
  }
};
const changerMDP = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Réinitialiser le mot de passe avec un token'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Token de réinitialisation et nouveau mot de passe',
        required: true,
        schema: { $ref: '#/definitions/ResetPasswordRequest' }
  } */
  try {
    const { token, nouveauMotDePasse } = req.body;
    if (!token || !nouveauMotDePasse) {
      return sendResponse(res, 400, false, 'Token et nouveau mot de passe sont requis');
    }
    await authentificationService.changerMDP(token, nouveauMotDePasse);
    return sendResponse(res, 200, true, 'Mot de passe réinitialisé avec succès');
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }    
}
export { register, verifierEmail, creerUtilisateurAdmin, demanderCreationCompte, login, refresh, logout, getMe, oublierMDP, changerMDP };
