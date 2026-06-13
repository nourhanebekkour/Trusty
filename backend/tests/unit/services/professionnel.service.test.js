import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

const { professionnel } = mockPrisma;

// Mock Prisma
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma
}));

// Import dynamique du Service après les mocks
const { professionnelEnAttente, validateProfessionnel } =
    await import('#Modules/identite/professionnel/professionnel.service.js');


describe('Service Professionnel', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('professionnelEnAttente', () => {

        test('doit retourner la liste des professionnels en attente', async () => {
            const mockProfessionnels = [
                { id_professionnel: 'p-1', status_validation: 'EN_ATTENTE', utilisateur: { nom: 'Alami' } },
                { id_professionnel: 'p-2', status_validation: 'EN_ATTENTE', utilisateur: { nom: 'Benali' } }
            ];
            professionnel.findMany.mockResolvedValue(mockProfessionnels);

            const result = await professionnelEnAttente();

            // Le service filtre sur EN_ATTENTE et trie par date_demande
            expect(professionnel.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { status_validation: 'EN_ATTENTE' }
            }));
            expect(result).toEqual(mockProfessionnels);
        });

        test('doit retourner une liste vide si aucun professionnel en attente', async () => {
            professionnel.findMany.mockResolvedValue([]);

            const result = await professionnelEnAttente();

            expect(result).toEqual([]);
        });

        // si Prisma lance une erreur → le service ne la gère pas
        // → elle remonte vers le controller → le controller l'attrape dans son catch
        test('doit propager l\'erreur si Prisma échoue', async () => {
            professionnel.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(professionnelEnAttente()).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('validateProfessionnel', () => {

        test('doit mettre à jour le status_validation à VALIDE', async () => {
            const mockResult = {
                id_professionnel: 'p-1',
                status_validation: 'VALIDE',
                utilisateur: { nom: 'Alami' }
            };
            professionnel.update.mockResolvedValue(mockResult);

            const result = await validateProfessionnel('p-1', 'VALIDE');

            // matcher partiel pour ignorer le include
            expect(professionnel.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_professionnel: 'p-1' },
                data: { status_validation: 'VALIDE' }
            }));
            expect(result).toEqual(mockResult);
        });

        test('doit mettre à jour le status_validation à REJETE', async () => {
            const mockResult = {
                id_professionnel: 'p-2',
                status_validation: 'REJETE',
                utilisateur: { nom: 'Benali' }
            };
            professionnel.update.mockResolvedValue(mockResult);

            const result = await validateProfessionnel('p-2', 'REJETE');

            expect(professionnel.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_professionnel: 'p-2' },
                data: { status_validation: 'REJETE' }
            }));
            expect(result).toEqual(mockResult);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            professionnel.update.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(validateProfessionnel('p-1', 'VALIDE')).rejects.toThrow('Erreur Prisma');
        });

    });

});
