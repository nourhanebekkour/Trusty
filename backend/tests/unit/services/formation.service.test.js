import { jest } from '@jest/globals'
import { mockPrisma } from '../../mocks/prismaMock.js'

// mock
const formation = mockPrisma.formation;

await jest.unstable_mockModule('../../../src/Config/prismaClient.js', () => ({
    default: mockPrisma
}));
//plus précis que remplacer le package officiel @prisma/client

// import après mock
const { recupererFormationsParEtudiant, recupererFormationParId, ajouterFormation, modifierFormation, supprimerFormation }
    = await import('../../../src/Services/formationService.js');

describe('Service Formation', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    // GET formations par étudiant
    describe('recupererFormationsParEtudiant', () => {
        test('doit retourner les formations d\'un étudiant', async () => {
            const mockData = [{
                id_formation: '1',
                id_etudiant: 'id-1',
            }];

            formation.findMany.mockResolvedValue(mockData);
            const result = await recupererFormationsParEtudiant('id-1');

            // Vérifier l'appel prismaa
            expect(formation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_etudiant: 'id-1' },
                    orderBy: { date_debut: 'desc' }
                })
            );

            // Vérifier le résultat
            expect(result).toEqual(mockData);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            formation.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererFormationsParEtudiant('id-1')).rejects.toThrow('Erreur Prisma');
        });
    });

    // GET formations par ID
    describe('recupererFormationParId', () => {
        test('doit retourner une formation', async () => {
            const mockData = { id_formation: '8' };
            formation.findUnique.mockResolvedValue(mockData);
            const result = await recupererFormationParId('8');

            expect(formation.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id_formation: '8' } })
            );

            expect(result).toEqual(mockData);
        });
        test('doit propager l\'erreur si Prisma échoue', async () => {
            formation.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererFormationParId('8')).rejects.toThrow('Erreur Prisma');
        });
    });

    // Ajouter Une Formation (CREATE)
    describe('ajouterFormation', () => {

        // doit ajouter une formation
        test('doit ajouter une formation', async () => {

            const mockFormation = { id_formation: '1' };
            formation.create.mockResolvedValue(mockFormation);

            const donnees = {
                diplome: 'Ingénierie',
                etablissement: 'ENSAT',
                mention: 'TB'
            }

            const result = await ajouterFormation('id-1', donnees);
            expect(formation.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    id_etudiant: 'id-1',
                    diplome: 'Ingénierie',
                    etablissement: 'ENSAT',
                    mention: 'TB',
                    est_actuelle: false
                })
            });
            expect(result).toEqual(mockFormation);
        });


        test('doit propager l\'erreur si Prisma échoue', async () => {
            formation.create.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(ajouterFormation('id-2', {})).rejects.toThrow('Erreur Prisma');
        });
    });


    // UPDATE
    describe('modifierFormation', () => {
        test('doit modifier la formation', async () => {
            const mockFormation = { id_formation: '1' };
            formation.update.mockResolvedValue(mockFormation);

            const donnees = {
                diplome: 'Médecine',
                etablissement: 'FMPT',
                mention: 'TB'
            }

            const result = await modifierFormation('1', donnees);
            expect(formation.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_formation: '1' },
                    data: expect.objectContaining({
                        ...donnees // spread operator 
                    })
                })
            );

            expect(result).toEqual(mockFormation);

        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            formation.update.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(modifierFormation('1', {})).rejects.toThrow('Erreur Prisma');
        });

    });


    // DELETE
    describe('supprimerFormation', () => {
        test('doit supprimer une formation', async () => {
            const mockFormation = { id_formation: '1' };
            formation.delete.mockResolvedValue(mockFormation);
            const result = await supprimerFormation('1');

            // vérifier appel Prisma
            expect(formation.delete).toHaveBeenCalledWith({
                where: { id_formation: '1' }
            });

            // vérifier retour
            expect(result).toEqual(mockFormation);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {

            formation.delete.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(
                supprimerFormation('1')
            ).rejects.toThrow('Erreur Prisma');
        });

    });
});