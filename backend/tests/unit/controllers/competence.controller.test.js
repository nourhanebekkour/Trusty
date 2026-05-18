// -- TEST UNITAIRE CONTROLLER COMPETENCE --
import { jest } from '@jest/globals';

// --- MOCK DES SERVICES ---
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockCreate = jest.fn();
const mockModify = jest.fn();
const mockDelete = jest.fn();
const mockLink = jest.fn();
const mockRemove = jest.fn();
const mockGetByStudent = jest.fn();

await jest.unstable_mockModule('../../../src/Services/competenceService.js', () => ({
    recupererToutesLesCompetences: mockGetAll,
    recupererCompetenceParId: mockGetById,
    creerCompetence: mockCreate,
    modifierCompetence: mockModify,
    supprimerCompetence: mockDelete,
    lierCompetenceAEtudiant: mockLink,
    retirerCompetenceEtudiant: mockRemove,
    recupererCompetencesEtudiant: mockGetByStudent
}));

// -- IMPORT DYNAMIQUE CONTROLLER -- 
const { listerCompetences, recupererCompetence, ajouterCompetence, modifierCompetence, supprimerCompetence, listerCompetencesEtudiant, associerCompetence, detacherCompetence }
    = await import('../../../src/Controllers/competenceController.js');


describe('Controller Compétence', () => {

    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(), // chaînage mth comme cpp
            json: jest.fn()
        };
        jest.clearAllMocks();
    });


    // -- TEST CONTRÔLEURS CATALOGUE ---

    describe('listerCompetences', () => {

        test('doit retourner 200 avec la liste des compétences', async () => {
            const mockData = [{ id_competence: '1' }];
            mockGetAll.mockResolvedValue(mockData);

            await listerCompetences(req, res);

            expect(mockGetAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétences récupérées avec succès",
                data: mockData,
                erreur: null
            });

        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockGetAll.mockRejectedValue(new Error('Erreur DB'));
            await listerCompetences(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des compétences",
                data: null,
                erreur: expect.any(Error)
            });
        });
    });

    describe('recupererCompetence', () => {

        test('doit retourner 200 si compétence trouvée', async () => {

            req.params.id = '1';

            const mockData = { id_competence: '1' };
            mockGetById.mockResolvedValue(mockData);

            await recupererCompetence(req, res);

            expect(mockGetById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétence récupérée avec succès",
                data: mockData,
                erreur: null
            });
        });


        test('doit retourner 404 si compétence non trouvée', async () => {

            req.params.id = '9999';

            mockGetById.mockResolvedValue(null);

            await recupererCompetence(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Compétence non trouvée",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockGetById.mockRejectedValue(new Error('Erreur DB'));
            await recupererCompetence(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération",
                data: null,
                erreur: expect.any(Error)
            });
        });

    });

    describe('ajouterCompetence', () => {

        test('doit retourner 201 et créer une compétence', async () => {
            // 1) donnée envoyée par HTTP
            req.body = {
                nom: 'Docker',
                type: 'TECHNIQUE',
                categorie: 'DevOps'
            };
            // 2) réponse simulée du service
            const mockData = {
                id_competence: '1',
                ...req.body
            };

            mockCreate.mockResolvedValue(mockData);

            // 3) appel controller
            await ajouterCompetence(req, res);

            // 4) vérifications
            expect(mockCreate).toHaveBeenCalledWith(req.body);

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                status: 201,
                success: true,
                message: "Compétence créée avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            mockCreate.mockRejectedValue(new Error('Erreur DB'));
            await ajouterCompetence(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });


    describe('modifierCompetence', () => {

        test('doit retourner 200 et modifier la compétence', async () => {
            req.params.id = '1';
            req.body = {
                nom: 'Travail en équipe',
                type: 'COMPORTEMENTALE',
                categorie: 'Soft Skills'
            };
            const mockData = {
                id_competence: '1',
                ...req.body
            };
            mockModify.mockResolvedValue(mockData);

            await modifierCompetence(req, res);

            expect(mockModify).toHaveBeenCalledWith('1', req.body);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétence modifiée avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            req.params.id = '1';
            req.body = {};
            mockModify.mockRejectedValue(new Error('Erreur DB'));

            await modifierCompetence(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de la modification de la compétence",
                data: null,
                erreur: expect.any(Error)
            });
        })
    });

    describe('supprimerCompetence', () => {
        test('doit retourner 200 et supprimer la compétence', async () => {
            req.params.id = '1';
            mockDelete.mockResolvedValue({ id_competence: '1' });

            await supprimerCompetence(req, res);

            expect(mockDelete).toHaveBeenCalledWith('1');

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétence supprimée avec succès",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            req.params.id = '1';
            mockDelete.mockRejectedValue(new Error('Erreur DB'));
            await supprimerCompetence(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('listerCompetencesEtudiant', () => {

        test('doit retourner 200 avec les compétences de l\'étudiant', async () => {
            req.params.id_etudiant = '1';

            // mock service retour
            const mockData = [
                { id_competence: '1', nom: 'Docker' },
                { id_competence: '2', nom: 'Linux' }
            ];

            mockGetByStudent.mockResolvedValue(mockData);

            await listerCompetencesEtudiant(req, res);
            expect(mockGetByStudent).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétences de l'étudiant récupérées avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {

            req.params.id_etudiant = '1';

            mockGetByStudent.mockRejectedValue(new Error('Erreur DB'));

            await listerCompetencesEtudiant(req, res);

            expect(mockGetByStudent).toHaveBeenCalledWith('1');

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération",
                data: null,
                erreur: expect.any(Error)
            });
        });
    });

    describe('associerCompetence', () => {
        test('doit associer une compétence à un étudiant (200)', async () => {
            req.params.id_etudiant = 'e1';
            req.params.id_competence = 'c1';
            req.body = {
                niveau_maitrise: 3
            };

            const mockData = {
                id_etudiant: 'e1',
                id_competence: 'c1',
                niveau_maitrise: 3
            };

            mockLink.mockResolvedValue(mockData);

            await associerCompetence(req, res);

            expect(mockLink).toHaveBeenCalledWith('e1', 'c1', 3);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétence associée avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            req.params.id_etudiant = 'e1';
            req.params.id_competence = 'c1';
            req.body = { niveau_maitrise: 3 };

            mockLink.mockRejectedValue(new Error('Erreur DB'));

            await associerCompetence(req, res);

            expect(mockLink).toHaveBeenCalledWith('e1', 'c1', 3);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de l'association",
                data: null,
                erreur: expect.any(Error)
            });
        });

    });

    describe('detacherCompetence', () => {

        test('doit retirer une compétence d\'un étudiant (200)', async () => {
            req.params.id_etudiant = 'e2';
            req.params.id_competence = 'c3';

            // mock service (retour inutile ici)
            mockRemove.mockResolvedValue(null);

            await detacherCompetence(req, res);

            expect(mockRemove).toHaveBeenCalledWith('e2', 'c3');

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Compétence retirée de l'étudiant avec succès",
                data: null,
                erreur: null
            });
        });


        test('doit retourner 400 en cas d\'erreur', async () => {

            req.params.id_etudiant = 'e1';
            req.params.id_competence = 'c5';

            mockRemove.mockRejectedValue(new Error('Erreur DB'));
            await detacherCompetence(req, res);
            expect(mockRemove).toHaveBeenCalledWith('e1', 'c5');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors du retrait",
                data: null,
                erreur: expect.any(Error)
            });
        });
    });
});