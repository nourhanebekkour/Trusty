import { jest } from '@jest/globals';

// (1) Mock de Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockUpsert = jest.fn();
// define the mock before importing the module you want to test
// quand qlq importe prisma (import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient(); dans le service), donne lui les mock à la place
await jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        etudiant: {
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            upsert: mockUpsert,
        }
    }))
}));

// (2) Import dynamique du Service après le Mock
const { recupererTousLesProfils, recupererParId, ajouterOuModifierEtudiant } =
    await import('../../../src/Services/etudiantService.js');

// (3) Tests des services
describe('Service Profil Étudiant', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe('recupererTousLesProfils', () => {

        test('doit retourner la liste des étudiants', async () => {
            const mockEtudiants = [{ id_etudiant: '1', filiere: 'GINF' }];
            mockFindMany.mockResolvedValue(mockEtudiants);

            const result = await recupererTousLesProfils();

            expect(mockFindMany).toHaveBeenCalled();
            expect(result).toEqual(mockEtudiants);
        });

        // si Prisma lance une erreur → le service ne la gère pas 
        // → elle remonte vers le controller → le controller l'attrape dans son catch
        test('doit propager l\'erreur si Prisma échoue', async () => {
            mockFindMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererTousLesProfils()).rejects.toThrow('Erreur Prisma');
        });
    });


    describe('recupererParId', () => {

        test('doit retourner l\'étudiant par ID', async () => {
            const mockEtudiant = { id_etudiant: 'id-1', filiere: 'GINF' };
            mockFindUnique.mockResolvedValue(mockEtudiant);

            const result = await recupererParId('id-1');

            // matcher partiel pour ignorer le include
            expect(mockFindUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant: 'id-1' }
            }));
            expect(result).toEqual(mockEtudiant);
        });

        test('doit retourner null si étudiant non trouvé', async () => {
            // peu importe l'ID qu'on te passe, retourne toujours null
            mockFindUnique.mockResolvedValue(null);

            // Le service s'exécute, il appelle prisma.etudiant.findUnique() 
            // mais grâce au mock, au lieu d'aller en DB, il reçoit null directement
            const result = await recupererParId('id-inexistant');

            expect(result).toBeNull();
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            mockFindUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererParId('id-1')).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('ajouterOuModifierEtudiant', () => {
        // test : etudiant ajouté / modifié avec succès
        test('doit modifier / ajouter un étudiant ', async () => {
            // vérifier que le service retourne ce que Prisma lui donne
            const mockProfil = { id_etudiant: 'id-1', filiere: 'GINF' };
            mockUpsert.mockResolvedValue(mockProfil);

            const donnees = { filiere: 'GINF', ville: 'Tanger', pays: 'Maroc' };
            const result = await ajouterOuModifierEtudiant('id-1', donnees);

            expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant: 'id-1' }
            }));
            expect(result).toEqual(mockProfil);
        });

        test('doit propager l\'erreur', async () => {
            mockUpsert.mockRejectedValue(new Error('Erreur Prisma'));
            await expect(ajouterOuModifierEtudiant('id-1', {})).rejects.toThrow('Erreur Prisma');

        });

    })


});

