import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

const { utilisateur } = mockPrisma;

// Mock Prisma
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma
}));

// Import dynamique du Service après les mocks
const {
    recupererTousLesUtilisateurs,
    recupererUtilisateurParId,
    modifierRole,
    modifierStatut,
    supprimerUtilisateur
} = await import('#Modules/identite/utilisateur/utilisateur.service.js');


describe('Service Utilisateur', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('recupererTousLesUtilisateurs', () => {

        test('doit retourner la liste de tous les utilisateurs', async () => {
            const mockUtilisateurs = [
                { id_utilisateur: 'u-1', email: 'alice@test.com', role: 'ETUDIANT' },
                { id_utilisateur: 'u-2', email: 'bob@test.com', role: 'PROFESSEUR' }
            ];
            utilisateur.findMany.mockResolvedValue(mockUtilisateurs);

            const result = await recupererTousLesUtilisateurs();

            expect(utilisateur.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockUtilisateurs);
        });

        // si Prisma lance une erreur → le service ne la gère pas
        // → elle remonte vers le controller → le controller l'attrape dans son catch
        test('doit propager l\'erreur si Prisma échoue', async () => {
            utilisateur.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererTousLesUtilisateurs()).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('recupererUtilisateurParId', () => {

        test('doit retourner l\'utilisateur avec ses profils liés', async () => {
            const mockUtilisateur = {
                id_utilisateur: 'u-1',
                email: 'alice@test.com',
                role: 'ETUDIANT',
                etudiant: { filiere: 'GINF' },
                professeur: null,
                administrateur: null,
                professionnel: null
            };
            utilisateur.findUnique.mockResolvedValue(mockUtilisateur);

            const result = await recupererUtilisateurParId('u-1');

            // matcher partiel pour ignorer le include
            expect(utilisateur.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_utilisateur: 'u-1' }
            }));
            expect(result).toEqual(mockUtilisateur);
        });

        test('doit retourner null si utilisateur non trouvé', async () => {
            // peu importe l'ID qu'on te passe, retourne toujours null
            utilisateur.findUnique.mockResolvedValue(null);

            // Le service s'exécute, il appelle prisma.utilisateur.findUnique()
            // mais grâce au mock, au lieu d'aller en DB, il reçoit null directement
            const result = await recupererUtilisateurParId('id-inexistant');

            expect(result).toBeNull();
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            utilisateur.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererUtilisateurParId('u-1')).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('modifierRole', () => {

        test('doit mettre à jour le rôle et retourner l\'utilisateur modifié', async () => {
            const mockResult = { id_utilisateur: 'u-1', email: 'alice@test.com', role: 'PROFESSEUR' };
            utilisateur.update.mockResolvedValue(mockResult);

            const result = await modifierRole('u-1', 'PROFESSEUR');

            expect(utilisateur.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_utilisateur: 'u-1' },
                data: { role: 'PROFESSEUR' }
            }));
            expect(result).toEqual(mockResult);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            utilisateur.update.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(modifierRole('u-1', 'PROFESSEUR')).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('modifierStatut', () => {

        test('doit mettre à jour le statut et retourner l\'utilisateur modifié', async () => {
            const mockResult = { id_utilisateur: 'u-1', email: 'alice@test.com', status_compte: 'SUSPENDU' };
            utilisateur.update.mockResolvedValue(mockResult);

            const result = await modifierStatut('u-1', 'SUSPENDU');

            expect(utilisateur.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_utilisateur: 'u-1' },
                data: { status_compte: 'SUSPENDU' }
            }));
            expect(result).toEqual(mockResult);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            utilisateur.update.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(modifierStatut('u-1', 'SUSPENDU')).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('supprimerUtilisateur', () => {

        test('doit supprimer l\'utilisateur et retourner les données supprimées', async () => {
            const mockResult = { id_utilisateur: 'u-1', email: 'alice@test.com' };
            utilisateur.delete.mockResolvedValue(mockResult);

            const result = await supprimerUtilisateur('u-1');

            expect(utilisateur.delete).toHaveBeenCalledWith({
                where: { id_utilisateur: 'u-1' }
            });
            expect(result).toEqual(mockResult);
        });

        test('doit propager l\'erreur si l\'utilisateur n\'existe pas', async () => {
            utilisateur.delete.mockRejectedValue(new Error('Record to delete does not exist'));

            await expect(supprimerUtilisateur('id-inexistant')).rejects.toThrow('Record to delete does not exist');
        });

    });

});
