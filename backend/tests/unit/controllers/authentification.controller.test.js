import { jest } from '@jest/globals';

const mockRegister              = jest.fn();
const mockVerifierEmail         = jest.fn();
const mockCreerUtilisateurAdmin = jest.fn();
const mockDemanderCreationCompte = jest.fn();
const mockLogin                 = jest.fn();
const mockRefreshToken          = jest.fn();
const mockLogout                = jest.fn();
const mockGetMe                 = jest.fn();
const mockOublierMDP            = jest.fn();
const mockChangerMDP            = jest.fn();

await jest.unstable_mockModule('#Modules/identite/authentification/authentification.service.js', () => ({
    register:               mockRegister,
    verifierEmail:          mockVerifierEmail,
    creerUtilisateurAdmin:  mockCreerUtilisateurAdmin,
    demanderCreationCompte: mockDemanderCreationCompte,
    login:                  mockLogin,
    refreshToken:           mockRefreshToken,
    logout:                 mockLogout,
    getMe:                  mockGetMe,
    oublierMDP:             mockOublierMDP,
    changerMDP:             mockChangerMDP,
}));

const {
    register,
    verifierEmail,
    creerUtilisateurAdmin,
    demanderCreationCompte,
    login,
    refresh,
    logout,
    getMe,
    oublierMDP,
    changerMDP,
} = await import('#Modules/identite/authentification/authentification.controller.js');

let req, res;

beforeEach(() => {
    req = {
        body:    {},
        params:  {},
        cookies: {},
        user:    { id: 'u1' },
    };
    res = {
        status:      jest.fn().mockReturnThis(),
        json:        jest.fn(),
        cookie:      jest.fn(),
        clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
});

describe('register', () => {

    test('retourne 201 si inscription réussie', async () => {
        req.body = { email: 'test@etu.uae.ac.ma', password: 'password', nom: 'test', prenom: 'user', role: 'ETUDIANT', ecole: 'UAE' };
        mockRegister.mockResolvedValue({ user: { id_utilisateur: 'u1' } });

        await register(req, res);

        expect(mockRegister).toHaveBeenCalledWith('test@etu.uae.ac.ma', 'password', 'test', 'user', 'ETUDIANT', 'UAE');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Inscription réussie. Un email de vérification a été envoyé.',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.body = { email: 'test@etu.uae.ac.ma', password: 'password', nom: 'test', prenom: 'user', role: 'ETUDIANT' };
        mockRegister.mockRejectedValue(new Error('Cet email est déjà utilisé'));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Cet email est déjà utilisé',
        }));
    });
});

describe('verifierEmail', () => {

    test('retourne 200 avec message ACTIF pour un ETUDIANT', async () => {
        req.body = { token: 'token-valide' };
        mockVerifierEmail.mockResolvedValue({ role: 'ETUDIANT', status_compte: 'ACTIF' });

        await verifierEmail(req, res);

        expect(mockVerifierEmail).toHaveBeenCalledWith('token-valide');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Email vérifié. Votre compte est maintenant actif.',
        }));
    });

    test('retourne 200 avec message EN ATTENTE pour un PROFESSIONNEL', async () => {
        req.body = { token: 'token-pro' };
        mockVerifierEmail.mockResolvedValue({ role: 'PROFESSIONNEL', status_compte: 'INACTIF' });

        await verifierEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Email vérifié. Votre compte est en attente de validation par un administrateur.',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.body = { token: 'token-invalide' };
        mockVerifierEmail.mockRejectedValue(new Error('Token de vérification invalide'));

        await verifierEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Token de vérification invalide',
        }));
    });
});

describe('creerUtilisateurAdmin', () => {

    test('retourne 201 si admin créé avec succès', async () => {
        req.body = { nom: 'test', prenom: 'user', email: 'admin@uae.ac.ma', niveau_acces: 'ADMIN_ECOLE', ecole: 'UAE' };
        mockCreerUtilisateurAdmin.mockResolvedValue({ user: { id_utilisateur: 'a1' } });

        await creerUtilisateurAdmin(req, res);

        expect(mockCreerUtilisateurAdmin).toHaveBeenCalledWith({ nom: 'test', prenom: 'user', email: 'admin@uae.ac.ma', niveau_acces: 'ADMIN_ECOLE', ecole: 'UAE' });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Compte administrateur créé. Les identifiants ont été envoyés par email.',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.body = { nom: 'test', prenom: 'user', email: 'admin@uae.ac.ma', niveau_acces: 'ADMIN_ECOLE', ecole: 'UAE' };
        mockCreerUtilisateurAdmin.mockRejectedValue(new Error('Cet email est déjà utilisé'));

        await creerUtilisateurAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Cet email est déjà utilisé',
        }));
    });
});

describe('demanderCreationCompte', () => {

    test('retourne 200 si la demande est envoyée', async () => {
        req.body = { nom: 'test', prenom: 'user', email: 'test@entreprise.com', role: 'PROFESSIONNEL', message: 'demande' };
        mockDemanderCreationCompte.mockResolvedValue();

        await demanderCreationCompte(req, res);

        expect(mockDemanderCreationCompte).toHaveBeenCalledWith({ nom: 'test', prenom: 'user', email: 'test@entreprise.com', role: 'PROFESSIONNEL', message: 'demande' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        req.body = { nom: 'test', prenom: 'user', email: 'test@entreprise.com', role: 'PROFESSIONNEL', message: 'demande' };
        mockDemanderCreationCompte.mockRejectedValue(new Error('Erreur envoi email'));

        await demanderCreationCompte(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});

describe('login', () => {

    test('retourne 200 et pose les deux cookies si connexion réussie', async () => {
        req.body = { email: 'test@etu.uae.ac.ma', password: 'password' };
        mockLogin.mockResolvedValue({
            accessToken:  'access-token',
            refreshToken: 'refresh-token',
            user: { id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma' },
        });

        await login(req, res);

        expect(res.cookie).toHaveBeenCalledWith('accessToken',  'access-token',  expect.any(Object));
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Connexion réussie',
        }));
    });

    test('retourne 401 si le service lève une erreur', async () => {
        req.body = { email: 'test@etu.uae.ac.ma', password: 'wrong' };
        mockLogin.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Email ou mot de passe incorrect',
        }));
    });
});

describe('refresh', () => {

    test('retourne 401 si le cookie refreshToken est absent', async () => {
        req.cookies = {};

        await refresh(req, res);

        expect(mockRefreshToken).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Refresh token manquant',
        }));
    });

    test('retourne 200 et pose un nouveau cookie accessToken si token valide', async () => {
        req.cookies = { refreshToken: 'old-refresh-token' };
        mockRefreshToken.mockResolvedValue({ accessToken: 'new-access-token' });

        await refresh(req, res);

        expect(mockRefreshToken).toHaveBeenCalledWith('old-refresh-token');
        expect(res.cookie).toHaveBeenCalledWith('accessToken', 'new-access-token', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Token renouvelé',
        }));
    });

    test('retourne 401 si le service lève une erreur', async () => {
        req.cookies = { refreshToken: 'bad-token' };
        mockRefreshToken.mockRejectedValue(new Error('Refresh token invalide ou expiré'));

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Refresh token invalide ou expiré',
        }));
    });
});

describe('logout', () => {

    test('retourne 200 et efface les deux cookies', async () => {
        mockLogout.mockResolvedValue();

        await logout(req, res);

        expect(mockLogout).toHaveBeenCalledWith('u1');
        expect(res.clearCookie).toHaveBeenCalledWith('accessToken',  expect.any(Object));
        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Déconnexion réussie',
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        mockLogout.mockRejectedValue(new Error('Erreur DB'));

        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur serveur',
        }));
    });
});

describe('getMe', () => {

    test('retourne 200 avec les infos utilisateur', async () => {
        const mockUser = { id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma', nom: 'test', prenom: 'user' };
        mockGetMe.mockResolvedValue(mockUser);

        await getMe(req, res);

        expect(mockGetMe).toHaveBeenCalledWith('u1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: mockUser,
        }));
    });

    test('retourne 404 si utilisateur non trouvé', async () => {
        mockGetMe.mockResolvedValue(null);

        await getMe(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Utilisateur non trouvé',
        }));
    });

    test('retourne 500 en cas d\'erreur serveur', async () => {
        mockGetMe.mockRejectedValue(new Error('Erreur DB'));

        await getMe(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur serveur',
        }));
    });
});

describe('oublierMDP', () => {

    test('retourne 400 si email absent du body', async () => {
        req.body = {};

        await oublierMDP(req, res);

        expect(mockOublierMDP).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Email est requis',
        }));
    });

    test('retourne 200 si email envoyé', async () => {
        req.body = { email: 'test@etu.uae.ac.ma' };
        mockOublierMDP.mockResolvedValue();

        await oublierMDP(req, res);

        expect(mockOublierMDP).toHaveBeenCalledWith('test@etu.uae.ac.ma');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Email de réinitialisation envoyé',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.body = { email: 'test@etu.uae.ac.ma' };
        mockOublierMDP.mockRejectedValue(new Error('Erreur envoi email'));

        await oublierMDP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});

describe('changerMDP', () => {

    test('retourne 400 si token ou nouveauMotDePasse absent', async () => {
        req.body = { token: 'tok' };

        await changerMDP(req, res);

        expect(mockChangerMDP).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Token et nouveau mot de passe sont requis',
        }));
    });

    test('retourne 200 si mot de passe réinitialisé avec succès', async () => {
        req.body = { token: 'valid-token', nouveauMotDePasse: 'newPassword123' };
        mockChangerMDP.mockResolvedValue();

        await changerMDP(req, res);

        expect(mockChangerMDP).toHaveBeenCalledWith('valid-token', 'newPassword123');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Mot de passe réinitialisé avec succès',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.body = { token: 'bad-token', nouveauMotDePasse: 'newPassword123' };
        mockChangerMDP.mockRejectedValue(new Error('Token de réinitialisation invalide'));

        await changerMDP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Token de réinitialisation invalide',
        }));
    });
});
