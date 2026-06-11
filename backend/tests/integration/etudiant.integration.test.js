import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Profil Étudiant', () => {
    let utilisateurId;
    let adminId;
    let token;
    let tokenAdmin;

    beforeAll(async () => {

        // Nettoyer avant
        await prisma.etudiant.deleteMany({
            where: { utilisateur: { email: 'test.integration@etudiant.com' } }
        });
        await prisma.administrateur.deleteMany({
            where: { utilisateur: { email: 'admin.integration@etudiant.com' } }
        });
        await prisma.utilisateur.deleteMany({
            where: { email: { in: ['test.integration@etudiant.com', 'admin.integration@etudiant.com'] } }
        });

        // Création utilisateur étudiant
        const user = await prisma.utilisateur.create({
            data: {
                email: 'test.integration@etudiant.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Test',
                prenom: 'Integration',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });
        utilisateurId = user.id_utilisateur;

        // Création admin
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.integration@etudiant.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Integration',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF'
            }
        });
        adminId = admin.id_utilisateur;
        await prisma.administrateur.create({ data: { id_administrateur: adminId } });

        // Login étudiant
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.integration@etudiant.com', password: 'password' });
        const cookiesEtudiant = loginRes.headers['set-cookie'] || [];
        const accessCookieEtudiant = cookiesEtudiant.find(c => c.startsWith('accessToken=')) || '';
        token = accessCookieEtudiant.split(';')[0].replace('accessToken=', '');

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.integration@etudiant.com', password: 'password' });
        const cookiesAdmin = loginAdmin.headers['set-cookie'] || [];
        const accessCookieAdmin = cookiesAdmin.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookieAdmin.split(';')[0].replace('accessToken=', '');
    });

    // Nettoyer après les tests
    afterAll(async () => {
        await prisma.etudiant.deleteMany({ where: { id_etudiant: utilisateurId } });
        await prisma.administrateur.deleteMany({ where: { id_administrateur: adminId } });
        await prisma.utilisateur.deleteMany({
            where: { email: { in: ['test.integration@etudiant.com', 'admin.integration@etudiant.com'] } }
        });
        await prisma.$disconnect();
    });

    // TEST API GET requiert ADMINISTRATEUR
    describe('GET /api/etudiants', () => {
        test('doit retourner 200 avec la liste des étudiants (admin)', async () => {
            const res = await request(app)
                .get('/api/etudiants')
                .set('Authorization', `Bearer ${tokenAdmin}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .get('/api/etudiants')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(403);
        });
    });

    // TEST API GET PAR ID
    describe('GET /api/etudiants/:id', () => {
        test('doit retourner 404 si étudiant inexistant (admin)', async () => {
            const res = await request(app)
                .get('/api/etudiants/id-inexistant')
                .set('Authorization', `Bearer ${tokenAdmin}`);
            expect(res.status).toBe(404);
        });

        test('doit retourner 200 si l\'étudiant existe', async () => {
            // création d'un étudiant lié
            await prisma.etudiant.create({
                data: {
                    id_etudiant: utilisateurId,
                    filiere: 'GINF',
                    ville: 'Tanger'
                }
            });
            const res = await request(app)
                .get(`/api/etudiants/${utilisateurId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.utilisateur.email).toBe('test.integration@etudiant.com');
        });
    });

    // TEST API PUT
    describe('PUT /api/etudiants/:id', () => {
        test('doit créer ou modifier un profil', async () => {
            const res = await request(app)
                .put(`/api/etudiants/${utilisateurId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ filiere: 'GINF', ville: 'Tanger' });

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/succès/i);
            expect(res.body.data.filiere).toBe('GINF');
            expect(res.body.data.ville).toBe('Tanger');

            const dbCheck = await prisma.etudiant.findUnique({
                where: { id_etudiant: utilisateurId }
            });
            expect(dbCheck.ville).toBe('Tanger');
        });

        test('doit retourner 400 si utilisateur inexistant (admin)', async () => {
            const res = await request(app)
                .put('/api/etudiants/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ filiere: 'GINF' });
            expect(res.status).toBe(400);
        });
    });

});
