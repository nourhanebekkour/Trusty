import { jest } from '@jest/globals';

// --- Mocks du service ---
const mockCreerRecommandation = jest.fn();
const mockRecupererRecommandations = jest.fn();
const mockRecupererRecommandationParId = jest.fn();
const mockValiderRecommandation = jest.fn();
const mockSupprimerRecommandation = jest.fn();
const mockRecupererRecommandationsValidees = jest.fn();
const mockRecupererRecommandationsRecus = jest.fn();
const mockRecupererRecommandationsEmises = jest.fn();

await jest.unstable_mockModule('#Modules/systeme/recommandation/recommandation.service.js', () => ({
    creerRecommandation: mockCreerRecommandation,
    recupererRecommandations: mockRecupererRecommandations,
    recupererRecommandationParId: mockRecupererRecommandationParId,
    validerRecommandation: mockValiderRecommandation,
    supprimerRecommandation: mockSupprimerRecommandation,
    recupererRecommandationsValidees: mockRecupererRecommandationsValidees,
    recupererRecommandationsRecus: mockRecupererRecommandationsRecus,
    recupererRecommandationsEmises: mockRecupererRecommandationsEmises,
}));

const {
    creerRecommandation,
    recupererRecommandations,
    recupererRecommandationParId,
    validerRecommandation,
    supprimerRecommandation,
    recupererRecommandationsValidees,
    recupererMesRecommandationsRecus,
    recupererMesRecommandationsEmises,
} = await import('#Modules/systeme/recommandation/recommandation.controller.js');

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
    user: { id: 'user-1', role: 'ETUDIANT' },
    ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('creerRecommandation', () => {

    test('retourne 201 en cas de succès', async () => {
        mockCreerRecommandation.mockResolvedValue({ id_recommandation: 'r-1' });
        const req = makeReq({ body: { id_etudiant: 'etu-1', message: 'Bon' }, user: { id: 'pro-1', role: 'PROFESSIONNEL' } });
        const res = makeRes();

        await creerRecommandation(req, res);

        expect(mockCreerRecommandation).toHaveBeenCalledWith('pro-1', req.body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockCreerRecommandation.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await creerRecommandation(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandations', () => {

    test('retourne 200 avec la liste', async () => {
        mockRecupererRecommandations.mockResolvedValue([{ id_recommandation: 'r-1' }]);
        const res = makeRes();

        await recupererRecommandations(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandations.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await recupererRecommandations(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandationParId', () => {

    test('retourne 200 si trouvée', async () => {
        mockRecupererRecommandationParId.mockResolvedValue({ id_recommandation: 'r-1' });
        const res = makeRes();

        await recupererRecommandationParId(makeReq({ params: { id: 'r-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si non trouvée', async () => {
        mockRecupererRecommandationParId.mockResolvedValue(null);
        const res = makeRes();

        await recupererRecommandationParId(makeReq({ params: { id: 'r-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandationParId.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await recupererRecommandationParId(makeReq({ params: { id: 'r-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('validerRecommandation', () => {

    test('retourne 200 si l\'étudiant cible valide sa propre recommandation', async () => {
        const mockReco = { id_recommandation: 'r-1', id_etudiant: 'etu-1' };
        mockRecupererRecommandationParId.mockResolvedValue(mockReco);
        mockValiderRecommandation.mockResolvedValue({ ...mockReco, status: 'VALIDE' });

        const req = makeReq({
            params: { id: 'r-1' },
            body: { status: 'VALIDE' },
            user: { id: 'etu-1', role: 'ETUDIANT' },
        });
        const res = makeRes();

        await validerRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 200 si un administrateur valide', async () => {
        const mockReco = { id_recommandation: 'r-1', id_etudiant: 'etu-1' };
        mockRecupererRecommandationParId.mockResolvedValue(mockReco);
        mockValiderRecommandation.mockResolvedValue({ ...mockReco, status: 'REJETE' });

        const req = makeReq({
            params: { id: 'r-1' },
            body: { status: 'REJETE' },
            user: { id: 'admin-1', role: 'ADMINISTRATEUR' },
        });
        const res = makeRes();

        await validerRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si ni admin ni étudiant cible', async () => {
        mockRecupererRecommandationParId.mockResolvedValue({ id_recommandation: 'r-1', id_etudiant: 'etu-1' });
        const req = makeReq({
            params: { id: 'r-1' },
            body: { status: 'VALIDE' },
            user: { id: 'etu-autre', role: 'ETUDIANT' },
        });
        const res = makeRes();

        await validerRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(mockValiderRecommandation).not.toHaveBeenCalled();
    });

    test('retourne 404 si recommandation non trouvée', async () => {
        mockRecupererRecommandationParId.mockResolvedValue(null);
        const res = makeRes();

        await validerRecommandation(makeReq({ params: { id: 'r-x' }, body: { status: 'VALIDE' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandationParId.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await validerRecommandation(makeReq({ params: { id: 'r-1' }, body: { status: 'VALIDE' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerRecommandation', () => {

    test('retourne 200 si l\'auteur supprime sa recommandation', async () => {
        mockRecupererRecommandationParId.mockResolvedValue({ id_recommandation: 'r-1', id_recommandeur: 'pro-1' });
        mockSupprimerRecommandation.mockResolvedValue({});

        const req = makeReq({
            params: { id: 'r-1' },
            user: { id: 'pro-1', role: 'PROFESSIONNEL' },
        });
        const res = makeRes();

        await supprimerRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 200 si un administrateur supprime', async () => {
        mockRecupererRecommandationParId.mockResolvedValue({ id_recommandation: 'r-1', id_recommandeur: 'pro-1' });
        mockSupprimerRecommandation.mockResolvedValue({});

        const req = makeReq({
            params: { id: 'r-1' },
            user: { id: 'admin-1', role: 'ADMINISTRATEUR' },
        });
        const res = makeRes();

        await supprimerRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si ni admin ni auteur', async () => {
        mockRecupererRecommandationParId.mockResolvedValue({ id_recommandation: 'r-1', id_recommandeur: 'pro-1' });
        const req = makeReq({
            params: { id: 'r-1' },
            user: { id: 'autre-user', role: 'ETUDIANT' },
        });
        const res = makeRes();

        await supprimerRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(mockSupprimerRecommandation).not.toHaveBeenCalled();
    });

    test('retourne 404 si recommandation non trouvée', async () => {
        mockRecupererRecommandationParId.mockResolvedValue(null);
        const res = makeRes();

        await supprimerRecommandation(makeReq({ params: { id: 'r-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandationParId.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await supprimerRecommandation(makeReq({ params: { id: 'r-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandationsValidees', () => {

    test('retourne 200 avec les recommandations validées', async () => {
        mockRecupererRecommandationsValidees.mockResolvedValue([]);
        const res = makeRes();

        await recupererRecommandationsValidees(makeReq({ params: { id_etudiant: 'etu-1' } }), res);

        expect(mockRecupererRecommandationsValidees).toHaveBeenCalledWith('etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandationsValidees.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await recupererRecommandationsValidees(makeReq({ params: { id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('recupererMesRecommandationsRecus', () => {

    test('retourne 200 avec les recommandations reçues', async () => {
        mockRecupererRecommandationsRecus.mockResolvedValue([]);
        const res = makeRes();

        await recupererMesRecommandationsRecus(makeReq({ user: { id: 'etu-1', role: 'ETUDIANT' } }), res);

        expect(mockRecupererRecommandationsRecus).toHaveBeenCalledWith('etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandationsRecus.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await recupererMesRecommandationsRecus(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('recupererMesRecommandationsEmises', () => {

    test('retourne 200 avec les recommandations émises', async () => {
        mockRecupererRecommandationsEmises.mockResolvedValue([]);
        const res = makeRes();

        await recupererMesRecommandationsEmises(makeReq({ user: { id: 'pro-1', role: 'PROFESSIONNEL' } }), res);

        expect(mockRecupererRecommandationsEmises).toHaveBeenCalledWith('pro-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererRecommandationsEmises.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await recupererMesRecommandationsEmises(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});