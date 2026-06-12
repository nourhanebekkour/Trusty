import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

// --- Mocks ---
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma,
}));

const mockJwt = {
    verify: jest.fn(),
};
await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: mockJwt,
}));

// Import après les mocks
const { authMiddleware, optionalAuth } = await import('#Middlewares/auth.middleware.js');

// --- Helpers ---
const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const makeReq = (overrides = {}) => ({
    cookies: {},
    headers: {},
    ...overrides,
});

// ─────────────────────────────────────────────
describe('authMiddleware', () => {

    let next;

    beforeEach(() => {
        next = jest.fn();
        jest.clearAllMocks();
    });

    // ── Cas : aucun token ──────────────────────
    describe('aucun token fourni', () => {

        test('sans cookie ni header → 401 "Aucun token fourni"', async () => {
            const req = makeReq();
            const res = makeRes();

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Aucun token fourni' })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('header Authorization sans "Bearer " → 401 "Aucun token fourni"', async () => {
            const req = makeReq({ headers: { authorization: 'Basic abc123' } });
            const res = makeRes();

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    // ── Cas : token valide ─────────────────────
    describe('token valide', () => {

        test('token dans le cookie → req.user attaché et next() appelé', async () => {
            const req = makeReq({ cookies: { accessToken: 'valid-cookie-token' } });
            const res = makeRes();

            mockJwt.verify.mockReturnValue({ userId: 'user-1' });
            mockPrisma.utilisateur.findUnique.mockResolvedValue({
                id_utilisateur: 'user-1',
                status_compte: 'ACTIF',
                role: 'ETUDIANT',
            });

            await authMiddleware(req, res, next);

            expect(req.user).toEqual({ id: 'user-1', role: 'ETUDIANT' });
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test('token dans le header Authorization Bearer → req.user attaché et next() appelé', async () => {
            const req = makeReq({ headers: { authorization: 'Bearer valid-header-token' } });
            const res = makeRes();

            mockJwt.verify.mockReturnValue({ userId: 'user-2' });
            mockPrisma.utilisateur.findUnique.mockResolvedValue({
                id_utilisateur: 'user-2',
                status_compte: 'ACTIF',
                role: 'ADMINISTRATEUR',
            });

            await authMiddleware(req, res, next);

            expect(mockJwt.verify).toHaveBeenCalledWith('valid-header-token', expect.any(String));
            expect(req.user).toEqual({ id: 'user-2', role: 'ADMINISTRATEUR' });
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    // ── Cas : utilisateur introuvable / inactif ─
    describe('utilisateur introuvable ou inactif', () => {

        test('utilisateur non trouvé en DB → 401 "Utilisateur non trouvé"', async () => {
            const req = makeReq({ cookies: { accessToken: 'some-token' } });
            const res = makeRes();

            mockJwt.verify.mockReturnValue({ userId: 'ghost-user' });
            mockPrisma.utilisateur.findUnique.mockResolvedValue(null);

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Utilisateur non trouvé' })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('compte inactif → 401 "Compte inactif ou suspendu"', async () => {
            const req = makeReq({ cookies: { accessToken: 'some-token' } });
            const res = makeRes();

            mockJwt.verify.mockReturnValue({ userId: 'user-3' });
            mockPrisma.utilisateur.findUnique.mockResolvedValue({
                id_utilisateur: 'user-3',
                status_compte: 'INACTIF',
                role: 'ETUDIANT',
            });

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Compte inactif ou suspendu' })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('compte suspendu → 401 "Compte inactif ou suspendu"', async () => {
            const req = makeReq({ cookies: { accessToken: 'some-token' } });
            const res = makeRes();

            mockJwt.verify.mockReturnValue({ userId: 'user-4' });
            mockPrisma.utilisateur.findUnique.mockResolvedValue({
                id_utilisateur: 'user-4',
                status_compte: 'SUSPENDU',
                role: 'ETUDIANT',
            });

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Compte inactif ou suspendu' })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    // ── Cas : erreurs JWT ─────────────────────
    describe('erreurs JWT', () => {

        test('TokenExpiredError → 401 "Token expiré"', async () => {
            const req = makeReq({ cookies: { accessToken: 'expired-token' } });
            const res = makeRes();

            const expiredError = new Error('jwt expired');
            expiredError.name = 'TokenExpiredError';
            mockJwt.verify.mockImplementation(() => { throw expiredError; });

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Token expiré' })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('token malformé → 401 "Token invalide"', async () => {
            const req = makeReq({ cookies: { accessToken: 'bad-token' } });
            const res = makeRes();

            const invalidError = new Error('invalid signature');
            invalidError.name = 'JsonWebTokenError';
            mockJwt.verify.mockImplementation(() => { throw invalidError; });

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Token invalide' })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });
});

// ─────────────────────────────────────────────
describe('optionalAuth', () => {

    let next;

    beforeEach(() => {
        next = jest.fn();
        jest.clearAllMocks();
    });

    test('sans token → req.user = null et next() appelé', () => {
        const req = makeReq();
        const res = makeRes();

        optionalAuth(req, res, next);

        expect(req.user).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('token valide dans le cookie → req.user attaché', () => {
        const req = makeReq({ cookies: { accessToken: 'valid-token' } });
        const res = makeRes();

        mockJwt.verify.mockReturnValue({ userId: 'u-1', role: 'ETUDIANT' });

        optionalAuth(req, res, next);

        expect(req.user).toEqual({ id: 'u-1', role: 'ETUDIANT' });
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('token valide dans le header Authorization Bearer → req.user attaché', () => {
        const req = makeReq({ headers: { authorization: 'Bearer valid-header-token' } });
        const res = makeRes();

        mockJwt.verify.mockReturnValue({ userId: 'u-2', role: 'PROFESSEUR' });

        optionalAuth(req, res, next);

        expect(req.user).toEqual({ id: 'u-2', role: 'PROFESSEUR' });
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('token invalide → req.user = null et next() appelé quand même', () => {
        const req = makeReq({ cookies: { accessToken: 'bad-token' } });
        const res = makeRes();

        mockJwt.verify.mockImplementation(() => { throw new Error('invalid'); });

        optionalAuth(req, res, next);

        expect(req.user).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('header Authorization sans "Bearer " → ignoré, req.user = null', () => {
        const req = makeReq({ headers: { authorization: 'Basic xyz' } });
        const res = makeRes();

        optionalAuth(req, res, next);

        expect(req.user).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });
});
