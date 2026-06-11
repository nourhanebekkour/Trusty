import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Technologies', () => {
    let tokenAdmin;
    let tokenEtudiant;
    let adminId;
    let etudiantId;
    let technologieId;

    beforeAll(async () => {
        // nettoyage préalable pour garantir un état propre
        await prisma.administrateur.deleteMany({
            where: { utilisateur: { email: 'admin.techno.integration@admin.com' } },
        });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.techno.integration@admin.com',
                        'etudiant.techno.integration@etudiant.com',
                    ],
                },
            },
        });

        // créer un administrateur
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.techno.integration@admin.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Techno',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF',
            },
        });
        adminId = admin.id_utilisateur;
        await prisma.administrateur.create({ data: { id_administrateur: adminId } });

        // créer un étudiant (rôle non-admin pour tester le 403)
        const etudiant = await prisma.utilisateur.create({
            data: {
                email: 'etudiant.techno.integration@etudiant.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Etudiant',
                prenom: 'Techno',
                role: 'ETUDIANT',
                status_compte: 'ACTIF',
            },
        });
        etudiantId = etudiant.id_utilisateur;

        // login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.techno.integration@admin.com', password: 'password' });
        const cookiesAdmin = loginAdmin.headers['set-cookie'] || [];
        const accessCookieAdmin = cookiesAdmin.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookieAdmin.split(';')[0].replace('accessToken=', '');

        // login étudiant
        const loginEtudiant = await request(app)
            .post('/api/auth/login')
            .send({ email: 'etudiant.techno.integration@etudiant.com', password: 'password' });
        const cookiesEtudiant = loginEtudiant.headers['set-cookie'] || [];
        const accessCookieEtudiant = cookiesEtudiant.find(c => c.startsWith('accessToken=')) || '';
        tokenEtudiant = accessCookieEtudiant.split(';')[0].replace('accessToken=', '');

        // créer une technologie de référence pour les tests GET et PUT
        const techno = await prisma.technologie.create({
            data: {
                nom: 'TechnoTest',
                categorie: 'Backend',
                sous_categorie: 'Framework',
                description: 'Technologie de test',
            },
        });
        technologieId = techno.id_technologie;
    });

    afterAll(async () => {
        // supprimer toutes les technologies créées pendant les tests
        await prisma.technologie.deleteMany({
            where: { nom: { in: ['TechnoTest', 'NouvelleStack'] } },
        });
        await prisma.administrateur.deleteMany({
            where: { id_administrateur: adminId },
        });
        await prisma.utilisateur.deleteMany({
            where: { id_utilisateur: { in: [adminId, etudiantId] } },
        });
        await prisma.$disconnect();
    });

    // GET /api/technologies
    describe('GET /api/technologies', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app).get('/api/technologies');
            expect(res.status).toBe(401);
        });

        test('retourne 200 avec la liste des technologies (admin)', async () => {
            const res = await request(app)
                .get('/api/technologies')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('retourne 200 avec la liste des technologies (étudiant)', async () => {
            const res = await request(app)
                .get('/api/technologies')
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    // GET /api/technologies/:id
    describe('GET /api/technologies/:id', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app).get(`/api/technologies/${technologieId}`);
            expect(res.status).toBe(401);
        });

        test('retourne 200 avec la technologie demandée', async () => {
            const res = await request(app)
                .get(`/api/technologies/${technologieId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.nom).toBe('TechnoTest');
        });

        test('retourne 404 si la technologie n\'existe pas', async () => {
            const res = await request(app)
                .get('/api/technologies/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // POST /api/technologies
    describe('POST /api/technologies', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app)
                .post('/api/technologies')
                .send({ nom: 'NouvelleStack', categorie: 'Backend' });
            expect(res.status).toBe(401);
        });

        test('retourne 403 si l\'utilisateur n\'est pas admin', async () => {
            const res = await request(app)
                .post('/api/technologies')
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ nom: 'NouvelleStack', categorie: 'Backend' });
            expect(res.status).toBe(403);
        });

        test('retourne 201 et crée la technologie (admin)', async () => {
            const res = await request(app)
                .post('/api/technologies')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nom: 'NouvelleStack', categorie: 'Backend', description: 'Test POST' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.nom).toBe('NouvelleStack');

            // vérification directe en BDD
            const dbCheck = await prisma.technologie.findUnique({
                where: { id_technologie: res.body.data.id_technologie },
            });
            expect(dbCheck).not.toBeNull();
            expect(dbCheck.categorie).toBe('Backend');
        });
    });

    // PUT /api/technologies/:id
    describe('PUT /api/technologies/:id', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app)
                .put(`/api/technologies/${technologieId}`)
                .send({ nom: 'Modifié' });
            expect(res.status).toBe(401);
        });

        test('retourne 403 si l\'utilisateur n\'est pas admin', async () => {
            const res = await request(app)
                .put(`/api/technologies/${technologieId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ nom: 'Modifié' });
            expect(res.status).toBe(403);
        });

        test('retourne 200 et met à jour la technologie (admin)', async () => {
            const res = await request(app)
                .put(`/api/technologies/${technologieId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ description: 'Description mise à jour' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.description).toBe('Description mise à jour');

            // vérification directe en BDD
            const dbCheck = await prisma.technologie.findUnique({
                where: { id_technologie: technologieId },
            });
            expect(dbCheck.description).toBe('Description mise à jour');
        });
    });

    // DELETE /api/technologies/:id
    describe('DELETE /api/technologies/:id', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app).delete(`/api/technologies/${technologieId}`);
            expect(res.status).toBe(401);
        });

        test('retourne 403 si l\'utilisateur n\'est pas admin', async () => {
            const res = await request(app)
                .delete(`/api/technologies/${technologieId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);
            expect(res.status).toBe(403);
        });

        test('retourne 200 et supprime la technologie (admin)', async () => {
            const res = await request(app)
                .delete(`/api/technologies/${technologieId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/supprimée/i);

            // vérification directe en BDD : la technologie ne doit plus exister
            const dbCheck = await prisma.technologie.findUnique({
                where: { id_technologie: technologieId },
            });
            expect(dbCheck).toBeNull();
        });
    });
});
