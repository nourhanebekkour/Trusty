import request from 'supertest';
import app from '../../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Integration API : Profil Étudiant', () => {
    let utilisateurId;

    beforeAll(async () => {

        // Nettoyer avant 
        await prisma.etudiant.deleteMany({
            where: { utilisateur: { email: 'test.integration@etudiant.com' } }
        });

        await prisma.utilisateur.deleteMany({
            where: { email: 'test.integration@etudiant.com' }
        });

        // Création utilisateur test pour la contrainte DB
        const user = await prisma.utilisateur.create({
            data: {
                email: 'test.integration@etudiant.com',
                mot_de_passe: 'password',
                nom: 'Test',
                prenom: 'Integration',
                role: 'ETUDIANT'
            }
        });
        utilisateurId = user.id_utilisateur;
    });

    // Nettoyer après les tests
    afterAll(async () => {
        await prisma.etudiant.deleteMany({ where: { id_etudiant: utilisateurId } });
        await prisma.utilisateur.delete({ where: { id_utilisateur: utilisateurId } });
        // Fermer les connexions après les tests
        await prisma.$disconnect();
    });

    // TEST API GET
    describe('GET /api/etudiants', () => {
        test('doit retourner 200 avec la liste des étudiants', async () => {
            const res = await request(app).get('/api/etudiants');
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
        });
    });

    // TEST API GET PAR ID
    describe('GET /api/etudiants/:id', () => {
        test('doit retourner 404 si étudiant inexistant', async () => {
            const res = await request(app).get('/api/etudiants/id-inexistant');
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
            const res = await request(app).get(`/api/etudiants/${utilisateurId}`);
            expect(res.status).toBe(200);
            expect(res.body.utilisateur.email).toBe('test.integration@etudiant.com');
        });
    });

    // TEST API PUT
    describe('PUT /api/etudiants/:id', () => {
        // contrainte DB : on peut pas créer un étudiant sans que l'utilisateur existe d'abord
        // Etudiant.id_etudiant doit réferencer Utilisateur.id_utilisateur

        test('doit créer ou modifier un profil', async () => {
            const res = await request(app)
                .put(`/api/etudiants/${utilisateurId}`)
                .send({ filiere: 'GINF', ville: 'Tanger' });

            // Vérification HTTP
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/succès/i);

            // Vérification API Response
            expect(res.body.donnees.filiere).toBe('GINF');
            expect(res.body.donnees.ville).toBe('Tanger');

            // Vérification en base
            const dbCheck = await prisma.etudiant.findUnique({
                where: { id_etudiant: utilisateurId }
            });
            expect(dbCheck.ville).toBe('Tanger');
        });

        test('doit retourner 400 si utilisateur inexistant', async () => {
            const res = await request(app)
                .put('/api/etudiants/id-qui-nexiste-pas')
                .send({ filiere: 'GINF' });
            expect(res.status).toBe(400);
        });
    });

}); 