import request from 'supertest';
import app from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Integration API : Stage', () => {

    let tokenAdmin;
    let tokenEtudiant;
    let tokenProfesseur;
    let adminId;
    let etudiantId;
    let professeurId;
    let stageId;

    beforeAll(async () => {

        // Nettoyer avant
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@stage.com',
                        'etudiant.integration@stage.com',
                        'prof.integration@stage.com'
                    ]
                }
            }
        });

        // Création admin
        const admin = await prisma.utilisateur.create({
            data: {
                email: 'admin.integration@stage.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Admin',
                prenom: 'Stage',
                role: 'ADMINISTRATEUR',
                status_compte: 'ACTIF'
            }
        });
        adminId = admin.id_utilisateur;
        await prisma.administrateur.create({ data: { id_administrateur: adminId } });

        // Création étudiant avec profil (filière GINF)
        const etudiantUser = await prisma.utilisateur.create({
            data: {
                email: 'etudiant.integration@stage.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Etudiant',
                prenom: 'Stage',
                role: 'ETUDIANT',
                status_compte: 'ACTIF'
            }
        });
        etudiantId = etudiantUser.id_utilisateur;
        await prisma.etudiant.create({
            data: { id_etudiant: etudiantId, filiere: 'GINF' }
        });

        // Création professeur avec profil (intervient en GINF)
        const profUser = await prisma.utilisateur.create({
            data: {
                email: 'prof.integration@stage.com',
                mot_de_passe: await bcrypt.hash('password', 10),
                nom: 'Prof',
                prenom: 'Stage',
                role: 'PROFESSEUR',
                status_compte: 'ACTIF'
            }
        });
        professeurId = profUser.id_utilisateur;
        await prisma.professeur.create({
            data: { id_professeur: professeurId, filieres_interv: ['GINF'] }
        });

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin.integration@stage.com', password: 'password' });
        const cookiesAdmin = loginAdmin.headers['set-cookie'] || [];
        const accessCookieAdmin = cookiesAdmin.find(c => c.startsWith('accessToken=')) || '';
        tokenAdmin = accessCookieAdmin.split(';')[0].replace('accessToken=', '');

        // Login étudiant
        const loginEtudiant = await request(app)
            .post('/api/auth/login')
            .send({ email: 'etudiant.integration@stage.com', password: 'password' });
        const cookiesEtudiant = loginEtudiant.headers['set-cookie'] || [];
        const accessCookieEtudiant = cookiesEtudiant.find(c => c.startsWith('accessToken=')) || '';
        tokenEtudiant = accessCookieEtudiant.split(';')[0].replace('accessToken=', '');

        // Login professeur
        const loginProf = await request(app)
            .post('/api/auth/login')
            .send({ email: 'prof.integration@stage.com', password: 'password' });
        const cookiesProf = loginProf.headers['set-cookie'] || [];
        const accessCookieProf = cookiesProf.find(c => c.startsWith('accessToken=')) || '';
        tokenProfesseur = accessCookieProf.split(';')[0].replace('accessToken=', '');
    });

    // Nettoyer après les tests
    afterAll(async () => {
        if (stageId) {
            await prisma.stage.deleteMany({ where: { id_stage: stageId } });
        }
        await prisma.etudiant.deleteMany({ where: { id_etudiant: etudiantId } });
        await prisma.professeur.deleteMany({ where: { id_professeur: professeurId } });
        await prisma.administrateur.deleteMany({ where: { id_administrateur: adminId } });
        await prisma.utilisateur.deleteMany({
            where: {
                email: {
                    in: [
                        'admin.integration@stage.com',
                        'etudiant.integration@stage.com',
                        'prof.integration@stage.com'
                    ]
                }
            }
        });
        await prisma.$disconnect();
    });

    // TEST API POST /etudiant/:id_etudiant → propriétaire ou admin
    describe('POST /api/stages/etudiant/:id_etudiant', () => {

        test('doit retourner 201 et créer le stage (propriétaire)', async () => {
            const res = await request(app)
                .post(`/api/stages/etudiant/${etudiantId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({
                    entreprise: 'TechCorp',
                    poste: 'Développeur',
                    date_debut: '2025-07-01',
                    missions: 'Développer des fonctionnalités',
                });

            expect(res.status).toBe(201);
            expect(res.body.data.entreprise).toBe('TechCorp');
            expect(res.body.data.id_etudiant).toBe(etudiantId);

            // On sauvegarde l'ID pour les tests suivants
            stageId = res.body.data.id_stage;

            // Vérification en base
            const dbCheck = await prisma.stage.findUnique({ where: { id_stage: stageId } });
            expect(dbCheck.entreprise).toBe('TechCorp');
        });

        test('doit retourner 403 si un autre utilisateur tente de créer un stage pour cet étudiant', async () => {
            const res = await request(app)
                .post(`/api/stages/etudiant/${etudiantId}`)
                .set('Authorization', `Bearer ${tokenProfesseur}`)
                .send({ entreprise: 'HackCorp', poste: 'Hack', date_debut: '2025-07-01', missions: 'test' });

            expect(res.status).toBe(403);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app)
                .post(`/api/stages/etudiant/${etudiantId}`)
                .send({ entreprise: 'TechCorp', poste: 'Dev', date_debut: '2025-07-01', missions: 'test' });

            expect(res.status).toBe(401);
        });

    });

    // TEST API GET / → authentifié (auth global)
    describe('GET /api/stages', () => {

        test('doit retourner 200 avec la liste des stages (authentifié)', async () => {
            const res = await request(app)
                .get('/api/stages')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('doit retourner 401 sans token', async () => {
            const res = await request(app).get('/api/stages');
            expect(res.status).toBe(401);
        });

    });

    // TEST API GET /:id → authentifié
    describe('GET /api/stages/:id', () => {

        test('doit retourner 200 avec le stage trouvé', async () => {
            const res = await request(app)
                .get(`/api/stages/${stageId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id_stage).toBe(stageId);
            expect(res.body.data.entreprise).toBe('TechCorp');
        });

        test('doit retourner 404 si stage inexistant', async () => {
            const res = await request(app)
                .get('/api/stages/id-qui-nexiste-pas')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(404);
        });

    });

    // TEST API GET /etudiant/:id_etudiant → authentifié
    describe('GET /api/stages/etudiant/:id_etudiant', () => {

        test('doit retourner 200 avec les stages de l\'étudiant', async () => {
            const res = await request(app)
                .get(`/api/stages/etudiant/${etudiantId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            const ids = res.body.data.map(s => s.id_stage);
            expect(ids).toContain(stageId);
        });

    });

    // TEST API GET /a-valider → PROFESSEUR uniquement
    describe('GET /api/stages/a-valider', () => {

        test('doit retourner 200 avec les stages à valider (professeur)', async () => {
            const res = await request(app)
                .get('/api/stages/a-valider')
                .set('Authorization', `Bearer ${tokenProfesseur}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('doit retourner 403 si non professeur', async () => {
            const res = await request(app)
                .get('/api/stages/a-valider')
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(403);
        });

    });

    // TEST API PUT /:id → propriétaire ou admin (vérification dans le service)
    describe('PUT /api/stages/:id', () => {

        test('doit retourner 200 et modifier le stage (propriétaire)', async () => {
            const res = await request(app)
                .put(`/api/stages/${stageId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ entreprise: 'UpdatedCorp', poste: 'Senior Dev' });

            expect(res.status).toBe(200);
            expect(res.body.data.entreprise).toBe('UpdatedCorp');

            // Vérification en base
            const dbCheck = await prisma.stage.findUnique({ where: { id_stage: stageId } });
            expect(dbCheck.entreprise).toBe('UpdatedCorp');
        });

        test('doit retourner 403 si autre utilisateur tente de modifier', async () => {
            const res = await request(app)
                .put(`/api/stages/${stageId}`)
                .set('Authorization', `Bearer ${tokenProfesseur}`)
                .send({ entreprise: 'HackCorp' });

            expect(res.status).toBe(403);
        });

        test('doit retourner 200 si admin modifie le stage', async () => {
            const res = await request(app)
                .put(`/api/stages/${stageId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ entreprise: 'AdminCorp' });

            expect(res.status).toBe(200);

            // Remettre le nom original pour ne pas perturber les autres tests
            await prisma.stage.update({
                where: { id_stage: stageId },
                data: { entreprise: 'UpdatedCorp' }
            });
        });

    });

    // TEST API POST /:id/valider → PROFESSEUR uniquement (et validateur désigné)
    describe('POST /api/stages/:id/valider', () => {

        test('doit retourner 403 si non professeur', async () => {
            const res = await request(app)
                .post(`/api/stages/${stageId}/valider`)
                .set('Authorization', `Bearer ${tokenEtudiant}`)
                .send({ decision: 'VALIDE', commentaire: 'ok' });

            expect(res.status).toBe(403);
        });

        test('doit retourner 403 si le professeur n\'est pas le validateur désigné', async () => {
            // Le stage n'a pas de id_validateur → le prof ne peut pas le valider
            const res = await request(app)
                .post(`/api/stages/${stageId}/valider`)
                .set('Authorization', `Bearer ${tokenProfesseur}`)
                .send({ decision: 'VALIDE', commentaire: 'ok' });

            expect(res.status).toBe(403);
        });

        test('doit retourner 200 si le validateur désigné valide le stage', async () => {
            // Créer un stage avec le professeur comme validateur
            const stageAvecValidateur = await prisma.stage.create({
                data: {
                    id_etudiant: etudiantId,
                    id_validateur: professeurId,
                    entreprise: 'ValidCorp',
                    poste: 'Dev',
                    date_debut: new Date('2025-07-01'),
                    missions: 'À valider',
                    status_validation: 'EN_ATTENTE'
                }
            });

            const res = await request(app)
                .post(`/api/stages/${stageAvecValidateur.id_stage}/valider`)
                .set('Authorization', `Bearer ${tokenProfesseur}`)
                .send({ decision: 'VALIDE', commentaire: 'Très bon travail' });

            expect(res.status).toBe(200);
            expect(res.body.data.status_validation).toBe('VALIDE');

            // Vérification en base
            const dbCheck = await prisma.stage.findUnique({
                where: { id_stage: stageAvecValidateur.id_stage }
            });
            expect(dbCheck.status_validation).toBe('VALIDE');

            // Nettoyage
            await prisma.historiqueValidation.deleteMany({
                where: { id_entite: stageAvecValidateur.id_stage }
            });
            await prisma.stage.delete({ where: { id_stage: stageAvecValidateur.id_stage } });
        });

    });

    // TEST API DELETE /:id → propriétaire ou admin
    describe('DELETE /api/stages/:id', () => {

        test('doit retourner 403 si autre utilisateur tente de supprimer', async () => {
            const res = await request(app)
                .delete(`/api/stages/${stageId}`)
                .set('Authorization', `Bearer ${tokenProfesseur}`);

            expect(res.status).toBe(403);
        });

        test('doit retourner 200 et supprimer le stage (propriétaire)', async () => {
            const res = await request(app)
                .delete(`/api/stages/${stageId}`)
                .set('Authorization', `Bearer ${tokenEtudiant}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/supprimé/i);

            // Vérification en base
            const dbCheck = await prisma.stage.findUnique({ where: { id_stage: stageId } });
            expect(dbCheck).toBeNull();

            // On remet à null pour que afterAll ne tente pas de supprimer à nouveau
            stageId = null;
        });

    });

});
