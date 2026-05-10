import { jest } from '@jest/globals';

// Mocks
const mockRegister = jest.fn();
const mockLogin = jest.fn();

await jest.unstable_mockModule('../../../src/Services/auth.service.js', () => ({
    register: mockRegister,
    login: mockLogin
}));

// Mock prisma 
const mockFindUnique = jest.fn();
await jest.unstable_mockModule('../../../src/Config/prismaClient.js', () => ({
    default: {
        utilisateur: {
            findUnique: mockFindUnique
        }
    }
}));

const { register, login, getMe } = await import('../../../src/Controllers/auth.controller.js');

describe('Controller Auth', () => {

    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, user: { id: 'u-1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // REGISTER

    describe('register', () => {

        test('doit retourner 201 si inscription réussie', async () => {
            req.body = { email: 'test@test.com', password: 'password', nom: 'Test', prenom: 'User' };
            const mockData = { token: 'test-token', user: { id_utilisateur: 'u1' } };
            mockRegister.mockResolvedValue(mockData);

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Inscription réussie'
            }));
        });

        test('doit retourner 400 si champs manquants', async () => {
            req.body = { email: 'test@test.com' }; // nom, prenom, password manquants

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Champs manquants (email, password, nom, prenom)'
            }));
        });

        test('doit retourner 400 si service échoue', async () => {
            req.body = { email: 'test@test.com', password: 'password', nom: 'Test', prenom: 'User' };
            mockRegister.mockRejectedValue(new Error('Cet email est déjà utilisé'));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // LOGIN

    describe('login', () => {

        test('doit retourner 200 si connexion réussie', async () => {
            req.body = { email: 'test@test.com', password: 'password' };
            const mockData = { token: 'test-token', user: { id_utilisateur: 'u1' } };
            mockLogin.mockResolvedValue(mockData);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Connexion réussie'
            }));
        });

        test('doit retourner 401 si service échoue', async () => {
            req.body = { email: 'test@test.com', password: 'wrong' };
            mockLogin.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    // GETME
    describe('getMe', () => {

        test('doit retourner 200 avec les infos utilisateur', async () => {
            const mockUser = { id_utilisateur: 'u1', email: 'test@test.com', nom: 'Test', prenom: 'User' };
            mockFindUnique.mockResolvedValue(mockUser);

            await getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: mockUser
            }));
        });

        test('doit retourner 404 si utilisateur non trouvé', async () => {
            mockFindUnique.mockResolvedValue(null);

            await getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockFindUnique.mockRejectedValue(new Error('Erreur DB'));

            await getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});