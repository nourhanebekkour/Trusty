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
    return sendResponse(res, 401, false, err.message, null, err);
  }
};

const getMe = async (req, res) => {
  // #swagger.tags = ['Authentification']
  // #swagger.summary = 'Récupérer les informations de l\'utilisateur connecté'
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

export { register, login, getMe };
