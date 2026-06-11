import { jest } from '@jest/globals';

// mocks des fonctions du service
const mockRecupererToutesLesTechnologies = jest.fn();
const mockRecupererTechnologieParId = jest.fn();
const mockCreerTechnologie = jest.fn();
const mockModifierTechnologie = jest.fn();
const mockSupprimerTechnologie = jest.fn();

await jest.unstable_mockModule('#Modules/cursus/technologie/technologie.service.js', () => ({
    recupererToutesLesTechnologies: mockRecupererToutesLesTechnologies,
    recupererTechnologieParId: mockRecupererTechnologieParId,
    creerTechnologie: mockCreerTechnologie,
    modifierTechnologie: mockModifierTechnologie,
    supprimerTechnologie: mockSupprimerTechnologie,
}));

const {
    listerTechnologies,
    obtenirTechnologie,
    ajouterTechnologie,
    modifierTechnologie,
    supprimerTechnologie,
} = await import('#Modules/cursus/technologie/technologie.controller.js');

let req, res;

beforeEach(() => {
    req = {
        params: {},
        body: {},
        user: { id: 'u1', role: 'ADMINISTRATEUR' },
    };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    jest.clearAllMocks();
});

describe('listerTechnologies', () => {

    test('retourne 200 avec la liste des technologies', async () => {
        const mockData = [
            { id_technologie: 't1', nom: 'JavaScript' },
            { id_technologie: 't2', nom: 'Python' },
        ];
        mockRecupererToutesLesTechnologies.mockResolvedValue(mockData);

        await listerTechnologies(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Technologies récupérées avec succès',
            data: mockData,
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        mockRecupererToutesLesTechnologies.mockRejectedValue(new Error('Erreur BDD'));

        await listerTechnologies(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur lors de la récupération des technologies',
        }));
    });
});

describe('obtenirTechnologie', () => {

    test('retourne 200 avec la technologie si trouvée', async () => {
        req.params.id = 't1';
        const mockData = { id_technologie: 't1', nom: 'JavaScript' };
        mockRecupererTechnologieParId.mockResolvedValue(mockData);

        await obtenirTechnologie(req, res);

        expect(mockRecupererTechnologieParId).toHaveBeenCalledWith('t1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: mockData,
        }));
    });

    test('retourne 404 si la technologie n\'existe pas', async () => {
        req.params.id = 'id-inconnu';
        mockRecupererTechnologieParId.mockResolvedValue(null);

        await obtenirTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Technologie non trouvée',
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        req.params.id = 't1';
        mockRecupererTechnologieParId.mockRejectedValue(new Error('Erreur BDD'));

        await obtenirTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});

describe('ajouterTechnologie', () => {

    test('retourne 201 avec la technologie créée', async () => {
        req.body = { nom: 'React', categorie: 'Frontend' };
        const mockData = { id_technologie: 't3', ...req.body };
        mockCreerTechnologie.mockResolvedValue(mockData);

        await ajouterTechnologie(req, res);

        expect(mockCreerTechnologie).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Technologie créée avec succès',
            data: mockData,
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        mockCreerTechnologie.mockRejectedValue(new Error('Données invalides'));

        await ajouterTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur lors de la création de la technologie',
        }));
    });
});

describe('modifierTechnologie', () => {

    test('retourne 200 avec la technologie modifiée', async () => {
        req.params.id = 't1';
        req.body = { nom: 'Vue.js' };
        const mockData = { id_technologie: 't1', nom: 'Vue.js' };
        mockModifierTechnologie.mockResolvedValue(mockData);

        await modifierTechnologie(req, res);

        expect(mockModifierTechnologie).toHaveBeenCalledWith('t1', req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Technologie modifiée avec succès',
            data: mockData,
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.params.id = 'id-inconnu';
        mockModifierTechnologie.mockRejectedValue(new Error('Non trouvé'));

        await modifierTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur lors de la modification de la technologie',
        }));
    });
});

describe('supprimerTechnologie', () => {

    test('retourne 200 après suppression réussie', async () => {
        req.params.id = 't1';
        mockSupprimerTechnologie.mockResolvedValue({ id_technologie: 't1' });

        await supprimerTechnologie(req, res);

        expect(mockSupprimerTechnologie).toHaveBeenCalledWith('t1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Technologie supprimée avec succès',
        }));
    });

    test('retourne 400 si le service lève une erreur', async () => {
        req.params.id = 'id-inconnu';
        mockSupprimerTechnologie.mockRejectedValue(new Error('Non trouvé'));

        await supprimerTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur lors de la suppression de la technologie',
        }));
    });
});
