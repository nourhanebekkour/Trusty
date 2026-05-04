import { jest } from '@jest/globals'
import { mockPrisma } from '../../mocks/prismaMock'

// mock services
const competence = mockPrisma.competence;
const etudiantCompetence = mockPrisma.etudiantCompetence;
await jest.unstable_mockModule('../../../src/Config/prismaClient.js', () => ({
    default: mockPrisma
}));

const { recupererToutesLesCompetences, recupererCompetenceParId, creerCompetence, modifierCompetence, supprimerCompetence, lierCompetenceAEtudiant, retirerCompetenceEtudiant, recupererCompetencesEtudiant }
    = await import('../../../src/Services/competenceService.js');

describe('Service Competence', () => {
    beforeEach(() => { jest.clearAllMocks(); }); // remet tous les mocks à zéro avant chaque test


    // --- TEST SERVICES CATALOGUE ---

    describe('recupererToutesLesCompetences', () => {

        test('doit retourner la liste des compétences', async () => {

            const mockData = [{ id_competence: '1' }];
            competence.findMany.mockResolvedValue(mockData);

            const result = await recupererToutesLesCompetences();
            expect(competence.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            competence.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererToutesLesCompetences()).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('recupererCompetenceParId', () => {

        test('doit retourner une compétence par ID', async () => {
            const mockData = { id_competence: '7' }; // findUnique retourne un seul objet
            competence.findUnique.mockResolvedValue(mockData);

            const result = await recupererCompetenceParId('7');

            expect(competence.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_competence: '7' }
                })
            );

            expect(result).toEqual(mockData);
        });

        test('doit retourner null si compétence non trouvée', async () => {
            competence.findUnique.mockResolvedValue(null);

            const result = await recupererCompetenceParId('id-inexistant');
            expect(result).toBeNull();

        });

        test('doit propager l\'erreur si Prisma échoue', async () => {

            competence.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererCompetenceParId('7')).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('creerCompetence', () => {
        test('doit créer une compétence', async () => {
            const mockData = { id_competence: '1' };
            competence.create.mockResolvedValue(mockData);

            const donnees = {
                nom: 'Docker',
                type: 'TECHNIQUE',
                categorie: 'DevOps'
            };

            const result = await creerCompetence(donnees);

            expect(competence.create).toHaveBeenCalledWith(
                { data: expect.objectContaining({ ...donnees }) }
            );
            expect(result).toEqual(mockData);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            competence.create.mockRejectedValue(new Error('Erreur Prisma'));
            await expect(creerCompetence({})).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('modifierCompetence', () => {
        test('doit modifier la compétence', async () => {
            const mockData = { id_competence: '2' };
            competence.update.mockResolvedValue(mockData);

            const donnees = {
                nom: 'Travail en équipe',
                type: 'COMPORTEMENTALE',
                categorie: 'Soft Skills'
            };

            const result = await modifierCompetence('2', donnees);

            expect(competence.update).toHaveBeenCalledWith({
                where: { id_competence: '2' },
                data: expect.objectContaining({
                    ...donnees
                })
            });

            expect(result).toEqual(mockData);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            competence.update.mockRejectedValue(new Error('Erreur Prisma'));
            await expect(modifierCompetence('1', {})).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('supprimerCompetence', () => {
        test('doit supprimer la compétence', async () => {

            const mockData = { id_competence: '1' };
            competence.delete.mockResolvedValue(mockData);
            const result = await supprimerCompetence('1');
            expect(competence.delete).toHaveBeenCalledWith({
                where: { id_competence: '1' }
            });
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {

            competence.delete.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(
                supprimerCompetence('1')
            ).rejects.toThrow('Erreur Prisma');
        });
    });


    // --- TEST SERVICES ÉTUDIANT ---

    describe('lierCompetenceAEtudiant', () => {

        test('doit lier une compétence à un étudiant', async () => {
            const mockData = { id_etudiant: 'e1', id_competence: 'c1', niveau_maitrise: 3 };
            etudiantCompetence.upsert.mockResolvedValue(mockData);

            const result = await lierCompetenceAEtudiant('e1', 'c1', 3);

            expect(etudiantCompetence.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant_id_competence: { id_etudiant: 'e1', id_competence: 'c1' } }
            }));
            expect(result).toEqual(mockData);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {

            etudiantCompetence.upsert.mockRejectedValue(new Error('Erreur Prisma'));
            await expect(lierCompetenceAEtudiant('e1', 'c1', 3)).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('recupererCompetencesEtudiant', () => {

        test('doit retourner les compétences d\'un étudiant', async () => {

            const mockData = [{ id_etudiant: 'e1', id_competence: 'c1' }];
            etudiantCompetence.findMany.mockResolvedValue(mockData);

            const result = await recupererCompetencesEtudiant('e1');

            expect(etudiantCompetence.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant: 'e1' }
            }));
            expect(result).toEqual(mockData);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {

            etudiantCompetence.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererCompetencesEtudiant('e1')).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('retirerCompetenceEtudiant', () => {
        test('doit retirer une compétence d\'un étudiant', async () => {

            etudiantCompetence.delete.mockResolvedValue(null);
            await retirerCompetenceEtudiant('e1', 'c1');

            expect(etudiantCompetence.delete).toHaveBeenCalledWith({
                where: { id_etudiant_id_competence: { id_etudiant: 'e1', id_competence: 'c1' } }
            });
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            etudiantCompetence.delete.mockRejectedValue(new Error('Erreur Prisma'));
            await expect(retirerCompetenceEtudiant('e1', 'c1')).rejects.toThrow('Erreur Prisma');
        });
    });

});


// Prisma ( Prisma .delete() retourne l'objet supprimé )