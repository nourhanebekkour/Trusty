import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';
import { mockMinio } from '../../mocks/minioMock.js';

await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma,
}));
await jest.unstable_mockModule('#Services/minio.service.js', () => mockMinio);

// import du service après les mock
const {
    ajouterOuModifierAdmin,
    recupererTousLesAdmins,
    recupererAdminParId,
    mettreAJourAvatar,
} = await import('#Modules/identite/administrateur/administrateur.service.js');

const { administrateur, utilisateur } = mockPrisma;

beforeEach(() => {
    jest.clearAllMocks();
});


// ajouterOuModifierAdmin(id, donnees)
describe('ajouterOuModifierAdmin', () => {

    test('crée ou met à jour l\'admin et retourne le profil', async () => {
        const mockAdmin = {
            id_administrateur: 'a1',
            niveau_acces: 'ADMIN',
            utilisateur: { nom: 'Alami', photo: null },
        };
        administrateur.upsert.mockResolvedValue(mockAdmin);

        const result = await ajouterOuModifierAdmin('a1', { niveau_acces: 'ADMIN' });

        expect(administrateur.upsert).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_administrateur: 'a1' } })
        );
        expect(result).toEqual(mockAdmin);
    });

    test('utilise "ADMIN" par défaut si niveau_acces absent', async () => {
        administrateur.upsert.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: null,
        });

        await ajouterOuModifierAdmin('a1', {});

        const call = administrateur.upsert.mock.calls[0][0];
        expect(call.create.niveau_acces).toBe('ADMIN');
    });

    test('appelle getFileUrl si l\'admin a une photo', async () => {
        administrateur.upsert.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: 'avatars/a1.jpg' },
        });
        mockMinio.getFileUrl.mockResolvedValue('http://minio/signed.jpg');

        const result = await ajouterOuModifierAdmin('a1', {});

        expect(mockMinio.getFileUrl).toHaveBeenCalledWith('avatars/a1.jpg');
        expect(result.utilisateur.photo_url).toBe('http://minio/signed.jpg');
    });

    test('n\'appelle pas getFileUrl si pas de photo', async () => {
        administrateur.upsert.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: null },
        });

        await ajouterOuModifierAdmin('a1', {});

        expect(mockMinio.getFileUrl).not.toHaveBeenCalled();
    });
});

// recupererAdminParId(id)

describe('recupererAdminParId', () => {

    test('retourne l\'admin avec photo_url si photo présente', async () => {
        administrateur.findUnique.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: 'avatars/a1.jpg' },
        });
        mockMinio.getFileUrl.mockResolvedValue('http://minio/signed.jpg');

        const result = await recupererAdminParId('a1');

        expect(administrateur.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_administrateur: 'a1' } })
        );
        expect(mockMinio.getFileUrl).toHaveBeenCalledWith('avatars/a1.jpg');
        expect(result.utilisateur.photo_url).toBe('http://minio/signed.jpg');
    });

    test('retourne l\'admin sans appeler getFileUrl si pas de photo', async () => {
        administrateur.findUnique.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: null },
        });

        const result = await recupererAdminParId('a1');

        expect(mockMinio.getFileUrl).not.toHaveBeenCalled();
        expect(result.id_administrateur).toBe('a1');
    });

    test('retourne null si admin non trouvé', async () => {
        administrateur.findUnique.mockResolvedValue(null);

        const result = await recupererAdminParId('id-inconnu');

        expect(result).toBeNull();
        expect(mockMinio.getFileUrl).not.toHaveBeenCalled();
    });
});

// recupererTousLesAdmins()
describe('recupererTousLesAdmins', () => {

    test('retourne tous les admins enrichis avec photo_url', async () => {
        administrateur.findMany.mockResolvedValue([
            { id_administrateur: 'a1', utilisateur: { photo: 'avatars/a1.jpg' } },
            { id_administrateur: 'a2', utilisateur: { photo: 'avatars/a2.jpg' } },
        ]);
        mockMinio.getFileUrl.mockResolvedValue('http://minio/signed.jpg');

        const result = await recupererTousLesAdmins();

        expect(administrateur.findMany).toHaveBeenCalledTimes(1);
        expect(mockMinio.getFileUrl).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
        expect(result[0].utilisateur.photo_url).toBe('http://minio/signed.jpg');
    });

    test('retourne un tableau vide si aucun admin', async () => {
        administrateur.findMany.mockResolvedValue([]);

        const result = await recupererTousLesAdmins();

        expect(result).toEqual([]);
        expect(mockMinio.getFileUrl).not.toHaveBeenCalled();
    });

    test('n\'appelle getFileUrl que pour les admins avec une photo', async () => {
        administrateur.findMany.mockResolvedValue([
            { id_administrateur: 'a1', utilisateur: { photo: 'avatars/a1.jpg' } },
            { id_administrateur: 'a2', utilisateur: { photo: null } },
        ]);
        mockMinio.getFileUrl.mockResolvedValue('http://minio/signed.jpg');

        await recupererTousLesAdmins();

        expect(mockMinio.getFileUrl).toHaveBeenCalledTimes(1);
        expect(mockMinio.getFileUrl).toHaveBeenCalledWith('avatars/a1.jpg');
    });
});

// mettreAJourAvatar(id, fichier, userId)
describe('mettreAJourAvatar', () => {

    test('lève une erreur si l\'admin n\'existe pas', async () => {
        administrateur.findUnique.mockResolvedValue(null);

        await expect(mettreAJourAvatar('id-inconnu', {}, 'u1'))
            .rejects.toThrow('Administrateur non trouvé');

        expect(mockMinio.uploadAndSaveFile).not.toHaveBeenCalled();
    });

    test('supprime l\'ancienne photo et uploade la nouvelle', async () => {
        administrateur.findUnique.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: 'avatars/ancienne.jpg' },
        });
        mockMinio.deleteFile.mockResolvedValue(undefined);
        mockMinio.uploadAndSaveFile.mockResolvedValue({
            url: 'http://minio/nouvelle.jpg',
            nom_stockage: 'avatars/nouvelle.jpg',
        });
        utilisateur.update.mockResolvedValue({});

        const result = await mettreAJourAvatar('a1', { buffer: 'data' }, 'u1');

        expect(mockMinio.deleteFile).toHaveBeenCalledWith('avatars/ancienne.jpg');
        expect(mockMinio.uploadAndSaveFile).toHaveBeenCalledWith({ buffer: 'data' }, 'u1', 'AVATAR');
        expect(utilisateur.update).toHaveBeenCalledWith({
            where: { id_utilisateur: 'a1' },
            data: { photo: 'avatars/nouvelle.jpg' },
        });
        expect(result).toEqual({
            url: 'http://minio/nouvelle.jpg',
            nom_stockage: 'avatars/nouvelle.jpg',
        });
    });

    test('continue l\'upload même si la suppression de l\'ancienne photo échoue', async () => {
        administrateur.findUnique.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: 'avatars/ancienne.jpg' },
        });
        // deleteFile plante , le service doit continuer quand même
        mockMinio.deleteFile.mockRejectedValue(new Error('MinIO indisponible'));
        mockMinio.uploadAndSaveFile.mockResolvedValue({
            url: 'http://minio/nouvelle.jpg',
            nom_stockage: 'avatars/nouvelle.jpg',
        });
        utilisateur.update.mockResolvedValue({});

        const result = await mettreAJourAvatar('a1', {}, 'u1');

        expect(mockMinio.uploadAndSaveFile).toHaveBeenCalled();
        expect(result.url).toBe('http://minio/nouvelle.jpg');
    });

    test('n\'appelle pas deleteFile si l\'admin n\'a pas de photo', async () => {
        administrateur.findUnique.mockResolvedValue({
            id_administrateur: 'a1',
            utilisateur: { photo: null },
        });
        mockMinio.uploadAndSaveFile.mockResolvedValue({
            url: 'http://minio/nouvelle.jpg',
            nom_stockage: 'avatars/nouvelle.jpg',
        });
        utilisateur.update.mockResolvedValue({});

        await mettreAJourAvatar('a1', {}, 'u1');

        expect(mockMinio.deleteFile).not.toHaveBeenCalled();
    });
});
