import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// HELPER — extraire la valeur d'un cookie depuis Set-Cookie
// ============================================================
const extractCookie = (cookies = [], name) => {
    const match = cookies.find(c => c.startsWith(`${name}=`));
    return match ? match.split(';')[0].slice(name.length + 1) : null;
};

// ============================================================
// EMAILS DE TEST — centralisés pour le cleanup
// ============================================================
const TEST_EMAILS = [
    'register.test@test.com',
    'login.test@test.com',
    'reset.test@test.com',
    'logout.test@test.com',
];

// ============================================================
// SETUP GLOBAL
// On crée les utilisateurs une seule fois et on se connecte
// pour obtenir les tokens utilisés dans les tests protégés.
// ============================================================
let accessToken;
let refreshToken;

beforeAll(async () => {
    await prisma.utilisateur.deleteMany({ where: { email: { in: TEST_EMAILS } } });

    // Utilisateur ACTIF pour les tests login / me / refresh / forgot / reset
    await prisma.utilisateur.create({
        data: {
            email: 'login.test@test.com',
            mot_de_passe: await bcrypt.hash('password', 10),
            nom: 'Login',
            prenom: 'Test',
            role: 'ETUDIANT',
            status_compte: 'ACTIF',
        },
    });

    // Utilisateur avec un token de réinitialisation valide pré-inséré en BDD
    // → permet de tester /reset-password sans passer par /forgot-password
    //   (qui enverrait un vrai email et crasherait sans SMTP configuré)
    await prisma.utilisateur.create({
        data: {
            email: 'reset.test@test.com',
            mot_de_passe: await bcrypt.hash('password', 10),
            nom: 'Reset',
            prenom: 'Test',
            role: 'ETUDIANT',
            status_compte: 'ACTIF',
            token_reinitialisation: 'test-valid-reset-token',
            date_expiration_token: new Date(Date.now() + 3600000),
        },
    });

    // Connexion pour récupérer les tokens — indépendant des tests login
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login.test@test.com', password: 'password' });

    const cookies = loginRes.headers['set-cookie'] || [];
    accessToken  = extractCookie(cookies, 'accessToken');
    refreshToken = extractCookie(cookies, 'refreshToken');
});

afterAll(async () => {
    await prisma.utilisateur.deleteMany({ where: { email: { in: TEST_EMAILS } } });
    await prisma.$disconnect();
});

// ============================================================
// POST /api/auth/register
// ============================================================
describe('POST /api/auth/register', () => {

    test('retourne 201 et crée un utilisateur INACTIF', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'register.test@test.com', password: 'password', nom: 'Register', prenom: 'Test', role: 'ETUDIANT' });

        expect(res.status).toBe(201);
        expect(res.body.data.user.email).toBe('register.test@test.com');
    });

    test('retourne 400 si email déjà utilisé', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'login.test@test.com', password: 'password', nom: 'Test', prenom: 'Test' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si champs manquants (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@test.com' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si mot de passe trop court (< 8 caractères)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@test.com', password: 'court', nom: 'Test', prenom: 'Test' });

        expect(res.status).toBe(400);
    });
});

// ============================================================
// POST /api/auth/login
// ============================================================
describe('POST /api/auth/login', () => {

    test('retourne 200 et pose les cookies accessToken et refreshToken', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login.test@test.com', password: 'password' });

        expect(res.status).toBe(200);

        const cookies = res.headers['set-cookie'] || [];
        expect(extractCookie(cookies, 'accessToken')).toBeTruthy();
        expect(extractCookie(cookies, 'refreshToken')).toBeTruthy();
    });

    test('retourne 401 si mot de passe incorrect', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login.test@test.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
    });

    test('retourne 401 si email non trouvé', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'inconnu@test.com', password: 'password' });

        expect(res.status).toBe(401);
    });

    test('retourne 401 si compte INACTIF', async () => {
        // register.test@test.com a été créé via /register → status INACTIF
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'register.test@test.com', password: 'password' });

        expect(res.status).toBe(401);
    });
});

// ============================================================
// GET /api/auth/me
// ============================================================
describe('GET /api/auth/me', () => {

    test('retourne 200 avec les infos de l\'utilisateur connecté', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe('login.test@test.com');
    });

    test('retourne 401 sans token', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).toBe(401);
    });

    test('retourne 401 avec un token invalide', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer token-bidon');

        expect(res.status).toBe(401);
    });
});

// ============================================================
// POST /api/auth/refresh-token
// Renouvelle l'access token à partir du refresh token (cookie).
// ============================================================
describe('POST /api/auth/refresh-token', () => {

    // Le test de login réussi ci-dessus met à jour le refresh_token en BDD,
    // rendant le token du beforeAll global obsolète. On refait un login ici
    // pour avoir le token le plus récent en BDD.
    let freshRefreshToken;
    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login.test@test.com', password: 'password' });
        const cookies = loginRes.headers['set-cookie'] || [];
        freshRefreshToken = extractCookie(cookies, 'refreshToken');
    });

    test('retourne 401 si aucun cookie refreshToken', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Refresh token manquant');
    });

    test('retourne 401 avec un refresh token invalide', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .set('Cookie', 'refreshToken=token-bidon');

        expect(res.status).toBe(401);
    });

    test('retourne 200 et un nouveau cookie accessToken avec un refresh token valide', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .set('Cookie', `refreshToken=${freshRefreshToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Token renouvelé');

        const cookies = res.headers['set-cookie'] || [];
        expect(extractCookie(cookies, 'accessToken')).toBeTruthy();
    });
});

// ============================================================
// POST /api/auth/forgot-password
// Note : le cas "email existant → envoi email" n'est pas testé ici
// car nodemailer crasherait sans SMTP configuré en environnement test.
// Ce cas est couvert par le test unitaire du service.
// ============================================================
describe('POST /api/auth/forgot-password', () => {

    test('retourne 400 si email manquant (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({});

        expect(res.status).toBe(400);
    });

    test('retourne 400 si email invalide (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'pas-un-email' });

        expect(res.status).toBe(400);
    });

    test('retourne 200 si email non trouvé en BDD (réponse silencieuse)', async () => {
        // Sécurité : on ne révèle pas si un email est enregistré ou non
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'inexistant@test.com' });

        expect(res.status).toBe(200);
    });
});

// ============================================================
// POST /api/auth/reset-password
// Le token valide a été inséré directement en BDD dans beforeAll.
// ============================================================
describe('POST /api/auth/reset-password', () => {

    test('retourne 400 si champs manquants (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'tok' }); // nouveauMotDePasse manquant

        expect(res.status).toBe(400);
    });

    test('retourne 400 si le token est invalide', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'token-inexistant', nouveauMotDePasse: 'nouveauMDP123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Token de réinitialisation invalide');
    });

    test('retourne 200 et réinitialise le mot de passe avec un token valide', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'test-valid-reset-token', nouveauMotDePasse: 'nouveauMDP123' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Mot de passe réinitialisé avec succès');

        // Vérifier en BDD que le token a bien été effacé
        const user = await prisma.utilisateur.findUnique({
            where: { email: 'reset.test@test.com' },
            select: { token_reinitialisation: true },
        });
        expect(user.token_reinitialisation).toBeNull();
    });
});

// ============================================================
// POST /api/auth/logout
// On fait un login frais ici pour ne pas affecter les tokens
// utilisés dans les autres describe (refresh, me...).
// ============================================================
describe('POST /api/auth/logout', () => {

    let logoutAccessToken;

    beforeAll(async () => {
        await prisma.utilisateur.create({
            data: {
                email: 'logout.test@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Logout',
                prenom: 'Test',
                role: 'ETUDIANT',
                status_compte: 'ACTIF',
            },
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'logout.test@test.com', password: 'password' });

        const cookies = loginRes.headers['set-cookie'] || [];
        logoutAccessToken = extractCookie(cookies, 'accessToken');
    });

    test('retourne 401 sans token', async () => {
        const res = await request(app).post('/api/auth/logout');

        expect(res.status).toBe(401);
    });

    test('retourne 200 et efface les cookies', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${logoutAccessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Déconnexion réussie');

        // Les cookies doivent être vidés (valeur vide dans Set-Cookie)
        const cookies = res.headers['set-cookie'] || [];
        const accessCookieCleared = cookies.some(
            c => c.startsWith('accessToken=') && c.includes('Expires=Thu, 01 Jan 1970')
        );
        expect(accessCookieCleared).toBe(true);
    });
});
