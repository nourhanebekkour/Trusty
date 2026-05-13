import * as authService from '../Services/auth.service.js';
import sendResponse from '../Utils/responseHandler.js';
import prisma from '../Config/prismaClient.js';

const register = async (req, res) => {
  
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Inscription d\'un nouvel utilisateur'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informations d\'inscription',
        required: true,
        schema: { $ref: '#/definitions/RegisterRequest' }
  } */
  try {
    const { email, password, nom, prenom, role } = req.body;

    if (!email || !password || !nom || !prenom) {
      return sendResponse(res, 400, false, 'Champs manquants (email, password, nom, prenom)');
    }

    const result = await authService.register(email, password, nom, prenom,role);
    return sendResponse(res, 201, true, 'Inscription réussie', result);

  } catch (err) {
    console.error('[register]', err);
    return sendResponse(res, 400, false, err.message);
  }
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
    const result = await authService.login(email, password);
    return sendResponse(res, 200, true, 'Connexion réussie', result);

  } catch (err) {
    console.error('[login]', err);
    return sendResponse(res, 401, false, err.message);
  }
};

const getMe = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Récupérer les informations de l\'utilisateur connecté'
   try {
    const user = await authService.getMe(req.user.id);
    if (!user) return sendResponse(res, 404, false, 'Utilisateur non trouvé');
    return sendResponse(res, 200, true, 'Utilisateur récupéré', user);

  } catch (err) {
    console.error('[getMe]', err);
    return sendResponse(res, 500, false, 'Erreur serveur');
  }
};
const oublierMDP = async (req, res) => {
  try {
    const { email } = req.body;
    if(!email) {
      return sendResponse(res, 400, false, 'Email est requis');
    }
    await authService.oublierMDP(email);
    return sendResponse(res, 200, true, 'Email de réinitialisation envoyé');
  } catch (err) {
    console.error("Erreur Forget Password:", err);
    return sendResponse(res, 400, false, "Erreur lors de l'envoi de l'email", null, err.message || err);
  }
};
const changerMDP = async (req, res) => {
  try {
    const { token, nouveauMotDePasse } = req.body;
    if (!token || !nouveauMotDePasse) {
      return sendResponse(res, 400, false, 'Token et nouveau mot de passe sont requis');
    }
    await authService.changerMDP(token, nouveauMotDePasse);
    return sendResponse(res, 200, true, 'Mot de passe réinitialisé avec succès');
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }    
}
export { register, login, getMe , oublierMDP,changerMDP};
