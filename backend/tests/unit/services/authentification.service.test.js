import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

// MOCKS
// tous les unstable_mockModule doivent être
// déclarés avanr le premier import du module testé

await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma,
}));

const mockBcrypt = {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
};
await jest.unstable_mockModule('bcryptjs', () => ({
    default: mockBcrypt,
}));

const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
};
await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: mockJwt,
}));

const mockEnvoyerEmailVerification = jest.fn();
const mockEnvoyerEmailCredentiels = jest.fn();
const mockEnvoyerEmailDemandeCompte = jest.fn();
const mockEnvoyerEmailReinitialisation = jest.fn();

await jest.unstable_mockModule('#Modules/systeme/emails/emails.service.js', () => ({
    envoyerEmailVerification: mockEnvoyerEmailVerification,
    envoyerEmailCredentiels: mockEnvoyerEmailCredentiels,
    envoyerEmailDemandeCompte: mockEnvoyerEmailDemandeCompte,
    envoyerEmailReinitialisation: mockEnvoyerEmailReinitialisation,
}));

// Import du service après tous les mocks
const {
    register,
    verifierEmail,
    creerUtilisateurAdmin,
    demanderCreationCompte,
    login,
    refreshToken,
    logout,
    getMe,
    oublierMDP,
    changerMDP,
} = await import('#Modules/identite/authentification/authentification.service.js');

const utilisateur = mockPrisma.utilisateur;
const etudiant = mockPrisma.etudiant;
const professeur = mockPrisma.professeur;
const professionnel = mockPrisma.professionnel;
const administrateur = mockPrisma.administrateur;

beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockPrisma));
});

// register() 
describe('register', () => {

    test('lève une erreur si email déjà utilisé', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1' });

        await expect(register('test@etu.uae.ac.ma', 'password', 'Test', 'User', 'ETUDIANT'))
            .rejects.toThrow('Cet email est déjà utilisé');

        expect(utilisateur.create).not.toHaveBeenCalled();
    });

    test('lève une erreur si email ETUDIANT invalide', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(register('test@gmail.com', 'password', 'Test', 'User', 'ETUDIANT'))
            .rejects.toThrow('Un email étudiant (@etu.uae.ac.ma) est requis');
    });

    test('lève une erreur si email PROFESSEUR invalide', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(register('test@gmail.com', 'password', 'Test', 'User', 'PROFESSEUR'))
            .rejects.toThrow('Un email professeur (@uae.ac.ma) est requis');
    });

    test('crée utilisateur + profil etudiant et envoie email de vérification', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPwd');
        const mockUser = { id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma', nom: 'Test', prenom: 'User', role: 'ETUDIANT', date_creation: new Date() };
        utilisateur.create.mockResolvedValue(mockUser);
        etudiant.create.mockResolvedValue({});

        const result = await register('test@etu.uae.ac.ma', 'password', 'Test', 'User', 'ETUDIANT', 'UAE');

        expect(etudiant.create).toHaveBeenCalledWith({ data: { id_etudiant: 'u1' } });
        expect(mockEnvoyerEmailVerification).toHaveBeenCalledWith('test@etu.uae.ac.ma', expect.any(String));
        expect(result).toEqual({ user: mockUser });
    });

    test('crée utilisateur + profil professeur', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPwd');
        utilisateur.create.mockResolvedValue({ id_utilisateur: 'u2', email: 'test@uae.ac.ma', nom: 'Prof', prenom: 'Test', role: 'PROFESSEUR', date_creation: new Date() });
        professeur.create.mockResolvedValue({});

        await register('test@uae.ac.ma', 'password', 'Prof', 'Test', 'PROFESSEUR', 'UAE');

        expect(professeur.create).toHaveBeenCalledWith({
            data: { id_professeur: 'u2', filieres_interv: [] },
        });
    });

    test('crée utilisateur + profil professionnel avec ecole forcée à null', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPwd');
        utilisateur.create.mockResolvedValue({ id_utilisateur: 'u3', email: 'pro@gmail.com', nom: 'Pro', prenom: 'Test', role: 'PROFESSIONNEL', date_creation: new Date() });
        professionnel.create.mockResolvedValue({});

        await register('pro@gmail.com', 'password', 'Pro', 'Test', 'PROFESSIONNEL', 'UAE');

        expect(utilisateur.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ ecole: null }),
        }));
        expect(professionnel.create).toHaveBeenCalledWith({
            data: { id_professionnel: 'u3', status_validation: 'EN_ATTENTE' },
        });
    });
});

// verifierEmail()
describe('verifierEmail', () => {

    test('lève une erreur si le token est invalide', async () => {
        utilisateur.findFirst.mockResolvedValue(null);

        await expect(verifierEmail('token-invalide'))
            .rejects.toThrow('Token de vérification invalide');
    });

    test('lève une erreur si le token est expiré', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u1',
            role: 'ETUDIANT',
            date_expiration_token_email: new Date(Date.now() - 1000),
        });

        await expect(verifierEmail('token-expiré'))
            .rejects.toThrow('Ce lien de vérification a expiré');
    });

    test('passe le statut à ACTIF pour un ETUDIANT', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u1',
            role: 'ETUDIANT',
            date_expiration_token_email: new Date(Date.now() + 3600000),
        });
        utilisateur.update.mockResolvedValue({});

        const result = await verifierEmail('token-valide');

        expect(utilisateur.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ email_verifie: true, status_compte: 'ACTIF' }),
        }));
        expect(result).toEqual({ role: 'ETUDIANT', status_compte: 'ACTIF' });
    });

    test('laisse le statut INACTIF pour un PROFESSIONNEL (en attente de validation admin)', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u2',
            role: 'PROFESSIONNEL',
            date_expiration_token_email: new Date(Date.now() + 3600000),
        });
        utilisateur.update.mockResolvedValue({});

        const result = await verifierEmail('token-pro');

        expect(utilisateur.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ status_compte: 'INACTIF' }),
        }));
        expect(result).toEqual({ role: 'PROFESSIONNEL', status_compte: 'INACTIF' });
    });
});


// creerUtilisateurAdmin()
describe('creerUtilisateurAdmin', () => {

    test('lève une erreur si email déjà utilisé', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1' });

        await expect(creerUtilisateurAdmin({ nom: 'Admin', prenom: 'Test', email: 'admin@uae.ac.ma', niveau_acces: 'ADMIN_ECOLE', ecole: 'UAE' }))
            .rejects.toThrow('Cet email est déjà utilisé');
    });

    test('crée un admin + profil administrateur et envoie les credentials', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPwd');
        const mockUser = { id_utilisateur: 'a1', email: 'admin@uae.ac.ma', nom: 'Admin', prenom: 'Test', role: 'ADMINISTRATEUR', date_creation: new Date() };
        utilisateur.create.mockResolvedValue(mockUser);
        administrateur.create.mockResolvedValue({});

        const result = await creerUtilisateurAdmin({ nom: 'Admin', prenom: 'Test', email: 'admin@uae.ac.ma', niveau_acces: 'ADMIN_ECOLE', ecole: 'UAE' });

        expect(administrateur.create).toHaveBeenCalledWith({
            data: { id_administrateur: 'a1', niveau_acces: 'ADMIN_ECOLE' },
        });
        expect(mockEnvoyerEmailCredentiels).toHaveBeenCalledWith('admin@uae.ac.ma', 'Admin', 'Test', expect.any(String), 'ADMINISTRATEUR');
        expect(result).toEqual({ user: mockUser });
    });

    test('force ecole à null pour un SUPER_ADMIN', async () => {
        utilisateur.findUnique.mockResolvedValue(null);
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('hashedPwd');
        utilisateur.create.mockResolvedValue({ id_utilisateur: 'a2', email: 'super@uae.ac.ma', nom: 'Super', prenom: 'Admin', role: 'ADMINISTRATEUR', date_creation: new Date() });
        administrateur.create.mockResolvedValue({});

        await creerUtilisateurAdmin({ nom: 'Super', prenom: 'Admin', email: 'super@uae.ac.ma', niveau_acces: 'SUPER_ADMIN', ecole: 'UAE' });

        expect(utilisateur.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ ecole: null }),
        }));
    });
});


// demanderCreationCompte()

describe('demanderCreationCompte', () => {

    test('envoie un email de demande de compte', async () => {
        mockEnvoyerEmailDemandeCompte.mockResolvedValue();

        await demanderCreationCompte({ nom: 'testnom', prenom: 'testprenom', email: 'test@entreprise.com', role: 'PROFESSIONNEL', message: 'Je voudrais un compte' });

        expect(mockEnvoyerEmailDemandeCompte).toHaveBeenCalledWith('testnom', 'testprenom', 'test@entreprise.com', 'PROFESSIONNEL', 'Je voudrais un compte');
    });
});


// login()
describe('login', () => {

    test('retourne accessToken, refreshToken et user sans mot_de_passe si connexion réussie', async () => {
        const mockUser = { id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma', mot_de_passe: 'hashedPwd', status_compte: 'ACTIF' };
        utilisateur.findUnique.mockResolvedValue(mockUser);
        mockBcrypt.compare.mockResolvedValue(true);
        mockJwt.sign.mockReturnValue('test-token');
        utilisateur.update.mockResolvedValue({});

        const result = await login('test@etu.uae.ac.ma', 'password');

        expect(result.accessToken).toBe('test-token');
        expect(result.refreshToken).toBe('test-token');
        expect(result.user).not.toHaveProperty('mot_de_passe');
    });

    test('lève une erreur si email non trouvé', async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(login('inconnu@test.com', 'password'))
            .rejects.toThrow('Email ou mot de passe incorrect');
    });

    test('lève une erreur si compte INACTIF', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', status_compte: 'INACTIF' });

        await expect(login('test@etu.uae.ac.ma', 'password'))
            .rejects.toThrow('Compte inactif. En attente de validation par un administrateur');
    });

    test('lève une erreur si compte SUSPENDU', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', status_compte: 'SUSPENDU' });

        await expect(login('test@etu.uae.ac.ma', 'password'))
            .rejects.toThrow("Compte suspendu. Contactez l'administrateur");
    });

    test('lève une erreur si mot de passe incorrect', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', mot_de_passe: 'hashedPwd', status_compte: 'ACTIF' });
        mockBcrypt.compare.mockResolvedValue(false);

        await expect(login('test@etu.uae.ac.ma', 'wrongpassword'))
            .rejects.toThrow('Email ou mot de passe incorrect');
    });

    test('sauvegarde le refresh token en BDD après connexion réussie', async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma', mot_de_passe: 'hashed', status_compte: 'ACTIF' });
        mockBcrypt.compare.mockResolvedValue(true);
        mockJwt.sign.mockReturnValue('token-123');
        utilisateur.update.mockResolvedValue({});

        await login('test@etu.uae.ac.ma', 'password');

        expect(utilisateur.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'test@etu.uae.ac.ma' },
            data: expect.objectContaining({ refresh_token: 'token-123' }),
        }));
    });
});


// refreshToken()
describe('refreshToken', () => {

    test('retourne un nouvel access token si le refresh token est valide', async () => {
        mockJwt.verify.mockReturnValue({ userId: 'u1' });
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            refresh_token: 'valid-token',
            date_expiration_refresh: new Date(Date.now() + 3600000),
        });
        mockJwt.sign.mockReturnValue('new-access-token');

        const result = await refreshToken('valid-token');

        expect(result.accessToken).toBe('new-access-token');
    });

    test('lève une erreur si le token JWT est invalide ou expiré', async () => {
        mockJwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });

        await expect(refreshToken('bad-token'))
            .rejects.toThrow('Refresh token invalide ou expiré');
    });

    test("lève une erreur si l'utilisateur n'existe pas en BDD", async () => {
        mockJwt.verify.mockReturnValue({ userId: 'u-inconnu' });
        utilisateur.findUnique.mockResolvedValue(null);

        await expect(refreshToken('token'))
            .rejects.toThrow('Utilisateur introuvable');
    });

    test('lève une erreur si le token en BDD ne correspond pas', async () => {
        mockJwt.verify.mockReturnValue({ userId: 'u1' });
        utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 'u1',
            refresh_token: 'autre-token',
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
            date_expiration_refresh: new Date(Date.now() - 1000),
        });

        await expect(refreshToken('valid-token'))
            .rejects.toThrow('Refresh token expiré');
    });
});


// logout()
describe('logout', () => {

    test('supprime le refresh token en BDD', async () => {
        utilisateur.update.mockResolvedValue({});

        await logout('u1');

        expect(utilisateur.update).toHaveBeenCalledWith({
            where: { id_utilisateur: 'u1' },
            data: { refresh_token: null, date_expiration_refresh: null },
        });
    });
});

// getMe()
describe('getMe', () => {

    test("retourne les informations de l'utilisateur", async () => {
        const mockUser = { id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma', nom: 'Test', prenom: 'User', role: 'ETUDIANT', status_compte: 'ACTIF' };
        utilisateur.findUnique.mockResolvedValue(mockUser);

        const result = await getMe('u1');

        expect(utilisateur.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id_utilisateur: 'u1' } }));
        expect(result).toEqual(mockUser);
    });

    test("retourne null si l'utilisateur n'existe pas", async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        const result = await getMe('id-inconnu');

        expect(result).toBeNull();
    });
});

// oublierMDP()
describe('oublierMDP', () => {

    test("ne fait rien si l'email n'existe pas (sécurité : pas de fuite d'info)", async () => {
        utilisateur.findUnique.mockResolvedValue(null);

        const result = await oublierMDP('inconnu@test.com');

        expect(result).toBeUndefined();
        expect(utilisateur.update).not.toHaveBeenCalled();
        expect(mockEnvoyerEmailReinitialisation).not.toHaveBeenCalled();
    });

    test("sauvegarde le token en BDD et envoie l'email si l'email existe", async () => {
        utilisateur.findUnique.mockResolvedValue({ id_utilisateur: 'u1', email: 'test@etu.uae.ac.ma' });
        utilisateur.update.mockResolvedValue({});
        mockEnvoyerEmailReinitialisation.mockResolvedValue();

        await oublierMDP('test@etu.uae.ac.ma');

        expect(utilisateur.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'test@etu.uae.ac.ma' },
            data: expect.objectContaining({
                token_reinitialisation: expect.any(String),
                date_expiration_token: expect.any(Date),
            }),
        }));
        expect(mockEnvoyerEmailReinitialisation).toHaveBeenCalledWith('test@etu.uae.ac.ma', expect.any(String));
    });
});


// changerMDP()
describe('changerMDP', () => {

    test('lève une erreur si le token est invalide', async () => {
        utilisateur.findFirst.mockResolvedValue(null);

        await expect(changerMDP('token-invalide', 'nouveauMDP123'))
            .rejects.toThrow('Token de réinitialisation invalide');
    });

    test('lève une erreur si le token est expiré', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u1',
            date_expiration_token: new Date(Date.now() - 1000),
        });

        await expect(changerMDP('token-expiré', 'nouveauMDP123'))
            .rejects.toThrow('ce lien a expiré');
    });

    test('hash le nouveau mot de passe et efface le token après réinitialisation', async () => {
        utilisateur.findFirst.mockResolvedValue({
            id_utilisateur: 'u1',
            date_expiration_token: new Date(Date.now() + 3600000),
        });
        mockBcrypt.genSalt.mockResolvedValue('salt');
        mockBcrypt.hash.mockResolvedValue('newHashedPwd');
        utilisateur.update.mockResolvedValue({});

        await changerMDP('token-valide', 'nouveauMDP123');

        expect(mockBcrypt.hash).toHaveBeenCalledWith('nouveauMDP123', 'salt');
        expect(utilisateur.update).toHaveBeenCalledWith({
            where: { id_utilisateur: 'u1' },
            data: {
                mot_de_passe: 'newHashedPwd',
                token_reinitialisation: null,
                date_expiration_token: null,
            },
        });
    });
});
