import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

// ============================================================
// MOCKS
// Règle Jest ESM : tous les unstable_mockModule doivent être
// déclarés AVANT le premier import du module testé.
// Jest intercepte les imports et injecte nos faux modules.
// ============================================================

// --- Prisma ---
// On remplace le vrai client Prisma par notre objet de faux jest.fn()
// pour ne jamais toucher une vraie base de données.
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma,
}));

// --- bcryptjs ---
// Le service hash les mots de passe avec bcrypt. En test on ne veut
// pas vraiment hasher (lent, inutile) : on contrôle les retours.
const mockBcrypt = {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
};
await jest.unstable_mockModule('bcryptjs', () => ({
    default: mockBcrypt,
}));

// --- jsonwebtoken ---
// Le service utilise DEUX fonctions JWT :
//   • sign   → créer un access token ou refresh token
//   • verify → décoder/valider un refresh token dans refreshToken()
const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
};
await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: mockJwt,
}));

// --- Email service ---
// oublierMDP() appelle envoyerEmailReinitialisation().
// Sans mock, Jest tenterait un vrai appel réseau → crash 
const mockEnvoyerEmail = jest.fn();
await jest.unstable_mockModule('#Modules/systeme/emails/emails.service.js', () => ({
    envoyerEmailReinitialisation: mockEnvoyerEmail,
}));

// ============================================================
// Import du service — APRÈS tous les mocks
// ============================================================
const {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    oublierMDP,
    changerMDP,
} = await import('#Modules/identite/authentification/authentification.service.js');

// Raccourci pratique vers le mock utilisateur
const utilisateur = mockPrisma.utilisateur;

// Reset entre chaque test pour éviter que les retours d'un test
// ne "contaminent" le suivant.
beforeEach(() => {
    jest.clearAllMocks();
});

// ============================================================
// register(email, password, nom, prenom, role)
// ============================================================
describe('register', () => {

    test('crée un utilisateur et le retourne', async () => {
        // Simule : email pas encore en BDD
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPassword');

        const mockUser = {
            id_utilisateur: 'u1',
            email: 'test@test.com',
            nom: 'Test',
            prenom: 'User',
            date_creation: new Date(),
        };
        utilisateur.create.mockResolvedValue(mockUser);

        const result = await register('test@test.com', 'password', 'Test', 'User', 'ETUDIANT');

        expect(utilisateur.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
        expect(utilisateur.create).toHaveBeenCalled();
        expect(result).toEqual({ user: mockUser });
    });

    test('applique le rôle ETUDIANT par défaut si rôle invalide ou absent', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashed');
        utilisateur.create.mockResolvedValue({ id_utilisateur: 'u1' });

        await register('test@test.com', 'password', 'Test', 'User', 'ADMINISTRATEUR');

        // Le rôle ADMINISTRATEUR est interdit à l'inscription → doit être remplacé par ETUDIANT
        const createCall = utilisateur.create.mock.calls[0][0];
        expect(createCall.data.role).toBe('ETUDIANT');
    });

    test('lève une erreur si email déjà utilisé', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', email: 'test@test.com' });

        await expect(register('test@test.com', 'password', 'Test', 'User'))
            .rejects.toThrow('Cet email est déjà utilisé');

        // Prisma.create ne doit jamais être appelé si l'email existe
        expect(utilisateur.create).not.toHaveBeenCalled();
    });

    test('propage l\'erreur si Prisma échoue à la création', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashed');
        utilisateur.create.mockRejectedValue(new Error('Erreur Prisma'));

        await expect(register('test@test.com', 'password', 'Test', 'User'))
            .rejects.toThrow('Erreur Prisma');
    });
});

// ============================================================
// login(email, password)
// ============================================================
describe('login', () => {

    test('retourne accessToken, refreshToken et user sans mot_de_passe si connexion réussie', async () => {
        const mockUser = {
            id_utilisateur: 'u1',
            email: 'test@test.com',
            mot_de_passe: 'hashedPassword',
            status_compte: 'ACTIF',
        };

        utilisateur.findUnique.mockResolvedValue(mockUser);
        utilisateur.update.mockResolvedValue({});
        mockBcrypt.compare.mockResolvedValue(true);
        mockJwt.sign.mockReturnValue('test-token');

        const result = await login('test@test.com', 'password');

        expect(mockBcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
        expect(result.accessToken).toBe('test-token');
        expect(result.refreshToken).toBe('test-token');
        // Le mot de passe ne doit jamais être exposé
        expect(result.user).not.toHaveProperty('mot_de_passe');
    });

    test('lève une erreur si email non trouvé', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(login('inconnu@test.com', 'password'))
            .rejects.toThrow('Email ou mot de passe incorrect');
    });

    test('lève une erreur si compte INACTIF', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
            status_compte: 'INACTIF',
        });

        await expect(login('test@test.com', 'password'))
            .rejects.toThrow('Compte inactif. En attente de validation par un administrateur');
    });

    test('lève une erreur si compte SUSPENDU', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
            status_compte: 'SUSPENDU',
        });

        await expect(login('test@test.com', 'password'))
            .rejects.toThrow('Compte suspendu. Contactez l\'administrateur');
    });

    test('lève une erreur si mot de passe incorrect', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
            mot_de_passe: 'hashedPassword',
            status_compte: 'ACTIF',
        });
        mockBcrypt.compare.mockResolvedValue(false);

        await expect(login('test@test.com', 'wrongpassword'))
            .rejects.toThrow('Email ou mot de passe incorrect');
    });

    test('sauvegarde le refresh token en BDD après connexion réussie', async () => {
        const mockUser = {
            id_utilisateur: 'u1',
            email: 'test@test.com',
            mot_de_passe: 'hashed',
            status_compte: 'ACTIF',
        };
        utilisateur.findUnique.mockResolvedValue(mockUser);
        utilisateur.update.mockResolvedValue({});
        mockBcrypt.compare.mockResolvedValue(true);
        mockJwt.sign.mockReturnValue('token-123');

        await login('test@test.com', 'password');

        expect(utilisateur.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { email: 'test@test.com' },
                data: expect.objectContaining({ refresh_token: 'token-123' }),
            })
        );
    });
});

// ============================================================
// refreshToken(token)
// Renouvelle l'access token à partir d'un refresh token valide.
// ============================================================
describe('refreshToken', () => {

    test('retourne un nouvel access token si le refresh token est valide', async () => {
        // jwt.verify retourne le payload décodé (pas d'exception = token valide)
        mockJwt.verify.mockReturnValue({ userId: 'u1' });

        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            refresh_token: 'valid-refresh-token',
            date_expiration_refresh: new Date(Date.now() + 3600000), // expire dans 1h
        });
        mockJwt.sign.mockReturnValue('new-access-token');

        const result = await refreshToken('valid-refresh-token');

        expect(result.accessToken).toBe('new-access-token');
    });

    test('lève une erreur si le token JWT est invalide ou expiré', async () => {
        // jwt.verify lève une exception → le service doit la convertir en message clair
        mockJwt.verify.mockImplementation(() => {
            throw new Error('jwt malformed');
        });

        await expect(refreshToken('bad-token'))
            .rejects.toThrow('Refresh token invalide ou expiré');
    });

    test('lève une erreur si l\'utilisateur n\'existe pas en BDD', async () => {
        mockJwt.verify.mockReturnValue({ userId: 'u-inconnu' });
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(refreshToken('token'))
            .rejects.toThrow('Utilisateur introuvable');
    });

    test('lève une erreur si le token en BDD ne correspond pas (rotation détectée)', async () => {
        // Sécurité : si le refresh token reçu ≠ celui en BDD, c'est suspect
        mockJwt.verify.mockReturnValue({ userId: 'u1' });
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            refresh_token: 'autre-token-en-bdd',
            date_expiration_refresh: new Date(Date.now() + 3600000),
        });

        await expect(refreshToken('token-different'))
            .rejects.toThrow('Refresh token invalide');
    });

    test('lève une erreur si le refresh token est expiré en BDD', async () => {
        mockJwt.verify.mockReturnValue({ userId: 'u1' });
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            refresh_token: 'valid-token',
            date_expiration_refresh: new Date(Date.now() - 1000), // expiré il y a 1 seconde
        });

        await expect(refreshToken('valid-token'))
            .rejects.toThrow('Refresh token expiré');
    });
});

// ============================================================
// logout(userId)
// Supprime le refresh token de la BDD → invalide la session.
// ============================================================
describe('logout', () => {

    test('supprime le refresh token en BDD', async () => {
        utilisateur.update.mockResolvedValue({});

        await logout('u1');

        expect(utilisateur.update).toHaveBeenCalledWith({
            where: { id_utilisateur: 'u1' },
            data: {
                refresh_token: null,
                date_expiration_refresh: null,
            },
        });
    });
});

// ============================================================
// getMe(id_utilisateur)
// Retourne les infos publiques de l'utilisateur connecté.
// ============================================================
describe('getMe', () => {

    test('retourne les informations de l\'utilisateur', async () => {
        const mockUser = {
            id_utilisateur: 'u1',
            email: 'test@test.com',
            nom: 'Test',
            prenom: 'User',
            role: 'ETUDIANT',
            status_compte: 'ACTIF',
        };
        utilisateur.findUnique.mockResolvedValue(mockUser);

        const result = await getMe('u1');

        expect(utilisateur.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_utilisateur: 'u1' } })
        );
        expect(result).toEqual(mockUser);
    });

    test('retourne null si l\'utilisateur n\'existe pas', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        const result = await getMe('id-inconnu');

        expect(result).toBeNull();
    });
});

// ============================================================
// oublierMDP(email)
// Génère un token de réinitialisation et envoie l'email.
// Sécurité : ne révèle pas si l'email existe ou non (retour silencieux).
// ============================================================
describe('oublierMDP', () => {

    test('ne fait rien si l\'email n\'existe pas (sécurité : pas de fuite d\'info)', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        const result = await oublierMDP('inconnu@test.com');

        // Retour silencieux — on ne lève pas d'erreur pour ne pas révéler
        // qu'un compte existe ou non à un attaquant.
        expect(result).toBeUndefined();
        expect(utilisateur.update).not.toHaveBeenCalled();
        expect(mockEnvoyerEmail).not.toHaveBeenCalled();
    });

    test('sauvegarde le token en BDD et envoie l\'email si l\'email existe', async () => {
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            email: 'test@test.com',
        });
        utilisateur.update.mockResolvedValue({});
        mockEnvoyerEmail.mockResolvedValue();

        await oublierMDP('test@test.com');

        // Le token et sa date d'expiration doivent être sauvegardés
        expect(utilisateur.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { email: 'test@test.com' },
                data: expect.objectContaining({
                    token_reinitialisation: expect.any(String),
                    date_expiration_token: expect.any(Date),
                }),
            })
        );
        // L'email doit être envoyé avec le bon destinataire
        expect(mockEnvoyerEmail).toHaveBeenCalledWith('test@test.com', expect.any(String));
    });
});

// ============================================================
// changerMDP(token, nouveauMotDePasse)
// Réinitialise le mot de passe via un token de réinitialisation.
// ============================================================
describe('changerMDP', () => {

    test('lève une erreur si le token est invalide (non trouvé en BDD)', async () => {
        utilisateur.findFirst.mockResolvedValue(null);

        await expect(changerMDP('token-invalide', 'nouveauMDP123'))
            .rejects.toThrow('Token de réinitialisation invalide');
    });

    test('lève une erreur si le token est expiré', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u1',
            token_reinitialisation: 'token-ok',
            date_expiration_token: new Date(Date.now() - 1000), // expiré il y a 1 seconde
        });

        await expect(changerMDP('token-ok', 'nouveauMDP123'))
            .rejects.toThrow('ce lien a expiré');
    });

    test('hash le nouveau mot de passe et efface le token après réinitialisation', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u1',
            token_reinitialisation: 'token-valide',
            date_expiration_token: new Date(Date.now() + 3600000), // expire dans 1h
        });
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('newHashedPassword');
        utilisateur.update.mockResolvedValue({});

        await changerMDP('token-valide', 'nouveauMDP123');

        expect(mockBcrypt.hash).toHaveBeenCalledWith('nouveauMDP123', 'salt');
        expect(utilisateur.update).toHaveBeenCalledWith({
            where: { id_utilisateur: 'u1' },
            data: {
                mot_de_passe: 'newHashedPassword',
                token_reinitialisation: null,
                date_expiration_token: null,
            },
        });
    });
});
