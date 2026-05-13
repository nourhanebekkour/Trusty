import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

const { professeur, utilisateur } = mockPrisma;

// Mock Prisma
await jest.unstable_mockModule('../../../src/Config/prismaClient.js', () => ({
    default: mockPrisma
}));

// Mock minioService
const mockGetFileUrl = jest.fn().mockResolvedValue('http://minio/photo.jpg');
const mockDeleteFile = jest.fn().mockResolvedValue(undefined);
const mockUploadAndSaveFile = jest.fn().mockResolvedValue({
    url: 'http://minio/photo.jpg',
    nom_stockage: 'photo.jpg'
});

await jest.unstable_mockModule('../../../src/Utils/minioService.js', () => ({
    getFileUrl: mockGetFileUrl,
    deleteFile: mockDeleteFile,
    uploadAndSaveFile: mockUploadAndSaveFile
}));

// Import dynamique du service après les mocks
const {
    ajouterOuModifierProfesseur,
    recupererTousLesProfesseurs,
    recupererProfesseurParId,
    recupererProfesseursParFiliere,
    mettreAJourAvatar
} = await import('../../../src/Services/professeurService.js');


describe('Service Professeur', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ajouterOuModifierProfesseur', () => {

        test('doit créer ou mettre à jour un profil professeur', async () => {
            const mockProf = { id_professeur: 'prof-1', departement: 'SIC', utilisateur: { photo: null } };
            professeur.upsert.mockResolvedValue(mockProf);

            const donnees = { departement: 'SIC', specialite: 'Informatique' };
            const result = await ajouterOuModifierProfesseur('prof-1', donnees);

            expect(professeur.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_professeur: 'prof-1' }
            }));
            expect(result).toEqual(mockProf);
        });

        test('doit enrichir avec photo_url si photo existe', async () => {
            const mockProf = { id_professeur: 'prof-1', utilisateur: { photo: 'photo.jpg' } };
            professeur.upsert.mockResolvedValue(mockProf);
            mockGetFileUrl.mockResolvedValue('http://minio/photo.jpg');

            const result = await ajouterOuModifierProfesseur('prof-1', {});

            expect(mockGetFileUrl).toHaveBeenCalledWith('photo.jpg');
            expect(result.utilisateur.photo_url).toBe('http://minio/photo.jpg');
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            professeur.upsert.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(ajouterOuModifierProfesseur('prof-1', {})).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('recupererTousLesProfesseurs', () => {

        test('doit retourner la liste de tous les professeurs', async () => {
            const mockData = [
                { id_professeur: 'prof-1', utilisateur: { photo: null } },
                { id_professeur: 'prof-2', utilisateur: { photo: null } }
            ];
            professeur.findMany.mockResolvedValue(mockData);

            const result = await recupererTousLesProfesseurs();

            expect(professeur.findMany).toHaveBeenCalled();
            expect(result).toHaveLength(2);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            professeur.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererTousLesProfesseurs()).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('recupererProfesseurParId', () => {

        test('doit retourner le professeur par ID', async () => {
            const mockProf = { id_professeur: 'prof-1', utilisateur: { photo: null } };
            professeur.findUnique.mockResolvedValue(mockProf);

            const result = await recupererProfesseurParId('prof-1');

            expect(professeur.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_professeur: 'prof-1' }
            }));
            expect(result).toEqual(mockProf);
        });

        test('doit retourner null si professeur non trouvé', async () => {
            professeur.findUnique.mockResolvedValue(null);

            const result = await recupererProfesseurParId('id-inexistant');

            expect(result).toBeNull();
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            professeur.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererProfesseurParId('prof-1')).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('recupererProfesseursParFiliere', () => {

        test('doit retourner les professeurs de la filière', async () => {
            const mockData = [{ id_professeur: 'prof-1', utilisateur: { photo: null } }];
            professeur.findMany.mockResolvedValue(mockData);

            const result = await recupererProfesseursParFiliere('GINF');

            expect(professeur.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { filieres_interv: { has: 'GINF' } }
            }));
            expect(result).toHaveLength(1);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            professeur.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererProfesseursParFiliere('GINF')).rejects.toThrow('Erreur Prisma');
        });
    });

    describe('mettreAJourAvatar', () => {

        test('doit uploader la photo et retourner l\'URL', async () => {
            const mockProf = { id_professeur: 'prof-1', utilisateur: { photo: null } };
            professeur.findUnique.mockResolvedValue(mockProf);
            utilisateur.update.mockResolvedValue({});
            mockUploadAndSaveFile.mockResolvedValue({ url: 'http://minio/photo.jpg', nom_stockage: 'photo.jpg' });

            const fichier = { originalname: 'photo.jpg', buffer: Buffer.from('test') };
            const result = await mettreAJourAvatar('prof-1', fichier, 'user-1');

            expect(mockUploadAndSaveFile).toHaveBeenCalledWith(fichier, 'user-1', 'AVATAR');
            expect(utilisateur.update).toHaveBeenCalled();
            expect(result.url).toBe('http://minio/photo.jpg');
        });

        test('doit supprimer l\'ancienne photo si elle existe', async () => {
            const mockProf = { id_professeur: 'prof-1', utilisateur: { photo: 'ancienne.jpg' } };
            professeur.findUnique.mockResolvedValue(mockProf);
            utilisateur.update.mockResolvedValue({});
            mockUploadAndSaveFile.mockResolvedValue({ url: 'http://minio/photo.jpg', nom_stockage: 'photo.jpg' });

            await mettreAJourAvatar('prof-1', { originalname: 'photo.jpg' }, 'user-1');

            expect(mockDeleteFile).toHaveBeenCalledWith('ancienne.jpg');
        });

        test('doit lever une erreur si professeur non trouvé', async () => {
            professeur.findUnique.mockResolvedValue(null);

            await expect(mettreAJourAvatar('id-inexistant', {}, 'user-1'))
                .rejects.toThrow('Professeur non trouvé');
        });

        test('doit propager l\'erreur si upload échoue', async () => {
            const mockProf = { id_professeur: 'prof-1', utilisateur: { photo: null } };
            professeur.findUnique.mockResolvedValue(mockProf);
            mockUploadAndSaveFile.mockRejectedValue(new Error('Erreur MinIO'));

            await expect(mettreAJourAvatar('prof-1', {}, 'user-1')).rejects.toThrow('Erreur MinIO');
        });
    });
});