import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

const { etudiant } = mockPrisma;

// Mock Prisma
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma
}));

// Mock minioService — nécessaire pour enrichirProfil et mettreAJourAvatar
const mockGetFileUrl = jest.fn().mockResolvedValue('http://minio/photo.jpg');
const mockDeleteFile = jest.fn().mockResolvedValue(undefined);
const mockUploadAndSaveFile = jest.fn().mockResolvedValue({
    url: 'http://minio/photo.jpg',
    nom_stockage: 'photo.jpg'
});

await jest.unstable_mockModule('#Services/minio.service.js', () => ({
    getFileUrl: mockGetFileUrl,
    deleteFile: mockDeleteFile,
    uploadAndSaveFile: mockUploadAndSaveFile
}));

// Import dynamique du Service après les mocks
const { recupererTousLesProfils, recupererParId, ajouterOuModifierEtudiant, mettreAJourAvatar } =
    await import('#Modules/identite/etudiant/etudiant.service.js');

// (3) Tests des services
describe('Service Profil Étudiant', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe('recupererTousLesProfils', () => {

        test('doit retourner la liste des étudiants', async () => {
            const mockEtudiants = [{ id_etudiant: '1', filiere: 'GINF' }];
            etudiant.findMany.mockResolvedValue(mockEtudiants);

            const result = await recupererTousLesProfils();

            expect(etudiant.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockEtudiants);
        });

        // si Prisma lance une erreur → le service ne la gère pas 
        // → elle remonte vers le controller → le controller l'attrape dans son catch
        test('doit propager l\'erreur si Prisma échoue', async () => {
            etudiant.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererTousLesProfils()).rejects.toThrow('Erreur Prisma');
        });
    });


    describe('recupererParId', () => {

        test('doit retourner l\'étudiant par ID', async () => {
            const mockEtudiant = { id_etudiant: 'id-1', filiere: 'GINF' };
            etudiant.findUnique.mockResolvedValue(mockEtudiant);

            const result = await recupererParId('id-1');

            // matcher partiel pour ignorer le include
            expect(etudiant.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant: 'id-1' }
            }));
            expect(result).toEqual(mockEtudiant);
        });

        test('doit retourner null si étudiant non trouvé', async () => {
            // peu importe l'ID qu'on te passe, retourne toujours null
            etudiant.findUnique.mockResolvedValue(null);

            // Le service s'exécute, il appelle prisma.etudiant.findUnique() 
            // mais grâce au mock, au lieu d'aller en DB, il reçoit null directement
            const result = await recupererParId('id-inexistant');

            expect(result).toBeNull();
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            etudiant.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererParId('id-1')).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('ajouterOuModifierEtudiant', () => {
        test('doit modifier / ajouter un étudiant ', async () => {
            const mockProfil = { id_etudiant: 'id-1', filiere: 'GINF', utilisateur: { photo: null } };
            etudiant.upsert.mockResolvedValue(mockProfil);

            const donnees = { filiere: 'GINF', ville: 'Tanger', pays: 'Maroc' };
            const result = await ajouterOuModifierEtudiant('id-1', donnees);

            expect(etudiant.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant: 'id-1' }
            }));
            expect(result).toEqual(mockProfil);
        });

        test('doit propager l\'erreur', async () => {
            etudiant.upsert.mockRejectedValue(new Error('Erreur Prisma'));
            await expect(ajouterOuModifierEtudiant('id-1', {})).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('mettreAJourAvatar', () => {

        test('doit uploader la photo et retourner l\'URL', async () => {
            const mockEtudiant = { id_etudiant: 'id-1', utilisateur: { photo: null } };
            etudiant.findUnique.mockResolvedValue(mockEtudiant);
            mockUploadAndSaveFile.mockResolvedValue({ url: 'http://minio/photo.jpg', nom_stockage: 'photo.jpg' });
            mockPrisma.utilisateur.update.mockResolvedValue({});

            const fichier = { originalname: 'photo.jpg', buffer: Buffer.from('test') };
            const result = await mettreAJourAvatar('id-1', fichier, 'user-1');

            expect(mockUploadAndSaveFile).toHaveBeenCalledWith(fichier, 'user-1', 'AVATAR');
            expect(mockPrisma.utilisateur.update).toHaveBeenCalledWith({
                where: { id_utilisateur: 'id-1' },
                data: { photo: 'photo.jpg' }
            });
            expect(result.url).toBe('http://minio/photo.jpg');
        });

        test('doit supprimer l\'ancienne photo avant d\'uploader la nouvelle', async () => {
            const mockEtudiant = { id_etudiant: 'id-1', utilisateur: { photo: 'ancienne.jpg' } };
            etudiant.findUnique.mockResolvedValue(mockEtudiant);
            mockGetFileUrl.mockResolvedValue('http://minio/ancienne.jpg');
            mockDeleteFile.mockResolvedValue(undefined);
            mockUploadAndSaveFile.mockResolvedValue({ url: 'http://minio/photo.jpg', nom_stockage: 'photo.jpg' });
            mockPrisma.utilisateur.update.mockResolvedValue({});

            await mettreAJourAvatar('id-1', { originalname: 'photo.jpg' }, 'user-1');

            expect(mockDeleteFile).toHaveBeenCalledWith('ancienne.jpg');
        });

        test('doit lever une erreur si étudiant non trouvé', async () => {
            etudiant.findUnique.mockResolvedValue(null);

            await expect(mettreAJourAvatar('id-inexistant', {}, 'user-1'))
                .rejects.toThrow('Étudiant non trouvé');

            expect(mockUploadAndSaveFile).not.toHaveBeenCalled();
        });

        test('doit propager l\'erreur si l\'upload échoue', async () => {
            const mockEtudiant = { id_etudiant: 'id-1', utilisateur: { photo: null } };
            etudiant.findUnique.mockResolvedValue(mockEtudiant);
            mockUploadAndSaveFile.mockRejectedValue(new Error('Erreur MinIO'));

            await expect(mettreAJourAvatar('id-1', {}, 'user-1')).rejects.toThrow('Erreur MinIO');
        });
    });

});
