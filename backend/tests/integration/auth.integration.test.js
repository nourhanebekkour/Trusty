import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Auth', () => {

    let token;
    let userId;

    beforeAll(async () => {
        await prisma.utilisateur.deleteMany({
            where: { email: { in: ['register.test@test.com', 'login.test@test.com'] } }
        });

        // Créer un utilisateur ACTIF pour les tests de login
        const user = await prisma.utilisateur.create({
            data: {
                email: 'login.test@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Login',
                prenom: 'Test',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });
        userId = user.id_utilisateur;
    });

    afterAll(async () => {
        await prisma.utilisateur.deleteMany({
            where: { email: { in: ['register.test@test.com', 'login.test@test.com'] } }
        });
        await prisma.$disconnect();
    });

    // POST /register

    describe('POST /api/auth/register', () => {

        test('doit créer un utilisateur et retourner 201', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'register.test@test.com',
                    password: 'password',
                    nom: 'Register',
                    prenom: 'Test',
                    role: 'ETUDIANT'
                });

            expect(res.status).toBe(201);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe('register.test@test.com');
        });

        test('doit retourner 400 si email déjà utilisé', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login.test@test.com', // déjà en base
                    password: 'password',
                    nom: 'Test',
                    prenom: 'Test'
                });

            expect(res.status).toBe(400);
        });

        test('doit retourner 400 si champs manquants', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com' }); // nom, prenom, password manquants

            expect(res.status).toBe(400);
        });
    });

    // POST /login
    describe('POST /api/auth/login', () => {

        test('doit retourner 200 avec token si connexion réussie', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login.test@test.com', password: 'password' });

            expect(res.status).toBe(200);
            expect(res.body.data.token).toBeDefined();
            token = res.body.data.token; // on sauvegarde pour getMe
        });

        test('doit retourner 401 si mot de passe incorrect', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login.test@test.com', password: 'wrongpassword' });

            expect(res.status).toBe(401);
        });

        test('doit retourner 401 si email non trouvé', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'inconnu@test.com', password: 'password' });

            expect(res.status).toBe(401);
        });

        test('doit retourner 401 si compte INACTIF', async () => {
            // register crée un compte INACTIF
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'register.test@test.com', password: 'password' });

            expect(res.status).toBe(401);
        });
    });

    // GET /me 

    describe('GET /api/auth/me', () => {

        test('doit retourner 200 avec les infos utilisateur', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe('login.test@test.com');
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
        });
    });
});