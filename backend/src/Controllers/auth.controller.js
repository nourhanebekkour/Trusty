import * as authService from '../Services/auth.service.js';
import sendResponse from '../Utils/responseHandler.js';
import prisma from '../Config/prismaClient.js';

const register = async (req, res) => {
  
  try {
    const { email, password, nom, prenom} = req.body;

    if (!email || !password || !nom || !prenom) {
      return sendResponse(res, 400, false, 'Champs manquants (email, password, nom, prenom)');
    }

    const result = await authService.register(email, password, nom, prenom);
    return sendResponse(res, 201, true, 'Inscription réussie', result);

  } catch (err) {
    return sendResponse(res, 400, false, err.message, null, err);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendResponse(res, 200, true, 'Connexion réussie', result);

  } catch (err) {
    return sendResponse(res, 401, false, err.message, null, err);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: req.user.id },
      select: {
        id_utilisateur: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        role: true,
        status_compte: true,
        date_creation: true,
        derniere_connexion: true,
      },
    });

    if (!user) return sendResponse(res, 404, false, 'Utilisateur non trouvé');
    return sendResponse(res, 200, true, 'Utilisateur récupéré', user);

  } catch (err) {
    return sendResponse(res, 500, false, 'Erreur serveur', null, err);
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
    return sendResponse(res, 400, false,"Erreur lors de l'envoi de l'email");
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
