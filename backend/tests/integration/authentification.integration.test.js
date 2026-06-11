import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const extractCookie = (cookies = [], name) => {
    const match = cookies.find(c => c.startsWith(`${name}=`));
    return match ? match.split(';')[0].slice(name.length + 1) : null;
};

const TEST_EMAILS = [
    'test.register@etu.uae.ac.ma',
    'test.login@etu.uae.ac.ma',
    'test.reset@etu.uae.ac.ma',
    'test.verify@etu.uae.ac.ma',
    'test.verifypro@test.com',
    'test.inactif@etu.uae.ac.ma',
    'test.logout@etu.uae.ac.ma',
    'test.superadmin@uae.ac.ma',
    'test.newadmin@uae.ac.ma',
];

let accessToken;
let refreshToken;
let adminAccessToken;

beforeAll(async () => {
    await prisma.administrateur.deleteMany({ where: { utilisateur: { email: { in: TEST_EMAILS } } } });
    await prisma.etudiant.deleteMany({ where: { utilisateur: { email: { in: TEST_EMAILS } } } });
    await prisma.professionnel.deleteMany({ where: { utilisateur: { email: { in: TEST_EMAILS } } } });
    await prisma.utilisateur.deleteMany({ where: { email: { in: TEST_EMAILS } } });

    await prisma.utilisateur.create({
        data: {
            email: 'test.login@etu.uae.ac.ma',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'user',
            role: 'ETUDIANT',
            status_compte: 'ACTIF',
            email_verifie: true,
        },
    });

    await prisma.utilisateur.create({
        data: {
            email: 'test.reset@etu.uae.ac.ma',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'reset',
            role: 'ETUDIANT',
            status_compte: 'ACTIF',
            email_verifie: true,
            token_reinitialisation: 'test-valid-reset-token',
            date_expiration_token: new Date(Date.now() + 3600000),
        },
    });

    await prisma.utilisateur.create({
        data: {
            email: 'test.verify@etu.uae.ac.ma',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'verify',
            role: 'ETUDIANT',
            status_compte: 'INACTIF',
            email_verifie: false,
            token_reinitialisation_email: 'test-valid-email-token',
            date_expiration_token_email: new Date(Date.now() + 86400000),
        },
    });

    await prisma.utilisateur.create({
        data: {
            email: 'test.verifypro@test.com',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'pro',
            role: 'PROFESSIONNEL',
            status_compte: 'INACTIF',
            email_verifie: false,
            token_reinitialisation_email: 'test-valid-pro-email-token',
            date_expiration_token_email: new Date(Date.now() + 86400000),
        },
    });

    await prisma.utilisateur.create({
        data: {
            email: 'test.inactif@etu.uae.ac.ma',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'inactif',
            role: 'ETUDIANT',
            status_compte: 'INACTIF',
            email_verifie: false,
        },
    });

    await prisma.utilisateur.create({
        data: {
            email: 'test.logout@etu.uae.ac.ma',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'logout',
            role: 'ETUDIANT',
            status_compte: 'ACTIF',
            email_verifie: true,
        },
    });

    const superAdmin = await prisma.utilisateur.create({
        data: {
            email: 'test.superadmin@uae.ac.ma',
            mot_de_passe: await bcrypt.hash('password123', 10),
            nom: 'test',
            prenom: 'admin',
            role: 'ADMINISTRATEUR',
            status_compte: 'ACTIF',
            email_verifie: true,
        },
    });
    await prisma.administrateur.create({
        data: {
            id_administrateur: superAdmin.id_utilisateur,
            niveau_acces: 'SUPER_ADMIN',
        },
    });

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test.login@etu.uae.ac.ma', password: 'password123' });
    const cookies = loginRes.headers['set-cookie'] || [];
    accessToken = extractCookie(cookies, 'accessToken');
    refreshToken = extractCookie(cookies, 'refreshToken');

    const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test.superadmin@uae.ac.ma', password: 'password123' });
    const adminCookies = adminLoginRes.headers['set-cookie'] || [];
    adminAccessToken = extractCookie(adminCookies, 'accessToken');
});

afterAll(async () => {
    await prisma.administrateur.deleteMany({ where: { utilisateur: { email: { in: TEST_EMAILS } } } });
    await prisma.etudiant.deleteMany({ where: { utilisateur: { email: { in: TEST_EMAILS } } } });
    await prisma.professionnel.deleteMany({ where: { utilisateur: { email: { in: TEST_EMAILS } } } });
    await prisma.utilisateur.deleteMany({ where: { email: { in: TEST_EMAILS } } });
    await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {

    test('retourne 400 si champs manquants (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@etu.uae.ac.ma' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si mot de passe trop court', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@etu.uae.ac.ma', password: 'court', nom: 'test', prenom: 'user', role: 'ETUDIANT', ecole: 'ENSATanger' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si ecole manquante pour ETUDIANT', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@etu.uae.ac.ma', password: 'password123', nom: 'test', prenom: 'user', role: 'ETUDIANT' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si role invalide', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@test.com', password: 'password123', nom: 'test', prenom: 'user', role: 'ADMINISTRATEUR', ecole: 'ENSATanger' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si email ETUDIANT invalide (service)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@gmail.com', password: 'password123', nom: 'test', prenom: 'user', role: 'ETUDIANT', ecole: 'ENSATanger' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('@etu.uae.ac.ma');
    });

    test('retourne 400 si email PROFESSEUR invalide (service)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@gmail.com', password: 'password123', nom: 'test', prenom: 'user', role: 'PROFESSEUR', ecole: 'ENSATanger' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('@uae.ac.ma');
    });

    test('retourne 400 si email déjà utilisé', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test.login@etu.uae.ac.ma', password: 'password123', nom: 'test', prenom: 'user', role: 'ETUDIANT', ecole: 'ENSATanger' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Cet email est déjà utilisé');
    });
});

describe('POST /api/auth/verify-email', () => {

    test('retourne 400 si token manquant (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({});

        expect(res.status).toBe(400);
    });

    test('retourne 400 si token invalide', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({ token: 'token-inexistant' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Token de vérification invalide');
    });

    test('retourne 200 et passe le compte ETUDIANT à ACTIF', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({ token: 'test-valid-email-token' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Email vérifié. Votre compte est maintenant actif.');

        const user = await prisma.utilisateur.findUnique({
            where: { email: 'test.verify@etu.uae.ac.ma' },
            select: { email_verifie: true, status_compte: true },
        });
        expect(user.email_verifie).toBe(true);
        expect(user.status_compte).toBe('ACTIF');
    });

    test('retourne 200 mais laisse le compte PROFESSIONNEL INACTIF', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({ token: 'test-valid-pro-email-token' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Email vérifié. Votre compte est en attente de validation par un administrateur.');

        const user = await prisma.utilisateur.findUnique({
            where: { email: 'test.verifypro@test.com' },
            select: { email_verifie: true, status_compte: true },
        });
        expect(user.email_verifie).toBe(true);
        expect(user.status_compte).toBe('INACTIF');
    });
});

describe('POST /api/auth/login', () => {

    test('retourne 200 et pose les cookies accessToken et refreshToken', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.login@etu.uae.ac.ma', password: 'password123' });

        expect(res.status).toBe(200);

        const cookies = res.headers['set-cookie'] || [];
        expect(extractCookie(cookies, 'accessToken')).toBeTruthy();
        expect(extractCookie(cookies, 'refreshToken')).toBeTruthy();
    });

    test('retourne 401 si mot de passe incorrect', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.login@etu.uae.ac.ma', password: 'wrongpassword' });

        expect(res.status).toBe(401);
    });

    test('retourne 401 si email non trouvé', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'inconnu@etu.uae.ac.ma', password: 'password123' });

        expect(res.status).toBe(401);
    });

    test('retourne 401 si compte INACTIF', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.inactif@etu.uae.ac.ma', password: 'password123' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/auth/me', () => {

    test("retourne 200 avec les infos de l'utilisateur connecté", async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe('test.login@etu.uae.ac.ma');
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

describe('POST /api/auth/refresh-token', () => {

    let freshRefreshToken;

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.login@etu.uae.ac.ma', password: 'password123' });
        const cookies = loginRes.headers['set-cookie'] || [];
        freshRefreshToken = extractCookie(cookies, 'refreshToken');
    });

    test('retourne 401 si aucun cookie refreshToken', async () => {
        const res = await request(app).post('/api/auth/refresh-token');

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

    test('retourne 200 si email inexistant en BDD (réponse silencieuse)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'inexistant@etu.uae.ac.ma' });

        expect(res.status).toBe(200);
    });
});

describe('POST /api/auth/reset-password', () => {

    test('retourne 400 si champs manquants (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'tok' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si token invalide', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'token-inexistant', nouveauMotDePasse: 'nouveauMDP123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Token de réinitialisation invalide');
    });

    test('retourne 200 et réinitialise le mot de passe', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'test-valid-reset-token', nouveauMotDePasse: 'nouveauMDP123' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Mot de passe réinitialisé avec succès');

        const user = await prisma.utilisateur.findUnique({
            where: { email: 'test.reset@etu.uae.ac.ma' },
            select: { token_reinitialisation: true },
        });
        expect(user.token_reinitialisation).toBeNull();
    });
});

describe('POST /api/auth/request-account', () => {

    test('retourne 400 si champs manquants (validation Zod)', async () => {
        const res = await request(app)
            .post('/api/auth/request-account')
            .send({ email: 'test@etu.uae.ac.ma' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si role invalide pour une demande (PROFESSIONNEL non autorisé)', async () => {
        const res = await request(app)
            .post('/api/auth/request-account')
            .send({ nom: 'test', prenom: 'user', email: 'test@test.com', role: 'PROFESSIONNEL' });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/logout', () => {

    let logoutAccessToken;

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.logout@etu.uae.ac.ma', password: 'password123' });
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

        const cookies = res.headers['set-cookie'] || [];
        const accessCleared = cookies.some(
            c => c.startsWith('accessToken=') && c.includes('Expires=Thu, 01 Jan 1970')
        );
        expect(accessCleared).toBe(true);
    });
});

describe('POST /api/auth/admin/create-user', () => {

    test('retourne 401 sans token', async () => {
        const res = await request(app)
            .post('/api/auth/admin/create-user')
            .send({ nom: 'test', prenom: 'user', email: 'test.newadmin@uae.ac.ma', niveau_acces: 'ADMIN', ecole: 'ENSATanger' });

        expect(res.status).toBe(401);
    });

    test('retourne 403 si utilisateur non SUPER_ADMIN', async () => {
        const res = await request(app)
            .post('/api/auth/admin/create-user')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ nom: 'test', prenom: 'user', email: 'test.newadmin@uae.ac.ma', niveau_acces: 'ADMIN', ecole: 'ENSATanger' });

        expect(res.status).toBe(403);
    });

    test('retourne 400 si validation Zod échoue (ecole manquante pour ADMIN)', async () => {
        const res = await request(app)
            .post('/api/auth/admin/create-user')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({ nom: 'test', prenom: 'user', email: 'test.newadmin@uae.ac.ma', niveau_acces: 'ADMIN' });

        expect(res.status).toBe(400);
    });

    test('retourne 400 si validation Zod échoue (ecole fournie pour SUPER_ADMIN)', async () => {
        const res = await request(app)
            .post('/api/auth/admin/create-user')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({ nom: 'test', prenom: 'user', email: 'test.newadmin@uae.ac.ma', niveau_acces: 'SUPER_ADMIN', ecole: 'ENSATanger' });

        expect(res.status).toBe(400);
    });
});
