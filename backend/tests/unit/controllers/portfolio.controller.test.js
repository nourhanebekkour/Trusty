import { jest } from '@jest/globals';

// --- Mocks du service ---
const mockGetPortfolioByUrl = jest.fn();
const mockIncrementPortfolioViews = jest.fn();
const mockGetActiveTemplates = jest.fn();
const mockUploadApercuModele = jest.fn();
const mockGetMyPortfolios = jest.fn();
const mockCreatePortfolio = jest.fn();
const mockUpdatePortfolio = jest.fn();
const mockPublishPortfolio = jest.fn();
const mockGetPortfolioStats = jest.fn();
const mockDeletePortfolio = jest.fn();

await jest.unstable_mockModule('#Modules/portfolio/portfolio.service.js', () => ({
    getPortfolioByUrl: mockGetPortfolioByUrl,
    incrementPortfolioViews: mockIncrementPortfolioViews,
    getActiveTemplates: mockGetActiveTemplates,
    uploadApercuModele: mockUploadApercuModele,
    getMyPortfolios: mockGetMyPortfolios,
    createPortfolio: mockCreatePortfolio,
    updatePortfolio: mockUpdatePortfolio,
    publishPortfolio: mockPublishPortfolio,
    getPortfolioStats: mockGetPortfolioStats,
    deletePortfolio: mockDeletePortfolio,
}));

const {
    getPublicPortfolio,
    getTemplates,
    uploadApercuModele,
    getMyPortfolios,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    getPortfolioStats,
    deletePortfolio,
} = await import('#Modules/portfolio/portfolio.controller.js');

// --- Helpers ---
const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const makeReq = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    user: { id: 'etu-1', role: 'ETUDIANT' },
    file: null,
    ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('getPublicPortfolio', () => {

    test('retourne 404 si portfolio introuvable', async () => {
        mockGetPortfolioByUrl.mockResolvedValue(null);
        const res = makeRes();

        await getPublicPortfolio(makeReq({ params: { url_publique: 'inconnu' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 404 si portfolio non publié et non propriétaire', async () => {
        mockGetPortfolioByUrl.mockResolvedValue({
            id_portfolio: 'p-1', id_etudiant: 'etu-1', est_publie: false, nombre_vues: 10
        });
        const req = makeReq({
            params: { url_publique: 'jean-dupont' },
            user: { id: 'etu-autre' },
        });
        const res = makeRes();

        await getPublicPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockIncrementPortfolioViews).not.toHaveBeenCalled();
    });

    test('retourne 200 si portfolio non publié mais propriétaire', async () => {
        const portfolio = {
            id_portfolio: 'p-1', id_etudiant: 'etu-1', est_publie: false, nombre_vues: 5
        };
        mockGetPortfolioByUrl.mockResolvedValue(portfolio);
        mockIncrementPortfolioViews.mockResolvedValue(undefined);
        const req = makeReq({ params: { url_publique: 'jean-dupont' }, user: { id: 'etu-1' } });
        const res = makeRes();

        await getPublicPortfolio(req, res);

        expect(mockIncrementPortfolioViews).toHaveBeenCalledWith('p-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 200 et incrémente les vues si portfolio publié', async () => {
        const portfolio = {
            id_portfolio: 'p-1', id_etudiant: 'etu-1', est_publie: true, nombre_vues: 10
        };
        mockGetPortfolioByUrl.mockResolvedValue(portfolio);
        mockIncrementPortfolioViews.mockResolvedValue(undefined);
        const req = makeReq({ params: { url_publique: 'jean-dupont' } });
        const res = makeRes();

        await getPublicPortfolio(req, res);

        expect(mockIncrementPortfolioViews).toHaveBeenCalledWith('p-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ nombre_vues: 11 }) })
        );
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetPortfolioByUrl.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await getPublicPortfolio(makeReq({ params: { url_publique: 'url' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('getTemplates', () => {

    test('retourne 200 avec les templates', async () => {
        mockGetActiveTemplates.mockResolvedValue([{ id_modele: 'm-1' }]);
        const res = makeRes();

        await getTemplates(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetActiveTemplates.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await getTemplates(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('uploadApercuModele', () => {

    test('retourne 400 si aucun fichier fourni', async () => {
        const res = makeRes();

        await uploadApercuModele(makeReq({ params: { id_modele: 'm-1' }, file: null }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUploadApercuModele).not.toHaveBeenCalled();
    });

    test('retourne 404 si modèle introuvable', async () => {
        mockUploadApercuModele.mockResolvedValue(null);
        const req = makeReq({ params: { id_modele: 'm-x' }, file: { originalname: 'img.png' } });
        const res = makeRes();

        await uploadApercuModele(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 200 en cas de succès', async () => {
        mockUploadApercuModele.mockResolvedValue({ id_modele: 'm-1', id_apercu: 'f-new' });
        const req = makeReq({ params: { id_modele: 'm-1' }, file: { originalname: 'img.png' } });
        const res = makeRes();

        await uploadApercuModele(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockUploadApercuModele.mockRejectedValue(new Error('MinIO error'));
        const req = makeReq({ params: { id_modele: 'm-1' }, file: { originalname: 'img.png' } });
        const res = makeRes();

        await uploadApercuModele(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('getMyPortfolios', () => {

    test('retourne 200 avec les portfolios', async () => {
        mockGetMyPortfolios.mockResolvedValue([{ id_portfolio: 'p-1' }]);
        const res = makeRes();

        await getMyPortfolios(makeReq(), res);

        expect(mockGetMyPortfolios).toHaveBeenCalledWith('etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetMyPortfolios.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await getMyPortfolios(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('createPortfolio', () => {

    test('retourne 201 en cas de succès', async () => {
        mockCreatePortfolio.mockResolvedValue({ id_portfolio: 'p-new' });
        const res = makeRes();

        await createPortfolio(makeReq({ body: { titre_personnalise: 'Mon Portfolio' } }), res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 400 si url_publique déjà prise', async () => {
        mockGetPortfolioByUrl.mockResolvedValue({ id_portfolio: 'p-exist' });
        const req = makeReq({ body: { url_publique: 'url-prise' } });
        const res = makeRes();

        await createPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreatePortfolio).not.toHaveBeenCalled();
    });

    test('ne vérifie pas l\'URL si url_publique non fournie', async () => {
        mockCreatePortfolio.mockResolvedValue({ id_portfolio: 'p-new' });
        const req = makeReq({ body: { titre_personnalise: 'Portfolio sans URL' } });
        const res = makeRes();

        await createPortfolio(req, res);

        expect(mockGetPortfolioByUrl).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetPortfolioByUrl.mockResolvedValue(null);
        mockCreatePortfolio.mockRejectedValue(new Error('DB error'));
        const req = makeReq({ body: { url_publique: 'libre' } });
        const res = makeRes();

        await createPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('updatePortfolio', () => {

    test('retourne 200 en cas de succès', async () => {
        mockGetPortfolioByUrl.mockResolvedValue(null);
        mockUpdatePortfolio.mockResolvedValue({ id_portfolio: 'p-1', titre_personnalise: 'Modifié' });
        const req = makeReq({ params: { id_portfolio: 'p-1' }, body: { titre_personnalise: 'Modifié' } });
        const res = makeRes();

        await updatePortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 400 si url_publique prise par un autre portfolio', async () => {
        mockGetPortfolioByUrl.mockResolvedValue({ id_portfolio: 'p-autre' });
        const req = makeReq({ params: { id_portfolio: 'p-1' }, body: { url_publique: 'url-prise' } });
        const res = makeRes();

        await updatePortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUpdatePortfolio).not.toHaveBeenCalled();
    });

    test('autorise si l\'url_publique appartient au même portfolio', async () => {
        mockGetPortfolioByUrl.mockResolvedValue({ id_portfolio: 'p-1' });
        mockUpdatePortfolio.mockResolvedValue({ id_portfolio: 'p-1' });
        const req = makeReq({ params: { id_portfolio: 'p-1' }, body: { url_publique: 'ma-propre-url' } });
        const res = makeRes();

        await updatePortfolio(req, res);

        expect(mockUpdatePortfolio).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si portfolio introuvable ou non autorisé', async () => {
        mockGetPortfolioByUrl.mockResolvedValue(null);
        mockUpdatePortfolio.mockResolvedValue(null);
        const req = makeReq({ params: { id_portfolio: 'p-x' }, body: {} });
        const res = makeRes();

        await updatePortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetPortfolioByUrl.mockResolvedValue(null);
        mockUpdatePortfolio.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await updatePortfolio(makeReq({ params: { id_portfolio: 'p-1' }, body: {} }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('publishPortfolio', () => {

    test('retourne 400 si est_publie est absent', async () => {
        const res = makeRes();

        await publishPortfolio(makeReq({ params: { id_portfolio: 'p-1' }, body: {} }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockPublishPortfolio).not.toHaveBeenCalled();
    });

    test('retourne 200 en publiant le portfolio', async () => {
        mockPublishPortfolio.mockResolvedValue({ id_portfolio: 'p-1', est_publie: true });
        const req = makeReq({ params: { id_portfolio: 'p-1' }, body: { est_publie: true } });
        const res = makeRes();

        await publishPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('publié') })
        );
    });

    test('retourne 200 en dépubliant le portfolio', async () => {
        mockPublishPortfolio.mockResolvedValue({ id_portfolio: 'p-1', est_publie: false });
        const req = makeReq({ params: { id_portfolio: 'p-1' }, body: { est_publie: false } });
        const res = makeRes();

        await publishPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('dépublié') })
        );
    });

    test('retourne 404 si portfolio introuvable ou non autorisé', async () => {
        mockPublishPortfolio.mockResolvedValue(null);
        const req = makeReq({ params: { id_portfolio: 'p-x' }, body: { est_publie: true } });
        const res = makeRes();

        await publishPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockPublishPortfolio.mockRejectedValue(new Error('DB error'));
        const req = makeReq({ params: { id_portfolio: 'p-1' }, body: { est_publie: true } });
        const res = makeRes();

        await publishPortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('getPortfolioStats', () => {

    test('retourne 200 avec les statistiques', async () => {
        mockGetPortfolioStats.mockResolvedValue({ nombre_vues: 42, est_publie: true });
        const req = makeReq({ params: { id_portfolio: 'p-1' } });
        const res = makeRes();

        await getPortfolioStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si portfolio introuvable', async () => {
        mockGetPortfolioStats.mockResolvedValue(null);
        const req = makeReq({ params: { id_portfolio: 'p-x' } });
        const res = makeRes();

        await getPortfolioStats(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetPortfolioStats.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await getPortfolioStats(makeReq({ params: { id_portfolio: 'p-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('deletePortfolio', () => {

    test('retourne 200 en cas de succès', async () => {
        mockGetMyPortfolios.mockResolvedValue([{ id_portfolio: 'p-1' }]);
        mockDeletePortfolio.mockResolvedValue({});
        const req = makeReq({ params: { id_portfolio: 'p-1' } });
        const res = makeRes();

        await deletePortfolio(req, res);

        expect(mockDeletePortfolio).toHaveBeenCalledWith('p-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si le portfolio n\'appartient pas à l\'étudiant', async () => {
        mockGetMyPortfolios.mockResolvedValue([{ id_portfolio: 'p-autre' }]);
        const req = makeReq({ params: { id_portfolio: 'p-1' } });
        const res = makeRes();

        await deletePortfolio(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockDeletePortfolio).not.toHaveBeenCalled();
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockGetMyPortfolios.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await deletePortfolio(makeReq({ params: { id_portfolio: 'p-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
