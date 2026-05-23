import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Utilisateur', () => {

    let tokenAdmin;
    let tokenUser;
    let tokenAutreUser;
    let adminId;
    let userId;
    let autreUserId;

    beforeAll(async () => {

        // Nettoyer avant
        await prisma.administrateur.deleteMany({
            where: { utilisateur: { email: 'admin.integration@utilisateur.com' } }
        });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@utilisateur.com',
                        'user.integration@utilisateur.com',
                        'autre.integration@utilisateur.com'
                    ]
                }
            }
        });

        // Création admin de test
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.integration@utilisateur.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Integration',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF'
            }
        });
        adminId = admin.id_utilisateur;
        await prisma.administrateur.create({ data: { id_administrateur: adminId } });

        // Création utilisateur lambda (pour tester accès propriétaire)
        const user = await prisma.utilisateur.create({
            data: {
                email: 'user.integration@utilisateur.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'User',
                prenom: 'Integration',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });
        userId = user.id_utilisateur;

        // Création d'un second utilisateur (pour tester accès refusé)
        const autreUser = await prisma.utilisateur.create({
            data: {
                email: 'autre.integration@utilisateur.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Autre',
                prenom: 'Integration',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });
        autreUserId = autreUser.id_utilisateur;

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.integration@utilisateur.com', password: 'password' });
        const cookiesAdmin = loginAdmin.headers['set-cookie'] || [];
        const accessCookieAdmin = cookiesAdmin.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookieAdmin.split(';')[0].replace('accessToken=', '');

        // Login user lambda
        const loginUser = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user.integration@utilisateur.com', password: 'password' });
        const cookiesUser = loginUser.headers['set-cookie'] || [];
        const accessCookieUser = cookiesUser.find(c => c.startsWith('accessToken=')) || '';
        tokenUser = accessCookieUser.split(';')[0].replace('accessToken=', '');

        // Login autre user
        const loginAutre = await request(app)
            .post('/api/auth/login')
            .send({ email: 'autre.integration@utilisateur.com', password: 'password' });
        const cookiesAutre = loginAutre.headers['set-cookie'] || [];
        const accessCookieAutre = cookiesAutre.find(c => c.startsWith('accessToken=')) || '';
        tokenAutreUser = accessCookieAutre.split(';')[0].replace('accessToken=', '');
    });

    // Nettoyer après les tests
    afterAll(async () => {
        await prisma.administrateur.deleteMany({ where: { id_administrateur: adminId } });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@utilisateur.com',
                        'user.integration@utilisateur.com',
                        'autre.integration@utilisateur.com'
                    ]
                }
            }
        });
        await prisma.$disconnect();
    });

    // TEST API GET / → ADMINISTRATEUR uniquement
    describe('GET /api/utilisateurs', () => {

        test('doit retourner 200 avec la liste des utilisateurs (admin)', async () => {
            const res = await request(app)
                .get('/api/utilisateurs')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .get('/api/utilisateurs')
                .set('Authorization', `Bearer ${tokenUser}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app).get('/api/utilisateurs');
            expect(res.status).toBe(401);
        });
    });

    // TEST API GET /:id → propriétaire ou admin
    describe('GET /api/utilisateurs/:id', () => {

        test('doit retourner 200 si l\'utilisateur consulte son propre profil', async () => {
            const res = await request(app)
                .get(`/api/utilisateurs/${userId}`)
                .set('Authorization', `Bearer ${tokenUser}`);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe('user.integration@utilisateur.com');
        });

        test('doit retourner 200 si admin consulte n\'importe quel profil', async () => {
            const res = await request(app)
                .get(`/api/utilisateurs/${userId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
        });

        test('doit retourner 403 si un autre utilisateur consulte le profil', async () => {
            // autreUser n'est pas propriétaire de userId → accès refusé
            const res = await request(app)
                .get(`/api/utilisateurs/${userId}`)
                .set('Authorization', `Bearer ${tokenAutreUser}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 404 si utilisateur inexistant (admin)', async () => {
            const res = await request(app)
                .get('/api/utilisateurs/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(404);
        });
    });

    // TEST API PATCH /:id/role → ADMINISTRATEUR uniquement
    describe('PATCH /api/utilisateurs/:id/role', () => {

        test('doit retourner 200 et mettre à jour le rôle (admin)', async () => {
            const res = await request(app)
                .patch(`/api/utilisateurs/${userId}/role`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ role: 'PROFESSEUR' });

            expect(res.status).toBe(200);
            expect(res.body.data.role).toBe('PROFESSEUR');

            // Vérification en base
            const dbCheck = await prisma.utilisateur.findUnique({
                where: { id_utilisateur: userId }
            });
            expect(dbCheck.role).toBe('PROFESSEUR');

            // Remettre en ETUDIANT pour ne pas perturber les autres tests
            await prisma.utilisateur.update({
                where: { id_utilisateur: userId },
                data: { role: 'ETUDIANT' }
            });
        });

        test('doit retourner 400 si le rôle est absent', async () => {
            const res = await request(app)
                .patch(`/api/utilisateurs/${userId}/role`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/rôle/i);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .patch(`/api/utilisateurs/${userId}/role`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({ role: 'PROFESSEUR' });

            expect(res.status).toBe(403);
        });
    });

    // TEST API PATCH /:id/statut → ADMINISTRATEUR uniquement
    describe('PATCH /api/utilisateurs/:id/statut', () => {

        test('doit retourner 200 et mettre à jour le statut (admin)', async () => {
            const res = await request(app)
                .patch(`/api/utilisateurs/${userId}/statut`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ status: 'SUSPENDU' });

            expect(res.status).toBe(200);
            expect(res.body.data.status_compte).toBe('SUSPENDU');

            // Vérification en base
            const dbCheck = await prisma.utilisateur.findUnique({
                where: { id_utilisateur: userId }
            });
            expect(dbCheck.status_compte).toBe('SUSPENDU');

            // Remettre ACTIF pour ne pas perturber les autres tests
            await prisma.utilisateur.update({
                where: { id_utilisateur: userId },
                data: { status_compte: 'ACTIF' }
            });
        });

        test('doit retourner 400 si le statut est absent', async () => {
            const res = await request(app)
                .patch(`/api/utilisateurs/${userId}/statut`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/statut/i);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .patch(`/api/utilisateurs/${userId}/statut`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({ status: 'SUSPENDU' });

            expect(res.status).toBe(403);
        });
    });

    // TEST API DELETE /:id → ADMINISTRATEUR uniquement
    describe('DELETE /api/utilisateurs/:id', () => {

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .delete(`/api/utilisateurs/${autreUserId}`)
                .set('Authorization', `Bearer ${tokenUser}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app)
                .delete(`/api/utilisateurs/${autreUserId}`);

            expect(res.status).toBe(401);
        });

        test('doit retourner 200 et supprimer l\'utilisateur (admin)', async () => {
            // Créer un utilisateur temporaire juste pour le supprimer
            const tmpUser = await prisma.utilisateur.create({
                data: {
                    email: 'tmp.delete@utilisateur.com',
                    mot_de_passe: await bcrypt.hash('password', 10),
                    nom: 'Tmp',
                    prenom: 'Delete',
                    role: 'ETUDIANT',
                    status_compte: 'ACTIF'
                }
            });

            const res = await request(app)
                .delete(`/api/utilisateurs/${tmpUser.id_utilisateur}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/supprimé/i);

            // Vérification en base : l'utilisateur ne doit plus exister
            const dbCheck = await prisma.utilisateur.findUnique({
                where: { id_utilisateur: tmpUser.id_utilisateur }
            });
            expect(dbCheck).toBeNull();
        });
    });

});
