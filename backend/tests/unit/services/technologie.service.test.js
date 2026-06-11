import { jest } from '@jest/globals';

// technologie.service.js instancie son propre PrismaClient → on mock @prisma/client
const mockTechnologieModel = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockPrismaInstance = {
    technologie: mockTechnologieModel,
};

await jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance),
}));

const {
    recupererToutesLesTechnologies,
    recupererTechnologieParId,
    creerTechnologie,
    modifierTechnologie,
    supprimerTechnologie,
} = await import('#Modules/cursus/technologie/technologie.service.js');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('recupererToutesLesTechnologies', () => {

    test('retourne la liste des technologies', async () => {
        const mockData = [
            { id_technologie: 't1', nom: 'JavaScript' },
            { id_technologie: 't2', nom: 'Python' },
        ];
        mockTechnologieModel.findMany.mockResolvedValue(mockData);

        const result = await recupererToutesLesTechnologies();

        expect(mockTechnologieModel.findMany).toHaveBeenCalledWith({
            orderBy: { nom: 'asc' },
        });
        expect(result).toEqual(mockData);
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockTechnologieModel.findMany.mockRejectedValue(new Error('Erreur Prisma'));

        await expect(recupererToutesLesTechnologies()).rejects.toThrow('Erreur Prisma');
    });
});

describe('recupererTechnologieParId', () => {

    test('retourne la technologie trouvée', async () => {
        const mockData = { id_technologie: 't1', nom: 'JavaScript' };
        mockTechnologieModel.findUnique.mockResolvedValue(mockData);

        const result = await recupererTechnologieParId('t1');

        expect(mockTechnologieModel.findUnique).toHaveBeenCalledWith({
            where: { id_technologie: 't1' },
        });
        expect(result).toEqual(mockData);
    });

    test('retourne null si technologie non trouvée', async () => {
        mockTechnologieModel.findUnique.mockResolvedValue(null);

        const result = await recupererTechnologieParId('id-inexistant');

        expect(result).toBeNull();
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockTechnologieModel.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

        await expect(recupererTechnologieParId('t1')).rejects.toThrow('Erreur Prisma');
    });
});

describe('creerTechnologie', () => {

    test('crée et retourne la technologie', async () => {
        const donnees = {
            nom: 'React',
            categorie: 'Frontend',
            sous_categorie: 'Framework',
            description: 'Librairie UI',
            icone: 'react.svg',
        };
        const mockData = { id_technologie: 't3', ...donnees };
        mockTechnologieModel.create.mockResolvedValue(mockData);

        const result = await creerTechnologie(donnees);

        expect(mockTechnologieModel.create).toHaveBeenCalledWith({
            data: {
                nom: donnees.nom,
                categorie: donnees.categorie,
                sous_categorie: donnees.sous_categorie,
                description: donnees.description,
                icone: donnees.icone,
            },
        });
        expect(result).toEqual(mockData);
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockTechnologieModel.create.mockRejectedValue(new Error('Erreur Prisma'));

        await expect(creerTechnologie({ nom: 'X' })).rejects.toThrow('Erreur Prisma');
    });
});

describe('modifierTechnologie', () => {

    test('met à jour et retourne la technologie modifiée', async () => {
        const donnees = { nom: 'Vue.js', categorie: 'Frontend' };
        const mockData = { id_technologie: 't1', ...donnees };
        mockTechnologieModel.update.mockResolvedValue(mockData);

        const result = await modifierTechnologie('t1', donnees);

        expect(mockTechnologieModel.update).toHaveBeenCalledWith({
            where: { id_technologie: 't1' },
            data: donnees,
        });
        expect(result).toEqual(mockData);
    });

    test('propage l\'erreur si la technologie n\'existe pas (P2025)', async () => {
        const err = new Error('Record not found');
        err.code = 'P2025';
        mockTechnologieModel.update.mockRejectedValue(err);

        await expect(modifierTechnologie('id-inconnu', {})).rejects.toThrow('Record not found');
    });
});

describe('supprimerTechnologie', () => {

    test('supprime la technologie et retourne l\'enregistrement', async () => {
        const mockData = { id_technologie: 't1', nom: 'React' };
        mockTechnologieModel.delete.mockResolvedValue(mockData);

        const result = await supprimerTechnologie('t1');

        expect(mockTechnologieModel.delete).toHaveBeenCalledWith({
            where: { id_technologie: 't1' },
        });
        expect(result).toEqual(mockData);
    });

    test('propage l\'erreur si la technologie n\'existe pas', async () => {
        mockTechnologieModel.delete.mockRejectedValue(new Error('Erreur Prisma'));

        await expect(supprimerTechnologie('id-inconnu')).rejects.toThrow('Erreur Prisma');
    });
});
