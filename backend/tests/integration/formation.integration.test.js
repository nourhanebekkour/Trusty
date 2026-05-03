import request from 'supertest';
import app from '../../src/app.js'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Formations', () => {
    let utilisateurId;
    let formationId;
    let token;

    beforeAll(async () => {
        // Nettoyage ciblé avant test
        await prisma.formation.deleteMany({
            where: { etudiant: { utilisateur: { email: 'test.integration@formation.com' } } }
        });
        await prisma.etudiant.deleteMany({
            where: { utilisateur: { email: 'test.integration@formation.com' } }
        });
        await prisma.utilisateur.deleteMany({
            where: { email: 'test.integration@formation.com' }
        });

        // Création utilisateur test avec status ACTIF
        const user = await prisma.utilisateur.create({
            data: {
                email: 'test.integration@formation.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Test',
                prenom: 'Formation',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });
        utilisateurId = user.id_utilisateur;

        // Création étudiant lié (contrainte FK)
        await prisma.etudiant.create({
            data: { id_etudiant: utilisateurId }
        });

        // Login pour récupérer le token JWT
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.integration@formation.com', password: 'password' });
        token = loginRes.body.data.token;
    });

    afterAll(async () => {
        // Nettoyage après les tests
        await prisma.formation.deleteMany({ where: { id_etudiant: utilisateurId } });
        await prisma.etudiant.deleteMany({ where: { id_etudiant: utilisateurId } });
        await prisma.utilisateur.delete({ where: { id_utilisateur: utilisateurId } });
        await prisma.$disconnect();
    });



    // TEST API GET 
    describe('GET /api/formations/etudiant/:id_etudiant', () => {
        test('doit retourner 200 avec la liste des formations', async () => {
            const res = await request(app)
                .get(`/api/formations/etudiant/${utilisateurId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    // TEST API POST
    describe('POST /api/formations/etudiant/:id_etudiant', () => {
        test('doit retourner 201 avec la formation ajoutée', async () => {
            const res = await request(app)
                .post(`/api/formations/etudiant/${utilisateurId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    diplome: 'INGÉ',
                    etablissement: 'ENSAT',
                    date_debut: '2026-02-05',
                    est_actuelle: true
                });

            // console.log('BODY:', JSON.stringify(res.body));
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.diplome).toBe('INGÉ');

            expect(res.body.data.id_formation).toBeDefined();
            formationId = res.body.data.id_formation;
        });

        test('doit retourner 400 si données invalides', async () => {
            const res = await request(app)
                .post(`/api/formations/etudiant/${utilisateurId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });


    // TEST API PUT
    describe('PUT /api/formations/:id', () => {
        test('doit retourner 200 avec la formation modifiée', async () => {
            const res = await request(app)
                .put(`/api/formations/${formationId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    diplome: 'Architecture',
                    etablissement: 'ENA'
                });

            expect(res.status).toBe(200);
            expect(res.body.data.etablissement).toBe('ENA');
        });

        test('doit retourner 400 si formation inexistante', async () => {
            const res = await request(app)
                .put(`/api/formations/id-inexistant`)
                .set('Authorization', `Bearer ${token}`)
                .send({ diplome: 'Master' });
            expect(res.status).toBe(400);
        });
    });

    // TEST API DELETE
    describe('DELETE /api/formations/:id', () => {
        test('doit retourner 200 et supprimer la formation', async () => {
            const res = await request(app)
                .delete(`/api/formations/${formationId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            // Vérifier dans la base que ça a été supprimé
            const dbCheck = await prisma.formation.findUnique({
                where: { id_formation: formationId }
            });
            expect(dbCheck).toBeNull();
        });
        test('doit retourner 400 si formation inexistante', async () => {
            const res = await request(app)
                .delete('/api/formations/id-inexistant')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
        });
    });

    // TEST SANS TOKEN
    describe('Sans authentification', () => {
        test('doit retourner 401 sans token', async () => {
            const res = await request(app)
                .get(`/api/formations/etudiant/${utilisateurId}`);
            expect(res.status).toBe(401);
        });
    });

});