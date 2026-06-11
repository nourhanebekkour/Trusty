import request from 'supertest';
import app from '../../src/app.js'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Compétence', () => {

    let tokenAdmin;
    let tokenEtudiant;
    let adminId;
    let etudiantId;
    let competenceId; // ID crée pendant les tests, réutilisé


    beforeAll(async () => {

        // -- NETTOYAGE --
        await prisma.utilisateur.deleteMany({
            where: {
                email: { in: ['admin.competence@test.com', 'etudiant.competence@test.com'] }
            }
        });


        // --- CRÉATION ADMIN DE TEST (requireRole('ADMINISTRATEUR') ) ---
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.competence@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Test',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF'
            }
        });

        adminId = admin.id_utilisateur;
        //  il faut aussi créer l'entrée correspondante dans la table administrateur 
        // avec la FK id_administrateur qui pointe vers id_utilisateur

        await prisma.administrateur.create({
            data: { id_administrateur: admin.id_utilisateur }
        });


        // --- CRÉATION ÉTUDIANT DE TEST ---
        const etudiant = await prisma.utilisateur.create({
            data: {
                email: 'etudiant.competence@test.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Student',
                prenom: 'Test',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });

        etudiantId = etudiant.id_utilisateur;
        await prisma.etudiant.create({
            data: { id_etudiant: etudiant.id_utilisateur, filiere:'GINF'}
        });

        // --- LOGIN ADMIN ---
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.competence@test.com', password: 'password' });
        const cookiesAdmin = loginAdmin.headers['set-cookie'] || [];
        const accessCookieAdmin = cookiesAdmin.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookieAdmin.split(';')[0].replace('accessToken=', '');

        // --- LOGIN ÉTUDIANT ---
        const loginEtudiant = await request(app)
            .post('/api/auth/login')
            .send({ email: 'etudiant.competence@test.com', password: 'password' });
        const cookiesEtudiant = loginEtudiant.headers['set-cookie'] || [];
        const accessCookieEtudiant = cookiesEtudiant.find(c => c.startsWith('accessToken=')) || '';
        tokenEtudiant = accessCookieEtudiant.split(';')[0].replace('accessToken=', '');

    }); // fin beforeAll



    afterAll(async () => {
        //--- NETTOYAGE DANS L'ORDRE DES DÉPENDANCES ---
        await prisma.etudiantCompetence.deleteMany({ where: { id_etudiant: etudiantId } });
        await prisma.competence.deleteMany({ where: { id_competence: competenceId } });
        await prisma.etudiant.deleteMany({ where: { id_etudiant: etudiantId } });
        await prisma.administrateur.deleteMany({ where: { id_administrateur: adminId } });
        await prisma.utilisateur.deleteMany({
            where: { email: { in: ['admin.competence@test.com', 'etudiant.competence@test.com'] } }
        });
        await prisma.$disconnect();
    });


    // -- GET --
    describe('GET /api/competences', () => {
        test('doit retourner 200 avec la liste des compétences', async () => {
            const res = await request(app)
                .get('/api/competences')
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app).get('/api/competences');
            expect(res.status).toBe(401);
        });
    });

    // -- POST --
    describe('POST /api/competences', () => {
        test('doit créer une compétence et retourner 201', async () => {
            const res = await request(app)
                .post('/api/competences')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    nom: 'Docker',
                    type: 'TECHNIQUE',
                    categorie: 'DevOps'
                });

            expect(res.status).toBe(201);
            expect(res.body.data.nom).toBe('Docker');

            // On sauvegarde l'ID pour les tests suivants
            competenceId = res.body.data.id_competence;
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .post('/api/competences')
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ nom: 'Test', type: 'TECHNIQUE', categorie: 'Test' });

            expect(res.status).toBe(403);
        });
    });

    // -- GET/:id --
    describe('GET /api/competences/:id', () => {
        test('doit retourner 200 avec la compétence trouvée', async () => {
            const res = await request(app)
                .get(`/api/competences/${competenceId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.data.nom).toBe('Docker');
        });

        test('doit retourner 404 si compétence inexistante', async () => {
            const res = await request(app)
                .get('/api/competences/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(404);
        });
    });

    // -- PUT/:id --
    describe('PUT /api/competences/:id', () => {
        test('doit modifier la compétence (admin) et retourner 200', async () => {
            const res = await request(app)
                .put(`/api/competences/${competenceId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nom: 'Docker Test Modifié' });

            expect(res.status).toBe(200);
            expect(res.body.data.nom).toBe('Docker Test Modifié');

            // Vérification en base
            const dbCheck = await prisma.competence.findUnique({
                where: { id_competence: competenceId }
            });
            expect(dbCheck.nom).toBe('Docker Test Modifié');
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .put(`/api/competences/${competenceId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ nom: 'Hack' });

            expect(res.status).toBe(403);
        });
    });

    // ROUTES ÉTUDIANT
    describe('POST /api/competences/etudiant/:id_etudiant/:id_competence', () => {
        test('doit associer une compétence à un étudiant et retourner 200', async () => {
            const res = await request(app)
                .post(`/api/competences/etudiant/${etudiantId}/${competenceId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ niveau_maitrise: 'INTERMEDIAIRE' });

            expect(res.status).toBe(200);
            expect(res.body.data.niveau_maitrise).toBe('INTERMEDIAIRE');
        });
    });

    describe('GET /api/competences/etudiant/:id_etudiant', () => {
        test('doit retourner les compétences de l\'étudiant', async () => {
            const res = await request(app)
                .get(`/api/competences/etudiant/${etudiantId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('DELETE /api/competences/etudiant/:id_etudiant/:id_competence', () => {
        test('doit retirer la compétence de l\'étudiant et retourner 200', async () => {
            const res = await request(app)
                .delete(`/api/competences/etudiant/${etudiantId}/${competenceId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
        });
    });

    // -- DELETE/:id En dernier car les tests s'exécutent dans l'ordre --
    describe('DELETE /api/competences/:id', () => {
        test('doit supprimer la compétence (admin) et retourner 200', async () => {
            const res = await request(app)
                .delete(`/api/competences/${competenceId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);

            // Vérification en base
            const dbCheck = await prisma.competence.findUnique({
                where: { id_competence: competenceId }
            });
            expect(dbCheck).toBeNull();
        });

        test('doit retourner 403 si non admin', async () => {
            const res = await request(app)
                .delete(`/api/competences/${competenceId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(403);
        });
    });

});
