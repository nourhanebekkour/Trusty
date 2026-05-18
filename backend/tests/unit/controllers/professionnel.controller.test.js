// test unitaire du controller
import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

// 1) On crée les fonctions mock du service
const mockProfessionnelEnAttente = jest.fn();
const mockValidateProfessionnel = jest.fn();

// 2) On dit à Jest "quand quelqu'un importe ProfessionnelService,
//    donne-lui mes fonctions mock à la place"
await jest.unstable_mockModule('#Modules/identite/professionnel/professionnel.service.js', () => ({
    professionnelEnAttente: mockProfessionnelEnAttente,
    validateProfessionnel: mockValidateProfessionnel,
}));

// Le controller utilise aussi prisma directement (pour findUnique avant validation)
// → on le mocke aussi pour que les tests puissent contrôler sa réponse
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma
}));

// 3) SEULEMENT APRÈS on importe le controller
//    → quand le controller va importer le service et prisma,
//    il va recevoir les mocks au lieu des vrais modules
const { afficherProfessionnelEnAttente, validerProfessionnel } =
    await import('#Modules/identite/professionnel/professionnel.controller.js');


describe('Controller Professionnel', () => {

    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, user: { id: 'admin-1', role: 'ADMINISTRATEUR' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('afficherProfessionnelEnAttente', () => {

        // Test 1 : Cas succès
        // Déclaration du test asynchrone
        test('doit retourner 200 avec la liste des professionnels en attente', async () => {

            // Crée de fausses données (ce que la DB retournerait normalement)
            const mockProfessionnels = [
                { id_professionnel: 'p-1', status_validation: 'EN_ATTENTE', utilisateur: { nom: 'Alami' } },
                { id_professionnel: 'p-2', status_validation: 'EN_ATTENTE', utilisateur: { nom: 'Benali' } }
            ];

            // Dit au mock : "quand on t'appelle, retourne mockProfessionnels comme si
            // la DB avait répondu"
            mockProfessionnelEnAttente.mockResolvedValue(mockProfessionnels);

            // Appelle le vrai controller avec le faux req et res.
            // Le controller va appeler professionnelEnAttente()
            // mais au lieu du vrai service, il va tomber sur notre mock
            // qui retourne mockProfessionnels.
            await afficherProfessionnelEnAttente(req, res);

            // Vérifie que le controller a bien appelé res.status(200)
            expect(res.status).toHaveBeenCalledWith(200);

            // Vérifie que le controller a bien retourné les données dans la réponse.
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Les professionnels en attente de validation",
                data: mockProfessionnels,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockProfessionnelEnAttente.mockRejectedValue(new Error('Erreur DB'));

            await afficherProfessionnelEnAttente(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des profils",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('validerProfessionnel', () => {

        test('doit retourner 404 si professionnel introuvable', async () => {
            req.params.id = 'id-inexistant';
            req.body = { action: 'VALIDE' };

            // Le controller fait un findUnique avant d'appeler le service
            // → on simule : la DB ne trouve rien
            mockPrisma.professionnel.findUnique.mockResolvedValue(null);

            await validerProfessionnel(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Professionnel introuvable",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 400 si professionnel déjà validé', async () => {
            req.params.id = 'p-1';
            req.body = { action: 'VALIDE' };

            // Le professionnel existe mais n'est plus EN_ATTENTE
            mockPrisma.professionnel.findUnique.mockResolvedValue({
                id_professionnel: 'p-1',
                status_validation: 'VALIDE'
            });

            await validerProfessionnel(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Ce professionnel est déjà VALIDE",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 200 après validation avec succès', async () => {
            req.params.id = 'p-1';
            req.body = { action: 'VALIDE' };

            // Le professionnel existe et est EN_ATTENTE
            mockPrisma.professionnel.findUnique.mockResolvedValue({
                id_professionnel: 'p-1',
                status_validation: 'EN_ATTENTE'
            });

            const mockResult = {
                id_professionnel: 'p-1',
                status_validation: 'VALIDE',
                utilisateur: { nom: 'Alami' }
            };
            mockValidateProfessionnel.mockResolvedValue(mockResult);

            await validerProfessionnel(req, res);

            expect(mockValidateProfessionnel).toHaveBeenCalledWith('p-1', 'VALIDE');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Professionnel VALIDE avec succés",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 200 après rejet avec succès', async () => {
            req.params.id = 'p-2';
            req.body = { action: 'REJETE' };

            mockPrisma.professionnel.findUnique.mockResolvedValue({
                id_professionnel: 'p-2',
                status_validation: 'EN_ATTENTE'
            });

            const mockResult = {
                id_professionnel: 'p-2',
                status_validation: 'REJETE',
                utilisateur: { nom: 'Benali' }
            };
            mockValidateProfessionnel.mockResolvedValue(mockResult);

            await validerProfessionnel(req, res);

            expect(mockValidateProfessionnel).toHaveBeenCalledWith('p-2', 'REJETE');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Professionnel REJETE avec succés",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur inattendue', async () => {
            req.params.id = 'p-1';
            req.body = { action: 'VALIDE' };

            // Prisma lance une erreur inattendue
            mockPrisma.professionnel.findUnique.mockRejectedValue(new Error('Erreur DB'));

            await validerProfessionnel(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la validation du professionnel",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

});
