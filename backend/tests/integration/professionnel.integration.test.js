import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Professionnel', () => {

    let tokenAdmin;
    let tokenUser;
    let adminId;
    let userId;
    let professionnelEnAttenteId;

    beforeAll(async () => {

        // Nettoyer avant
        await prisma.professionnel.deleteMany({
            where: { utilisateur: { email: { in: ['pro.integration@test.com', 'pro.valide@test.com'] } } }
        });
        await prisma.administrateur.deleteMany({
            where: { utilisateur: { email: 'admin.integration@professionnel.com' } }
        });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@professionnel.com',
                        'pro.integration@test.com',
                        'pro.valide@test.com'
                    ]
                }
            }
        });

        // Création admin de test
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.integration@professionnel.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Integration',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF'
            }
        });
        adminId = admin.id_utilisateur;
        await prisma.administrateur.create({ data: { id_administrateur: adminId } });

        // Création utilisateur lambda (ne peut pas accéder aux routes admin)
        const user = await prisma.utilisateur.create({
            data: {
                email: 'pro.integration@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Pro',
                prenom: 'Integration',
                role: 'PROFESSIONNEL',
                status_compte: 'ACTIF'
            }
        });
        userId = user.id_utilisateur;

        // Création d'un professionnel EN_ATTENTE pour les tests de validation
        const proUser = await prisma.utilisateur.create({
            data: {
                email: 'pro.valide@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Valide',
                prenom: 'Pro',
                role: 'PROFESSIONNEL',
                status_compte: 'ACTIF'
            }
        });
        const pro = await prisma.professionnel.create({
            data: {
                id_professionnel: proUser.id_utilisateur,
                status_validation: 'EN_ATTENTE'
            }
        });
        professionnelEnAttenteId = pro.id_professionnel;

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.integration@professionnel.com', password: 'password' });
        const cookiesAdmin = loginAdmin.headers['set-cookie'] || [];
        const accessCookieAdmin = cookiesAdmin.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookieAdmin.split(';')[0].replace('accessToken=', '');

        // Login user lambda
        const loginUser = await request(app)
            .post('/api/auth/login')
            .send({ email: 'pro.integration@test.com', password: 'password' });
        const cookiesUser = loginUser.headers['set-cookie'] || [];
        const accessCookieUser = cookiesUser.find(c => c.startsWith('accessToken=')) || '';
        tokenUser = accessCookieUser.split(';')[0].replace('accessToken=', '');
    });

    // Nettoyer après les tests
    afterAll(async () => {
        await prisma.professionnel.deleteMany({
            where: { id_professionnel: professionnelEnAttenteId }
        });
        await prisma.administrateur.deleteMany({ where: { id_administrateur: adminId } });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@professionnel.com',
                        'pro.integration@test.com',
                        'pro.valide@test.com'
                    ]
                }
            }
        });
        await prisma.$disconnect();
    });

    // TEST API GET /en-attente → ADMINISTRATEUR uniquement
    describe('GET /api/professionnels/en-attente', () => {

        test('doit retourner 200 avec la liste des professionnels en attente (admin)', async () => {
            const res = await request(app)
                .get('/api/professionnels/en-attente')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            // Le professionnel créé en beforeAll doit apparaître dans la liste
            const ids = res.body.data.map(p => p.id_professionnel);
            expect(ids).toContain(professionnelEnAttenteId);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .get('/api/professionnels/en-attente')
                .set('Authorization', `Bearer ${tokenUser}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app).get('/api/professionnels/en-attente');
            expect(res.status).toBe(401);
        });
    });

    // TEST API PATCH /:id/valider → ADMINISTRATEUR uniquement
    describe('PATCH /api/professionnels/:id/valider', () => {

        test('doit retourner 404 si professionnel inexistant (admin)', async () => {
            const res = await request(app)
                .patch('/api/professionnels/id-qui-nexiste-pas/valider')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ action: 'VALIDE' });

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/introuvable/i);
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .patch(`/api/professionnels/${professionnelEnAttenteId}/valider`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({ action: 'VALIDE' });

            expect(res.status).toBe(403);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app)
                .patch(`/api/professionnels/${professionnelEnAttenteId}/valider`)
                .send({ action: 'VALIDE' });

            expect(res.status).toBe(401);
        });

        test('doit retourner 200 et valider le professionnel (admin)', async () => {
            const res = await request(app)
                .patch(`/api/professionnels/${professionnelEnAttenteId}/valider`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ action: 'VALIDE' });

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/VALIDE/);
            expect(res.body.data.status_validation).toBe('VALIDE');

            // Vérification en base
            const dbCheck = await prisma.professionnel.findUnique({
                where: { id_professionnel: professionnelEnAttenteId }
            });
            expect(dbCheck.status_validation).toBe('VALIDE');
        });

        test('doit retourner 400 si professionnel déjà validé', async () => {
            // Le professionnel est maintenant VALIDE → toute nouvelle tentative est refusée
            const res = await request(app)
                .patch(`/api/professionnels/${professionnelEnAttenteId}/valider`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ action: 'VALIDE' });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/déjà/i);
        });

    });

});
