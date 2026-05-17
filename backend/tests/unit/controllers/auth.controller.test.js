import { jest } from '@jest/globals';

// Mocks du service
const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockGetMe = jest.fn();

await jest.unstable_mockModule('#Modules/identite/authentification/authentification.service.js', () => ({
    register: mockRegister,
    login: mockLogin,
    getMe: mockGetMe,
}));

const { register, login, getMe } = await import('#Modules/identite/authentification/authentification.controller.js');

describe('Controller Auth', () => {

    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, user: { id: 'u-1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // REGISTER

    describe('register', () => {

        test('doit retourner 201 si inscription réussie', async () => {
            req.body = { email: 'test@test.com', password: 'password', nom: 'Test', prenom: 'User' };
            mockRegister.mockResolvedValue({ id_utilisateur: 'u1' });

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Inscription réussie',
            }));
        });

        test('doit retourner 400 si champs manquants', async () => {
            req.body = { email: 'test@test.com' };

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Champs manquants (email, password, nom, prenom)',
            }));
        });

        test('doit retourner 400 si le service lève une erreur', async () => {
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

    // LOGIN

    describe('login', () => {

        test('doit retourner 200 et poser les cookies si connexion réussie', async () => {
            req.body = { email: 'test@test.com', password: 'password' };
            mockLogin.mockResolvedValue({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: { id_utilisateur: 'u1', email: 'test@test.com' },
            });

            await login(req, res);

            expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.any(Object));
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Connexion réussie',
            }));
        });

        test('doit retourner 401 si le service lève une erreur', async () => {
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

    // GETME

    describe('getMe', () => {

        test('doit retourner 200 avec les infos utilisateur', async () => {
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

        test('doit retourner 404 si utilisateur non trouvé', async () => {
            mockGetMe.mockResolvedValue(null);

            await getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Utilisateur non trouvé',
            }));
        });

        test('doit retourner 500 en cas d\'erreur serveur', async () => {
            mockGetMe.mockRejectedValue(new Error('Erreur DB'));

            await getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Erreur serveur',
            }));
        });
    });
});
