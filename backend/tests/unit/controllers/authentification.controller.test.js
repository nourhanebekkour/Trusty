import { jest } from '@jest/globals';

// ============================================================
// MOCKS DU SERVICE
// Le controller ne fait pas de logique métier lui-même :
// il délègue tout au service. On mock toutes les fonctions
// exportées pour tester le controller en isolation totale.
// ============================================================
const mockRegister    = jest.fn();
const mockLogin       = jest.fn();
const mockRefreshToken = jest.fn();
const mockLogout      = jest.fn();
const mockGetMe       = jest.fn();
const mockOublierMDP  = jest.fn();
const mockChangerMDP  = jest.fn();

await jest.unstable_mockModule('#Modules/identite/authentification/authentification.service.js', () => ({
    register:     mockRegister,
    login:        mockLogin,
    refreshToken: mockRefreshToken,
    logout:       mockLogout,
    getMe:        mockGetMe,
    oublierMDP:   mockOublierMDP,
    changerMDP:   mockChangerMDP,
}));

const {
    register,
    login,
    refresh,
    logout,
    getMe,
    oublierMDP,
    changerMDP,
} = await import('#Modules/identite/authentification/authentification.controller.js');

// ============================================================
// Setup req / res simulés
// Le controller reçoit (req, res) d'Express. On les simule
// avec des jest.fn() pour vérifier ce qu'il appelle.
//
// • status().mockReturnThis() → permet le chaînage res.status(200).json(...)
// • cookie / clearCookie     → vérifier que les tokens sont bien posés/effacés
// ============================================================
let req, res;

beforeEach(() => {
    req = {
        body:    {},
        params:  {},
        cookies: {},
        user:    { id: 'u-1' },
    };
    res = {
        status:      jest.fn().mockReturnThis(),
        json:        jest.fn(),
        cookie:      jest.fn(),
        clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
});

// ============================================================
// register
// ============================================================
describe('register', () => {

    test('retourne 201 si inscription réussie', async () => {
        req.body = { email: 'test@test.com', password: 'password', nom: 'Test', prenom: 'User' };
        mockRegister.mockResolvedValue({ id_utilisateur: 'u1' });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Inscription réussie',
        }));
    });

    test('retourne 400 si champs manquants', async () => {
        req.body = { email: 'test@test.com' }; // nom, prenom, password absents

        await register(req, res);

        // Le controller vérifie les champs AVANT d'appeler le service
        expect(mockRegister).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Champs manquants (email, password, nom, prenom)',
        }));
    });

    test('retourne 400 si le service lève une erreur (ex: email déjà utilisé)', async () => {
        req.body = { email: 'test@test.com', password: 'password', nom: 'Test', prenom: 'User' };
        mockRegister.mockRejectedValue(new Error('Cet email est déjà utilisé'));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Cet email est déjà utilisé',
        }));
    });
});

// ============================================================
// login
// ============================================================
describe('login', () => {

    test('retourne 200 et pose les deux cookies si connexion réussie', async () => {
        req.body = { email: 'test@test.com', password: 'password' };
        mockLogin.mockResolvedValue({
            accessToken:  'access-token',
            refreshToken: 'refresh-token',
            user: { id_utilisateur: 'u1', email: 'test@test.com' },
        });

        await login(req, res);

        // Les deux tokens doivent être posés dans des cookies HttpOnly
        expect(res.cookie).toHaveBeenCalledWith('accessToken',  'access-token',  expect.any(Object));
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Connexion réussie',
        }));
    });

    test('retourne 401 si le service lève une erreur (mauvais mdp, compte inactif...)', async () => {
        req.body = { email: 'test@test.com', password: 'wrong' };
        mockLogin.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Email ou mot de passe incorrect',
        }));
    });
});

// ============================================================
// refresh
// Renouvelle l'access token à partir du refresh token dans les cookies.
// ============================================================
describe('refresh', () => {

    test('retourne 401 si le cookie refreshToken est absent', async () => {
        req.cookies = {}; // pas de refreshToken

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

    test('retourne 401 si le service lève une erreur (token expiré, invalide...)', async () => {
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

// ============================================================
// logout
// Déconnecte l'utilisateur : efface les cookies et supprime
// le refresh token en BDD (via le service).
// ============================================================
describe('logout', () => {

    test('retourne 200 et efface les deux cookies si déconnexion réussie', async () => {
        mockLogout.mockResolvedValue();

        await logout(req, res);

        expect(mockLogout).toHaveBeenCalledWith('u-1');
        // Les deux cookies doivent être effacés côté client
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

// ============================================================
// getMe
// Retourne les infos du compte connecté (req.user.id injecté
// par authMiddleware).
// ============================================================
describe('getMe', () => {

    test('retourne 200 avec les infos utilisateur', async () => {
        const mockUser = { id_utilisateur: 'u-1', email: 'test@test.com', nom: 'Test', prenom: 'User' };
        mockGetMe.mockResolvedValue(mockUser);

        await getMe(req, res);

        expect(mockGetMe).toHaveBeenCalledWith('u-1');
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

// ============================================================
// oublierMDP
// ============================================================
describe('oublierMDP', () => {

    test('retourne 400 si l\'email est absent du body', async () => {
        req.body = {};

        await oublierMDP(req, res);

        expect(mockOublierMDP).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Email est requis',
        }));
    });

    test('retourne 200 si l\'email est envoyé (peu importe si l\'email existe ou non)', async () => {
        req.body = { email: 'test@test.com' };
        mockOublierMDP.mockResolvedValue();

        await oublierMDP(req, res);

        expect(mockOublierMDP).toHaveBeenCalledWith('test@test.com');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Email de réinitialisation envoyé',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.body = { email: 'test@test.com' };
        mockOublierMDP.mockRejectedValue(new Error('Erreur envoi email'));

        await oublierMDP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});

// ============================================================
// changerMDP
// ============================================================
describe('changerMDP', () => {

    test('retourne 400 si token ou nouveauMotDePasse est absent', async () => {
        req.body = { token: 'tok' }; // nouveauMotDePasse manquant

        await changerMDP(req, res);

        expect(mockChangerMDP).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Token et nouveau mot de passe sont requis',
        }));
    });

    test('retourne 200 si le mot de passe est réinitialisé avec succès', async () => {
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

    test('retourne 400 si le service lève une erreur (token invalide, expiré...)', async () => {
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
