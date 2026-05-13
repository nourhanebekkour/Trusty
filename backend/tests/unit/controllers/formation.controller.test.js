import { jest } from '@jest/globals'
// mock des fonctions service
const mockRecupererFormationsParEtudiant = jest.fn();
const mockRecupererFormationParId = jest.fn();
const mockAjouterFormation = jest.fn();
const mockModifierFormation = jest.fn();
const mockSupprimerFormation = jest.fn();

// mock du service
await jest.unstable_mockModule('../../../src/Services/formationService.js', () => ({
    recupererFormationsParEtudiant: mockRecupererFormationsParEtudiant,
    recupererFormationParId: mockRecupererFormationParId,
    ajouterFormation: mockAjouterFormation,
    modifierFormation: mockModifierFormation,
    supprimerFormation: mockSupprimerFormation
}));

// import du controller après le mock
const { obtenirFormations, ajouterFormation, mettreAJourFormation, supprimerFormation }
    = await import('../../../src/Controllers/formationController.js');

describe('Controller Formation', () => {

    let req, res;
    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: { id: 'user-1', role: 'ETUDIANT' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('obtenirFormations', () => {
        test('doit retourner 200 avec les formations', async () => {
            const mockData = [{ id_formation: '1' }];
            mockRecupererFormationsParEtudiant.mockResolvedValue(mockData);

            await obtenirFormations(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Formations récupérées avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererFormationsParEtudiant.mockRejectedValue(new Error('Erreur DB'));

            await obtenirFormations(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des formations",
                data: null,
                erreur: expect.any(String)
            });
        });
    });


    describe('ajouterFormation', () => {
        test('doit retourner 201 avec la formation ajoutée', async () => {
            const mockData = { id_formation: '1' };
            mockAjouterFormation.mockResolvedValue(mockData);
            req.params.id_etudiant = 'id-1';
            req.body = { diplome: 'ING', etablissement: 'ENSAT' };

            await ajouterFormation(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 201,
                success: true,
                message: "Formation ajoutée avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            mockAjouterFormation.mockRejectedValue(new Error('Erreur DB'));
            await ajouterFormation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de l'ajout de la formation",
                data: null,
                erreur: expect.any(String)
            });
        });
    });

    describe('mettreAJourFormation', () => {
        test('doit retourner 200 et modifier la formation', async () => {
            req.params.id = '1';
            req.body = { diplome: 'ING', etablissement: 'ENSAT' };
            const mockData = { id_formation: '1', diplome: 'ING', etablissement: 'ENSAT' };
            mockModifierFormation.mockResolvedValue(mockData);

            await mettreAJourFormation(req, res);

            expect(mockModifierFormation).toHaveBeenCalledWith('1', req.body, 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Formation modifiée avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            mockModifierFormation.mockRejectedValue(new Error('Erreur DB'));
            await mettreAJourFormation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de la modification",
                data: null,
                erreur: expect.any(String)
            });
        });
    });


    describe('supprimerFormation', () => {
        test('doit retourner 200 et supprimer la formation', async () => {
            mockSupprimerFormation.mockResolvedValue({ id_formation: '1' });
            req.params.id = '3';

            await supprimerFormation(req, res);

            expect(mockSupprimerFormation).toHaveBeenCalledWith('3', 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Formation supprimée avec succès",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            mockSupprimerFormation.mockRejectedValue(new Error('Erreur DB'));
            await supprimerFormation(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
