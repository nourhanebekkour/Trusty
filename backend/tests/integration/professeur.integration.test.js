import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Professeur', () => {

    let tokenProfesseur;
    let tokenAdmin;
    let tokenAutreProfesseur;
    let professeurId;
    let adminId;
    let autreProfesseurId;

    beforeAll(async () => {
        // Nettoyage
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'prof.integration@test.com',
                        'admin.prof@test.com',
                        'autre.prof@test.com'
                    ]
                }
            }
        });

        // Création professeur de test
        const profUser = await prisma.utilisateur.create({
            data: {
                email: 'prof.integration@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Prof',
                prenom: 'Test',
                role: 'PROFESSEUR',
                status_compte: 'ACTIF'
            }
        });
        professeurId = profUser.id_utilisateur;
        await prisma.professeur.create({
            data: { id_professeur: profUser.id_utilisateur }
        });

        // Création admin de test
        const adminUser = await prisma.utilisateur.create({
            data: {
                email: 'admin.prof@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Test',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF'
            }
        });
        adminId = adminUser.id_utilisateur;
        await prisma.administrateur.create({
            data: { id_administrateur: adminUser.id_utilisateur }
        });

        // Création autre professeur (pour tester accès refusé)
        const autreProfUser = await prisma.utilisateur.create({
            data: {
                email: 'autre.prof@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Autre',
                prenom: 'Prof',
                role: 'PROFESSEUR',
                status_compte: 'ACTIF'
            }
        });
        autreProfesseurId = autreProfUser.id_utilisateur;
        await prisma.professeur.create({
            data: { id_professeur: autreProfUser.id_utilisateur }
        });

        // Login professeur
        const loginProf = await request(app)
            .post('/api/auth/login')
            .send({ email: 'prof.integration@test.com', password: 'password' });
        tokenProfesseur = loginProf.body.data.token;

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.prof@test.com', password: 'password' });
        tokenAdmin = loginAdmin.body.data.token;

        // Login autre professeur
        const loginAutre = await request(app)
            .post('/api/auth/login')
            .send({ email: 'autre.prof@test.com', password: 'password' });
        tokenAutreProfesseur = loginAutre.body.data.token;
    });

    afterAll(async () => {
        await prisma.professeur.deleteMany({
            where: { id_professeur: { in: [professeurId, autreProfesseurId] } }
        });
        await prisma.administrateur.deleteMany({
            where: { id_administrateur: adminId }
        });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: ['prof.integration@test.com', 'admin.prof@test.com', 'autre.prof@test.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/professeurs', () => {

        test('doit retourner 200 avec la liste des professeurs (admin)', async () => {
            const res = await request(app)
                .get('/api/professeurs')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .get('/api/professeurs')
                .set('Authorization', `Bearer ${tokenProfesseur}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app).get('/api/professeurs');
            expect(res.status).toBe(401);
        });
    });

    // ─── GET /filiere/:filiere ────────────────────────────────────────

    describe('GET /api/professeurs/filiere/:filiere', () => {

        test('doit retourner 200 avec les professeurs de la filière', async () => {
            const res = await request(app)
                .get('/api/professeurs/filiere/GINF')
                .set('Authorization', `Bearer ${tokenProfesseur}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/professeurs/:id', () => {

        test('doit retourner 200 si le professeur consulte son propre profil', async () => {
            const res = await request(app)
                .get(`/api/professeurs/${professeurId}`)
                .set('Authorization', `Bearer ${tokenProfesseur}`);

            expect(res.status).toBe(200);
            expect(res.body.data.utilisateur.email).toBe('prof.integration@test.com');
        });

        test('doit retourner 200 si admin consulte le profil', async () => {
            const res = await request(app)
                .get(`/api/professeurs/${professeurId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
        });

        test('doit retourner 403 si autre professeur consulte', async () => {
            const res = await request(app)
                .get(`/api/professeurs/${professeurId}`)
                .set('Authorization', `Bearer ${tokenAutreProfesseur}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 404 si professeur inexistant', async () => {
            const res = await request(app)
                .get('/api/professeurs/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/professeurs/:id', () => {

        test('doit modifier le profil (propriétaire) et retourner 200', async () => {
            const res = await request(app)
                .put(`/api/professeurs/${professeurId}`)
                .set('Authorization', `Bearer ${tokenProfesseur}`)
                .send({
                    departement: 'SIC',
                    specialite: 'Informatique',
                    ville: 'Tanger'
                });

            expect(res.status).toBe(200);
            expect(res.body.data.departement).toBe('SIC');

            // Vérification en base
            const dbCheck = await prisma.professeur.findUnique({
                where: { id_professeur: professeurId }
            });
            expect(dbCheck.departement).toBe('SIC');
        });

        test('doit modifier le profil (admin) et retourner 200', async () => {
            const res = await request(app)
                .put(`/api/professeurs/${professeurId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ specialite: 'DevOps' });

            expect(res.status).toBe(200);
        });

        test('doit retourner 403 si autre professeur tente de modifier', async () => {
            const res = await request(app)
                .put(`/api/professeurs/${professeurId}`)
                .set('Authorization', `Bearer ${tokenAutreProfesseur}`)
                .send({ specialite: 'Hack' });

            expect(res.status).toBe(403);
        });
    });
});