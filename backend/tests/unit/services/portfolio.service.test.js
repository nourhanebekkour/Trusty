import { jest } from '@jest/globals';

// --- Mocks Prisma ---
const mockPortfolioModel = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
const mockModelePortfolioModel = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
};
const mockEtudiantModel = {
    findUnique: jest.fn(),
};

const mockPrismaInstance = {
    portfolio: mockPortfolioModel,
    modelePortfolio: mockModelePortfolioModel,
    etudiant: mockEtudiantModel,
};

await jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance),
}));

// --- Mock MinIO ---
const mockDeleteFile = jest.fn().mockResolvedValue(undefined);
const mockUploadAndSaveFile = jest.fn();

await jest.unstable_mockModule('#Services/minio.service.js', () => ({
    deleteFile: mockDeleteFile,
    uploadAndSaveFile: mockUploadAndSaveFile,
}));

// Import après les mocks
const {
    getPortfolioById,
    getPortfolioByUrl,
    incrementPortfolioViews,
    getActiveTemplates,
    uploadApercuModele,
    getMyPortfolios,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    getPortfolioStats,
    deletePortfolio,
} = await import('#Modules/portfolio/portfolio.service.js');

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('getPortfolioById', () => {

    test('retourne le portfolio trouvé', async () => {
        const mock = { id_portfolio: 'p-1', titre_personnalise: 'Mon Portfolio' };
        mockPortfolioModel.findUnique.mockResolvedValue(mock);

        const result = await getPortfolioById('p-1');

        expect(mockPortfolioModel.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_portfolio: 'p-1' } })
        );
        expect(result).toEqual(mock);
    });

    test('retourne null si portfolio non trouvé', async () => {
        mockPortfolioModel.findUnique.mockResolvedValue(null);
        expect(await getPortfolioById('p-x')).toBeNull();
    });
});

// ─────────────────────────────────────────────────
describe('getPortfolioByUrl', () => {

    test('retourne le portfolio par URL', async () => {
        const mock = { id_portfolio: 'p-1', url_publique: 'jean-dupont-portfolio' };
        mockPortfolioModel.findUnique.mockResolvedValue(mock);

        const result = await getPortfolioByUrl('jean-dupont-portfolio');

        expect(mockPortfolioModel.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { url_publique: 'jean-dupont-portfolio' } })
        );
        expect(result).toEqual(mock);
    });

    test('retourne null si URL non trouvée', async () => {
        mockPortfolioModel.findUnique.mockResolvedValue(null);
        expect(await getPortfolioByUrl('inexistant')).toBeNull();
    });
});

// ─────────────────────────────────────────────────
describe('incrementPortfolioViews', () => {

    test('incrémente les vues et retourne le portfolio mis à jour', async () => {
        const mock = { id_portfolio: 'p-1', nombre_vues: 11 };
        mockPortfolioModel.update.mockResolvedValue(mock);

        const result = await incrementPortfolioViews('p-1');

        expect(mockPortfolioModel.update).toHaveBeenCalledWith({
            where: { id_portfolio: 'p-1' },
            data: { nombre_vues: { increment: 1 } }
        });
        expect(result.nombre_vues).toBe(11);
    });
});

// ─────────────────────────────────────────────────
describe('getActiveTemplates', () => {

    test('retourne les modèles actifs', async () => {
        const mock = [{ id_modele: 'm-1', nom: 'Classique', est_actif: true }];
        mockModelePortfolioModel.findMany.mockResolvedValue(mock);

        const result = await getActiveTemplates();

        expect(mockModelePortfolioModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { est_actif: true } })
        );
        expect(result).toEqual(mock);
    });
});

// ─────────────────────────────────────────────────
describe('uploadApercuModele', () => {

    test('retourne null si le modèle n\'existe pas', async () => {
        mockModelePortfolioModel.findUnique.mockResolvedValue(null);

        const result = await uploadApercuModele('m-x', {}, 'admin-1');

        expect(result).toBeNull();
        expect(mockUploadAndSaveFile).not.toHaveBeenCalled();
    });

    test('upload l\'aperçu sans ancien aperçu', async () => {
        mockModelePortfolioModel.findUnique.mockResolvedValue({ id_modele: 'm-1', id_apercu: null });
        mockUploadAndSaveFile.mockResolvedValue({ id_fichier: 'f-new' });
        mockModelePortfolioModel.update.mockResolvedValue({ id_modele: 'm-1', id_apercu: 'f-new' });

        const result = await uploadApercuModele('m-1', { originalname: 'img.png' }, 'admin-1');

        expect(mockDeleteFile).not.toHaveBeenCalled();
        expect(mockUploadAndSaveFile).toHaveBeenCalledWith({ originalname: 'img.png' }, 'admin-1', 'PUBLIC');
        expect(result.id_apercu).toBe('f-new');
    });

    test('supprime l\'ancien aperçu avant d\'uploader le nouveau', async () => {
        mockModelePortfolioModel.findUnique.mockResolvedValue({ id_modele: 'm-1', id_apercu: 'f-old' });
        mockUploadAndSaveFile.mockResolvedValue({ id_fichier: 'f-new' });
        mockModelePortfolioModel.update.mockResolvedValue({ id_modele: 'm-1', id_apercu: 'f-new' });

        await uploadApercuModele('m-1', { originalname: 'img.png' }, 'admin-1');

        expect(mockDeleteFile).toHaveBeenCalledWith('f-old');
        expect(mockUploadAndSaveFile).toHaveBeenCalledTimes(1);
    });

    test('continue l\'upload même si la suppression de l\'ancien aperçu échoue', async () => {
        mockModelePortfolioModel.findUnique.mockResolvedValue({ id_modele: 'm-1', id_apercu: 'f-old' });
        mockDeleteFile.mockRejectedValue(new Error('MinIO error'));
        mockUploadAndSaveFile.mockResolvedValue({ id_fichier: 'f-new' });
        mockModelePortfolioModel.update.mockResolvedValue({ id_modele: 'm-1', id_apercu: 'f-new' });

        const result = await uploadApercuModele('m-1', { originalname: 'img.png' }, 'admin-1');

        expect(mockUploadAndSaveFile).toHaveBeenCalledTimes(1);
        expect(result.id_apercu).toBe('f-new');
    });
});

// ─────────────────────────────────────────────────
describe('getMyPortfolios', () => {

    test('retourne les portfolios de l\'étudiant', async () => {
        const mock = [{ id_portfolio: 'p-1' }, { id_portfolio: 'p-2' }];
        mockPortfolioModel.findMany.mockResolvedValue(mock);

        const result = await getMyPortfolios('etu-1');

        expect(mockPortfolioModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_etudiant: 'etu-1' } })
        );
        expect(result).toHaveLength(2);
    });
});

// ─────────────────────────────────────────────────
describe('createPortfolio', () => {

    test('crée un portfolio avec url_publique fournie', async () => {
        const mock = { id_portfolio: 'p-new', url_publique: 'mon-portfolio' };
        mockPortfolioModel.create.mockResolvedValue(mock);

        const result = await createPortfolio('etu-1', {
            titre_personnalise: 'Mon Portfolio',
            url_publique: 'mon-portfolio',
            est_publie: false,
        });

        expect(mockPortfolioModel.create).toHaveBeenCalledTimes(1);
        expect(result.url_publique).toBe('mon-portfolio');
    });

    test('génère une URL automatique si url_publique absente', async () => {
        mockEtudiantModel.findUnique.mockResolvedValue({
            utilisateur: { nom: 'Dupont', prenom: 'Jean' }
        });
        mockPortfolioModel.findUnique.mockResolvedValue(null); // URL disponible
        mockPortfolioModel.create.mockResolvedValue({ id_portfolio: 'p-new', url_publique: 'jean-dupont-portfolio' });

        await createPortfolio('etu-1', { titre_personnalise: 'Portfolio' });

        expect(mockEtudiantModel.findUnique).toHaveBeenCalledTimes(1);
        expect(mockPortfolioModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ url_publique: 'jean-dupont-portfolio' })
            })
        );
    });

    test('incrémente le counter si l\'URL générée est déjà prise', async () => {
        mockEtudiantModel.findUnique.mockResolvedValue({
            utilisateur: { nom: 'Dupont', prenom: 'Jean' }
        });
        // Premier findUnique retourne un résultat (URL prise), second retourne null (disponible)
        mockPortfolioModel.findUnique
            .mockResolvedValueOnce({ id_portfolio: 'p-exist' })
            .mockResolvedValueOnce(null);
        mockPortfolioModel.create.mockResolvedValue({ id_portfolio: 'p-new', url_publique: 'jean-dupont-portfolio-1' });

        await createPortfolio('etu-1', { titre_personnalise: 'Portfolio' });

        expect(mockPortfolioModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ url_publique: 'jean-dupont-portfolio-1' })
            })
        );
    });

    test('lève une erreur si l\'étudiant est introuvable', async () => {
        mockEtudiantModel.findUnique.mockResolvedValue(null);

        await expect(createPortfolio('etu-x', { titre_personnalise: 'X' }))
            .rejects.toThrow('Étudiant introuvable');
    });

    test('met est_publie à false par défaut', async () => {
        const mock = { id_portfolio: 'p-new', url_publique: 'url-custom', est_publie: false };
        mockPortfolioModel.create.mockResolvedValue(mock);

        await createPortfolio('etu-1', { url_publique: 'url-custom' });

        expect(mockPortfolioModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ est_publie: false })
            })
        );
    });
});

// ─────────────────────────────────────────────────
describe('updatePortfolio', () => {

    test('met à jour le portfolio si l\'étudiant en est propriétaire', async () => {
        const existing = { id_portfolio: 'p-1', id_etudiant: 'etu-1', est_publie: false };
        mockPortfolioModel.findFirst.mockResolvedValue(existing);
        mockPortfolioModel.update.mockResolvedValue({ ...existing, titre_personnalise: 'Nouveau titre' });

        const result = await updatePortfolio('p-1', 'etu-1', { titre_personnalise: 'Nouveau titre' });

        expect(mockPortfolioModel.update).toHaveBeenCalledTimes(1);
        expect(result.titre_personnalise).toBe('Nouveau titre');
    });

    test('retourne null si le portfolio n\'appartient pas à l\'étudiant', async () => {
        mockPortfolioModel.findFirst.mockResolvedValue(null);

        const result = await updatePortfolio('p-1', 'etu-autre', {});

        expect(result).toBeNull();
        expect(mockPortfolioModel.update).not.toHaveBeenCalled();
    });

    test('met date_publication si est_publie passe de false à true', async () => {
        const existing = { id_portfolio: 'p-1', id_etudiant: 'etu-1', est_publie: false };
        mockPortfolioModel.findFirst.mockResolvedValue(existing);
        mockPortfolioModel.update.mockResolvedValue({ ...existing, est_publie: true });

        await updatePortfolio('p-1', 'etu-1', { est_publie: true });

        expect(mockPortfolioModel.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ date_publication: expect.any(Date) })
            })
        );
    });
});

// ─────────────────────────────────────────────────
describe('publishPortfolio', () => {

    test('publie le portfolio (est_publie: true)', async () => {
        mockPortfolioModel.findFirst.mockResolvedValue({ id_portfolio: 'p-1' });
        mockPortfolioModel.update.mockResolvedValue({ id_portfolio: 'p-1', est_publie: true });

        const result = await publishPortfolio('p-1', 'etu-1', true);

        expect(mockPortfolioModel.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ est_publie: true, date_publication: expect.any(Date) })
            })
        );
        expect(result.est_publie).toBe(true);
    });

    test('dépublie le portfolio (est_publie: false)', async () => {
        mockPortfolioModel.findFirst.mockResolvedValue({ id_portfolio: 'p-1' });
        mockPortfolioModel.update.mockResolvedValue({ id_portfolio: 'p-1', est_publie: false });

        await publishPortfolio('p-1', 'etu-1', false);

        expect(mockPortfolioModel.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ est_publie: false, date_publication: null })
            })
        );
    });

    test('retourne null si portfolio non trouvé ou non autorisé', async () => {
        mockPortfolioModel.findFirst.mockResolvedValue(null);

        const result = await publishPortfolio('p-x', 'etu-1', true);

        expect(result).toBeNull();
        expect(mockPortfolioModel.update).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────
describe('getPortfolioStats', () => {

    test('retourne les stats du portfolio', async () => {
        const mock = { nombre_vues: 42, nombre_recommandations: 3, est_publie: true };
        mockPortfolioModel.findFirst.mockResolvedValue(mock);

        const result = await getPortfolioStats('p-1', 'etu-1');

        expect(mockPortfolioModel.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_portfolio: 'p-1', id_etudiant: 'etu-1' } })
        );
        expect(result.nombre_vues).toBe(42);
    });

    test('retourne null si portfolio non trouvé', async () => {
        mockPortfolioModel.findFirst.mockResolvedValue(null);
        expect(await getPortfolioStats('p-x', 'etu-1')).toBeNull();
    });
});

// ─────────────────────────────────────────────────
describe('deletePortfolio', () => {

    test('supprime le portfolio', async () => {
        mockPortfolioModel.delete.mockResolvedValue({ id_portfolio: 'p-1' });

        const result = await deletePortfolio('p-1');

        expect(mockPortfolioModel.delete).toHaveBeenCalledWith({ where: { id_portfolio: 'p-1' } });
        expect(result.id_portfolio).toBe('p-1');
    });
});
