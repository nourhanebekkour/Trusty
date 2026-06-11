import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Profil Administrateur', () => {
    let adminId;
    let tokenAdmin;
    let autreAdminId;

    beforeAll(async () => {
        // nettoyage avant les tests pour partir d'un état propre
        await prisma.administrateur.deleteMany({
            where: {
                utilisateur: {
                    email: {
                        in: [
                            'admin.integration@admin.com',
                            'autre.admin.integration@admin.com',
                        ]
                    }
                }
            }
        });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@admin.com',
                        'autre.admin.integration@admin.com',
                    ]
                }
            }
        });

        // créer le premier admin — utilisé pour se connecter et faire les requêtes
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.integration@admin.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Integration',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF',
            },
        });
        adminId = admin.id_utilisateur;
        // la table administrateur est séparée de utilisateur — il faut créer les deux
        await prisma.administrateur.create({ data: { id_administrateur: adminId } });

        // créer un deuxième admin — utilisé pour tester GET /:id et PUT /:id
        const autreAdmin = await prisma.utilisateur.create({
            data: {
                email: 'autre.admin.integration@admin.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Autre',
                prenom: 'Admin',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF',
            },
        });
        autreAdminId = autreAdmin.id_utilisateur;
        await prisma.administrateur.create({ data: { id_administrateur: autreAdminId } });

        // login pour récupérer le token d'accès
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.integration@admin.com', password: 'password' });
        const cookies = loginRes.headers['set-cookie'] || [];
        const accessCookie = cookies.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookie.split(';')[0].replace('accessToken=', '');
    });

    afterAll(async () => {
        await prisma.administrateur.deleteMany({
            where: { id_administrateur: { in: [adminId, autreAdminId] } }
        });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@admin.com',
                        'autre.admin.integration@admin.com',
                    ]
                }
            }
        });
        await prisma.$disconnect();
    });

    // GET /api/administrateurs
    describe('GET /api/administrateurs', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app).get('/api/administrateurs');
            expect(res.status).toBe(401);
        });

        test('retourne 200 avec la liste des admins', async () => {
            const res = await request(app)
                .get('/api/administrateurs')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // on vérifie qu'on a bien un tableau (au moins les deux admins créés)
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });
    });

    // GET /api/administrateurs/:id
    describe('GET /api/administrateurs/:id', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app).get(`/api/administrateurs/${adminId}`);
            expect(res.status).toBe(401);
        });

        test('retourne 200 avec le profil de l\'admin', async () => {
            const res = await request(app)
                .get(`/api/administrateurs/${adminId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.data.utilisateur.email).toBe('admin.integration@admin.com');
        });

        test('retourne 404 si l\'admin n\'existe pas', async () => {
            const res = await request(app)
                .get('/api/administrateurs/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // PUT /api/administrateurs/:id
    describe('PUT /api/administrateurs/:id', () => {

        test('retourne 401 sans token', async () => {
            const res = await request(app)
                .put(`/api/administrateurs/${autreAdminId}`)
                .send({ niveau_acces: 'SUPERADMIN' });
            expect(res.status).toBe(401);
        });

        test('retourne 200 et met à jour le profil', async () => {
            const res = await request(app)
                .put(`/api/administrateurs/${autreAdminId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ niveau_acces: 'SUPER_ADMIN' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/succès/i);

            // vérification directe en BDD que la valeur a bien changé
            const dbCheck = await prisma.administrateur.findUnique({
                where: { id_administrateur: autreAdminId },
            });
            expect(dbCheck.niveau_acces).toBe('SUPER_ADMIN');
        });

        test('retourne 200 et crée le profil admin si inexistant', async () => {
            // on supprime le profil admin de autreAdminId pour simuler une création
            await prisma.administrateur.delete({ where: { id_administrateur: autreAdminId } });

            const res = await request(app)
                .put(`/api/administrateurs/${autreAdminId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ niveau_acces: 'ADMIN' });

            expect(res.status).toBe(200);
            expect(res.body.data.niveau_acces).toBe('ADMIN');
        });
    });
});
