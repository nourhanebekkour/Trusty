import { jest } from '@jest/globals'
// mock des fonctions service
// créer une liste de fonctions vides
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
        req = { params: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('obtenirFormations', () => {
        // Cas succès
        test('doit retourner 200 avec les formations', async () => {

            const mockData = [{ id_formation: '1' }];
            mockRecupererFormationsParEtudiant.mockResolvedValue(mockData);

            await obtenirFormations(req, res);
            // Vérifie que le controller a bien appelé res.status(200)
            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Formations récupérées avec succès",
                data: mockData,
                erreur: null
            });

        });

        // Cas Erreur
        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererFormationsParEtudiant.mockRejectedValue(new Error('Erreur DB'));

            await obtenirFormations(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des formations",
                data: null,
                erreur: expect.any(Error)
            });

        });
    });


    describe('ajouterFormation', () => {

        test('doit retourner 201 avec la formation ajoutée', async () => {
            const mockData = { id_formation: '1' };
            mockAjouterFormation.mockResolvedValue(mockData);
            // simulation de la requête
            req.params.id_etudiant = 'id-1';
            req.body = {
                diplome: 'ING',
                etablissement: 'ENSAT'
            }

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
                erreur: expect.any(Error)
            });

        });
    });

    // "est-ce que le controller utilise bien le service + renvoie la bonne réponse ?"
    // pas est-ce que la formation est modifiée 
    describe('mettreAJourFormation', () => {
        test('doit retourner 200 et modifier la formation', async () => {
            // ce qui viendrait de la vraie requête HTTP
            // req.params.id = '1' psq on modifie par id
            // req.body = { diplome: 'Ingénierie', etablissement: 'ENSAT'} ce qu'on veut modifier
            req.params.id = '1'
            req.body = {
                diplome: 'ING',
                etablissement: 'ENSAT'
            };

            // mockData = formation modifiée, ce que le service est censé retourner 
            const mockData = {
                id_formation: '1',
                diplome: 'ING',
                etablissement: 'ENSAT'
            };

            mockModifierFormation.mockResolvedValue(mockData);

            await mettreAJourFormation(req, res);

            expect(mockModifierFormation).toHaveBeenCalledWith('1', req.body);
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
                erreur: expect.any(Error)
            });
        });

    });


    describe('supprimerFormation', () => {
        test('doit retourner 200 et supprimer la formation', async () => {

            mockSupprimerFormation.mockResolvedValue({ id_formation: '1' });

            req.params.id = '3';
            await supprimerFormation(req, res);

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
