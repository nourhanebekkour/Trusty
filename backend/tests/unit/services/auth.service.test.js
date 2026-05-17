import { jest } from '@jest/globals'
import { mockPrisma } from '../../mocks/prismaMock'

// MOCK PRISMA
const utilisateur = mockPrisma.utilisateur;
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma
}));


// MOCK BCRYPT
const mockBcrypt = {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
};
await jest.unstable_mockModule('bcryptjs', () => ({
    default: mockBcrypt
}));

// MOCK JWT
const mockSign = jest.fn();

await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: mockSign
    }
}));


// Import after tous les MOCKS
const { register, login } = await import('#Modules/identite/authentification/authentification.service.js');

// --- REGISTER --

describe('register', () => {

    test('doit créer un utilisateur et le retourner', async () => {

        utilisateur.findUnique.mockResolvedValue(null); // email pas encore utilisé

        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPassword');

        const mockUser = { id_utilisateur: 'u1', email: 'test@test.com', nom: 'Test', prenom: 'User', date_creation: new Date() };

        utilisateur.create.mockResolvedValue(mockUser);

        const result = await register('test@test.com', 'password', 'Test', 'User');

        expect(utilisateur.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
        expect(utilisateur.create).toHaveBeenCalled();
        expect(result).toEqual({ user: mockUser });
    });

    test('doit lever une erreur si email déjà utilisé', async () => {

        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', email: 'test@test.com' });

        await expect(register('test@test.com', 'password', 'Test', 'User'))
            .rejects.toThrow('Cet email est déjà utilisé');
    });

    test('doit propager l\'erreur si Prisma échoue', async () => {

        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPassword');
        utilisateur.create.mockRejectedValue(new Error('Erreur Prisma'));

        await expect(register('test@test.com', 'password', 'Test', 'User'))
            .rejects.toThrow('Erreur Prisma');
    });
});

// -- LOGIN ---

describe('login', () => {

    test('doit retourner accessToken et refreshToken si connexion réussie', async () => {

        const mockUser = {
            id_utilisateur: 'u1',
            email: 'test@test.com',
            mot_de_passe: 'hashedPassword',
            status_compte: 'ACTIF'
        };

        utilisateur.findUnique.mockResolvedValue(mockUser);
        utilisateur.update.mockResolvedValue({});
        mockBcrypt.compare.mockResolvedValue(true);
        mockSign.mockReturnValue('test-token');

        const result = await login('test@test.com', 'password');

        expect(mockBcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
        expect(result.accessToken).toBe('test-token');
        expect(result.refreshToken).toBeDefined();
        expect(result.user).not.toHaveProperty('mot_de_passe'); // mot de passe exclu
    });

    test('doit lever une erreur si email non trouvé', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(login('inconnu@test.com', 'password'))
            .rejects.toThrow('Email ou mot de passe incorrect');
    });

    test('doit lever une erreur si compte INACTIF', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
            status_compte: 'INACTIF'
        });

        await expect(login('test@test.com', 'password'))
            .rejects.toThrow('Compte inactif. En attente de validation par un administrateur');
    });

    test('doit lever une erreur si compte SUSPENDU', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
            status_compte: 'SUSPENDU'
        });

        await expect(login('test@test.com', 'password'))
            .rejects.toThrow('Compte suspendu. Contactez l\'administrateur');
    });

    test('doit lever une erreur si mot de passe incorrect', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
            mot_de_passe: 'hashedPassword',
            status_compte: 'ACTIF'
        });
        mockBcrypt.compare.mockResolvedValue(false);

        await expect(login('test@test.com', 'wrongpassword'))
            .rejects.toThrow('Email ou mot de passe incorrect');
    });
});