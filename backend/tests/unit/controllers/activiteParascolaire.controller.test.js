import { jest } from '@jest/globals';

// --- Mocks du service ---
const mockCreerActivite = jest.fn();
const mockRecupererToutesLesActivites = jest.fn();
const mockRecupererActiviteParId = jest.fn();
const mockRecupererActivitesParEtudiant = jest.fn();
const mockRecupererActivitesAValider = jest.fn();
const mockModifierActivite = jest.fn();
const mockValiderActivite = jest.fn();
const mockSupprimerActivite = jest.fn();
const mockAssocierAttestation = jest.fn();
const mockSupprimerAttestation = jest.fn();

await jest.unstable_mockModule('#Modules/parcours/activiteParascolaire/activiteParascolaire.service.js', () => ({
    creerActivite: mockCreerActivite,
    recupererToutesLesActivites: mockRecupererToutesLesActivites,
    recupererActiviteParId: mockRecupererActiviteParId,
    recupererActivitesParEtudiant: mockRecupererActivitesParEtudiant,
    recupererActivitesAValider: mockRecupererActivitesAValider,
    modifierActivite: mockModifierActivite,
    validerActivite: mockValiderActivite,
    supprimerActivite: mockSupprimerActivite,
    associerAttestation: mockAssocierAttestation,
    supprimerAttestation: mockSupprimerAttestation,
}));

const {
    creerActivite,
    listerActivites,
    obtenirActivite,
    listerActivitesParEtudiant,
    listerActivitesAValider,
    modifierActivite,
    validerActivite,
    supprimerActivite,
    uploadAttestation,
    supprimerAttestation,
} = await import('#Modules/parcours/activiteParascolaire/activiteParascolaire.controller.js');

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
    file: null,
    user: { id: 'etu-1', role: 'ETUDIANT' },
    ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('creerActivite', () => {

    test('retourne 201 en cas de succès', async () => {
        mockCreerActivite.mockResolvedValue({ id_activite: 'act-1' });
        const req = makeReq({ params: { id_etudiant: 'etu-1' }, body: { nom_activite: 'Club' } });
        const res = makeRes();

        await creerActivite(req, res);

        expect(mockCreerActivite).toHaveBeenCalledWith({ nom_activite: 'Club', id_etudiant: 'etu-1' });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 400 en cas d\'erreur', async () => {
        mockCreerActivite.mockRejectedValue(new Error("L'ID de l'étudiant est requis"));
        const res = makeRes();

        await creerActivite(makeReq({ params: { id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('listerActivites', () => {

    test('retourne 200 avec la liste', async () => {
        mockRecupererToutesLesActivites.mockResolvedValue([]);
        const res = makeRes();

        await listerActivites(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererToutesLesActivites.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await listerActivites(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('obtenirActivite', () => {

    test('retourne 200 si trouvée', async () => {
        mockRecupererActiviteParId.mockResolvedValue({ id_activite: 'act-1' });
        const res = makeRes();

        await obtenirActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si non trouvée', async () => {
        mockRecupererActiviteParId.mockResolvedValue(null);
        const res = makeRes();

        await obtenirActivite(makeReq({ params: { id: 'act-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererActiviteParId.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await obtenirActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('listerActivitesParEtudiant', () => {

    test('retourne 200 avec les activités', async () => {
        mockRecupererActivitesParEtudiant.mockResolvedValue([]);
        const res = makeRes();

        await listerActivitesParEtudiant(makeReq({ params: { id_etudiant: 'etu-1' } }), res);

        expect(mockRecupererActivitesParEtudiant).toHaveBeenCalledWith('etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererActivitesParEtudiant.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await listerActivitesParEtudiant(makeReq({ params: { id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('listerActivitesAValider', () => {

    test('retourne 200 avec les activités à valider', async () => {
        mockRecupererActivitesAValider.mockResolvedValue([]);
        const res = makeRes();

        await listerActivitesAValider(makeReq({ user: { id: 'admin-1', role: 'ADMINISTRATEUR' } }), res);

        expect(mockRecupererActivitesAValider).toHaveBeenCalledWith('admin-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererActivitesAValider.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await listerActivitesAValider(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('modifierActivite', () => {

    test('retourne 200 en cas de succès', async () => {
        mockModifierActivite.mockResolvedValue({ id_activite: 'act-1' });
        const res = makeRes();

        await modifierActivite(makeReq({ params: { id: 'act-1' }, body: { nom_activite: 'Modifié' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockModifierActivite.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));
        const res = makeRes();

        await modifierActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockModifierActivite.mockRejectedValue(new Error('Données invalides'));
        const res = makeRes();

        await modifierActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('validerActivite', () => {

    test('retourne 200 en cas de succès', async () => {
        mockValiderActivite.mockResolvedValue({ id_activite: 'act-1', status_validation: 'VALIDE' });
        const req = makeReq({
            params: { id: 'act-1' },
            body: { decision: 'VALIDE', commentaire: 'OK' },
            user: { id: 'admin-1', role: 'ADMINISTRATEUR' },
        });
        const res = makeRes();

        await validerActivite(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur contient "validateur"', async () => {
        mockValiderActivite.mockRejectedValue(new Error('Seul un administrateur peut valider une activité parascolaire'));
        const req = makeReq({ params: { id: 'act-1' }, body: { decision: 'VALIDE' } });
        const res = makeRes();

        await validerActivite(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockValiderActivite.mockRejectedValue(new Error('Activité non trouvée'));
        const res = makeRes();

        await validerActivite(makeReq({ params: { id: 'act-x' }, body: { decision: 'VALIDE' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerActivite', () => {

    test('retourne 200 en cas de succès', async () => {
        mockSupprimerActivite.mockResolvedValue({});
        const res = makeRes();

        await supprimerActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockSupprimerActivite.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));
        const res = makeRes();

        await supprimerActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 404 si "Activité non trouvée"', async () => {
        mockSupprimerActivite.mockRejectedValue(new Error('Activité non trouvée'));
        const res = makeRes();

        await supprimerActivite(makeReq({ params: { id: 'act-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockSupprimerActivite.mockRejectedValue(new Error('Erreur inconnue'));
        const res = makeRes();

        await supprimerActivite(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('uploadAttestation', () => {

    test('retourne 400 si aucun fichier fourni', async () => {
        const res = makeRes();

        await uploadAttestation(makeReq({ params: { id: 'act-1' }, file: null }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockAssocierAttestation).not.toHaveBeenCalled();
    });

    test('retourne 200 en cas de succès', async () => {
        mockAssocierAttestation.mockResolvedValue({ id_fichier: 'f-1' });
        const req = makeReq({ params: { id: 'act-1' }, file: { originalname: 'att.pdf' } });
        const res = makeRes();

        await uploadAttestation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockAssocierAttestation.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));
        const req = makeReq({ params: { id: 'act-1' }, file: { originalname: 'att.pdf' } });
        const res = makeRes();

        await uploadAttestation(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 404 si "Activité non trouvée"', async () => {
        mockAssocierAttestation.mockRejectedValue(new Error('Activité non trouvée'));
        const req = makeReq({ params: { id: 'act-x' }, file: { originalname: 'att.pdf' } });
        const res = makeRes();

        await uploadAttestation(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 pour une autre erreur', async () => {
        mockAssocierAttestation.mockRejectedValue(new Error('MinIO error'));
        const req = makeReq({ params: { id: 'act-1' }, file: { originalname: 'att.pdf' } });
        const res = makeRes();

        await uploadAttestation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerAttestation', () => {

    test('retourne 200 en cas de succès', async () => {
        mockSupprimerAttestation.mockResolvedValue({});
        const res = makeRes();

        await supprimerAttestation(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockSupprimerAttestation.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));
        const res = makeRes();

        await supprimerAttestation(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 404 si "Aucune attestation"', async () => {
        mockSupprimerAttestation.mockRejectedValue(new Error('Aucune attestation associée à cette activité'));
        const res = makeRes();

        await supprimerAttestation(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 pour une autre erreur', async () => {
        mockSupprimerAttestation.mockRejectedValue(new Error('MinIO error'));
        const res = makeRes();

        await supprimerAttestation(makeReq({ params: { id: 'act-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});