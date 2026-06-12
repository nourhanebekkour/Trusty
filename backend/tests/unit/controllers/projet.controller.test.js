import { jest } from '@jest/globals';

// --- Mocks du service ---
const mockCreerProjet = jest.fn();
const mockRecupererTousLesProjets = jest.fn();
const mockRecupererProjetParId = jest.fn();
const mockRecupererProjetsAValider = jest.fn();
const mockRecupererProjetsParEtudiant = jest.fn();
const mockModifierProjet = jest.fn();
const mockValiderProjet = jest.fn();
const mockSupprimerProjet = jest.fn();
const mockAjouterFichier = jest.fn();
const mockListerFichiers = jest.fn();
const mockSupprimerFichier = jest.fn();
const mockAjouterParticipant = jest.fn();
const mockModifierParticipant = jest.fn();
const mockRetirerParticipant = jest.fn();
const mockAjouterTechnologieProjet = jest.fn();
const mockModifierTechnologieProjet = jest.fn();
const mockRetirerTechnologieProjet = jest.fn();

await jest.unstable_mockModule('#Modules/parcours/projet/projet.service.js', () => ({
    creerProjet: mockCreerProjet,
    recupererTousLesProjets: mockRecupererTousLesProjets,
    recupererProjetParId: mockRecupererProjetParId,
    recupererProjetsAValider: mockRecupererProjetsAValider,
    recupererProjetsParEtudiant: mockRecupererProjetsParEtudiant,
    modifierProjet: mockModifierProjet,
    validerProjet: mockValiderProjet,
    supprimerProjet: mockSupprimerProjet,
    ajouterFichier: mockAjouterFichier,
    listerFichiers: mockListerFichiers,
    supprimerFichier: mockSupprimerFichier,
    ajouterParticipant: mockAjouterParticipant,
    modifierParticipant: mockModifierParticipant,
    retirerParticipant: mockRetirerParticipant,
    ajouterTechnologieProjet: mockAjouterTechnologieProjet,
    modifierTechnologieProjet: mockModifierTechnologieProjet,
    retirerTechnologieProjet: mockRetirerTechnologieProjet,
}));

const {
    creerProjet,
    listerProjets,
    obtenirProjet,
    listerProjetsAValider,
    listerProjetsParEtudiant,
    modifierProjet,
    validerProjet,
    supprimerProjet,
    ajouterFichierAuProjet,
    listerFichiersDuProjet,
    supprimerFichierDuProjet,
    ajouterParticipant,
    modifierParticipant,
    retirerParticipant,
    ajouterTechnologie,
    modifierTechnologie,
    retirerTechnologie,
} = await import('#Modules/parcours/projet/projet.controller.js');

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
describe('creerProjet', () => {

    test('retourne 201 avec le projet créé', async () => {
        const mockProjet = { id_projet: 'proj-1', titre: 'Mon projet' };
        mockCreerProjet.mockResolvedValue(mockProjet);
        const req = makeReq({ body: { titre: 'Mon projet' } });
        const res = makeRes();

        await creerProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('retourne 400 en cas d\'erreur', async () => {
        mockCreerProjet.mockRejectedValue(new Error("L'ID de l'étudiant est requis"));
        const res = makeRes();

        await creerProjet(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});

// ─────────────────────────────────────────────────
describe('listerProjets', () => {

    test('retourne 200 avec la liste des projets', async () => {
        mockRecupererTousLesProjets.mockResolvedValue([{ id_projet: 'proj-1' }]);
        const res = makeRes();

        await listerProjets(makeReq({ query: {} }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererTousLesProjets.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await listerProjets(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('obtenirProjet', () => {

    test('retourne 200 si le projet est trouvé', async () => {
        mockRecupererProjetParId.mockResolvedValue({ id_projet: 'proj-1' });
        const req = makeReq({ params: { id: 'proj-1' } });
        const res = makeRes();

        await obtenirProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si le projet n\'est pas trouvé', async () => {
        mockRecupererProjetParId.mockResolvedValue(null);
        const req = makeReq({ params: { id: 'proj-x' } });
        const res = makeRes();

        await obtenirProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererProjetParId.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await obtenirProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('listerProjetsAValider', () => {

    test('retourne 200 avec les projets à valider', async () => {
        mockRecupererProjetsAValider.mockResolvedValue([]);
        const res = makeRes();

        await listerProjetsAValider(makeReq({ user: { id: 'prof-1', role: 'PROFESSEUR' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockRecupererProjetsAValider).toHaveBeenCalledWith('prof-1');
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererProjetsAValider.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await listerProjetsAValider(makeReq(), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('listerProjetsParEtudiant', () => {

    test('retourne 200 avec les projets de l\'étudiant', async () => {
        mockRecupererProjetsParEtudiant.mockResolvedValue([]);
        const req = makeReq({ params: { id_etudiant: 'etu-1' } });
        const res = makeRes();

        await listerProjetsParEtudiant(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockRecupererProjetsParEtudiant).toHaveBeenCalledWith('etu-1');
    });

    test('retourne 500 en cas d\'erreur', async () => {
        mockRecupererProjetsParEtudiant.mockRejectedValue(new Error('DB error'));
        const res = makeRes();

        await listerProjetsParEtudiant(makeReq({ params: { id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('modifierProjet', () => {

    test('retourne 200 en cas de succès', async () => {
        mockModifierProjet.mockResolvedValue({ id_projet: 'proj-1', titre: 'Modifié' });
        const req = makeReq({ params: { id: 'proj-1' }, body: { titre: 'Modifié' } });
        const res = makeRes();

        await modifierProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockModifierProjet.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await modifierProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockModifierProjet.mockRejectedValue(new Error('Données invalides'));
        const res = makeRes();

        await modifierProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('validerProjet', () => {

    test('retourne 200 en cas de succès', async () => {
        mockValiderProjet.mockResolvedValue({ id_projet: 'proj-1', status_validation: 'VALIDE' });
        const req = makeReq({
            params: { id: 'proj-1' },
            body: { decision: 'VALIDE', commentaire: 'Bon', appreciation: 'A' },
            user: { id: 'prof-1', role: 'PROFESSEUR' },
        });
        const res = makeRes();

        await validerProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "validateur"', async () => {
        mockValiderProjet.mockRejectedValue(new Error("Vous n'êtes pas le validateur désigné pour ce projet"));
        const req = makeReq({ params: { id: 'proj-1' }, body: { decision: 'VALIDE' } });
        const res = makeRes();

        await validerProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockValiderProjet.mockRejectedValue(new Error('Projet non trouvé'));
        const res = makeRes();

        await validerProjet(makeReq({ params: { id: 'proj-x' }, body: { decision: 'VALIDE' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerProjet', () => {

    test('retourne 200 en cas de succès', async () => {
        mockSupprimerProjet.mockResolvedValue({});
        const res = makeRes();

        await supprimerProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockSupprimerProjet.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await supprimerProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 404 si "Projet non trouvé"', async () => {
        mockSupprimerProjet.mockRejectedValue(new Error('Projet non trouvé'));
        const res = makeRes();

        await supprimerProjet(makeReq({ params: { id: 'proj-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockSupprimerProjet.mockRejectedValue(new Error('Erreur inconnue'));
        const res = makeRes();

        await supprimerProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('ajouterFichierAuProjet', () => {

    test('retourne 201 en cas de succès', async () => {
        mockAjouterFichier.mockResolvedValue({ id_fichier: 'f-1' });
        const req = makeReq({ params: { id: 'proj-1' }, file: { originalname: 'doc.pdf' } });
        const res = makeRes();

        await ajouterFichierAuProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 400 si aucun fichier fourni', async () => {
        const req = makeReq({ params: { id: 'proj-1' }, file: null });
        const res = makeRes();

        await ajouterFichierAuProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockAjouterFichier).not.toHaveBeenCalled();
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockAjouterFichier.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const req = makeReq({ params: { id: 'proj-1' }, file: { originalname: 'doc.pdf' } });
        const res = makeRes();

        await ajouterFichierAuProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 404 si "Projet non trouvé"', async () => {
        mockAjouterFichier.mockRejectedValue(new Error('Projet non trouvé'));
        const req = makeReq({ params: { id: 'proj-x' }, file: { originalname: 'doc.pdf' } });
        const res = makeRes();

        await ajouterFichierAuProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 pour une autre erreur', async () => {
        mockAjouterFichier.mockRejectedValue(new Error('MinIO error'));
        const req = makeReq({ params: { id: 'proj-1' }, file: { originalname: 'doc.pdf' } });
        const res = makeRes();

        await ajouterFichierAuProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('listerFichiersDuProjet', () => {

    test('retourne 200 avec les fichiers', async () => {
        mockListerFichiers.mockResolvedValue([{ id_fichier: 'f-1', url: 'http://...' }]);
        const res = makeRes();

        await listerFichiersDuProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 404 si "Projet non trouvé"', async () => {
        mockListerFichiers.mockRejectedValue(new Error('Projet non trouvé'));
        const res = makeRes();

        await listerFichiersDuProjet(makeReq({ params: { id: 'proj-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 500 pour une autre erreur', async () => {
        mockListerFichiers.mockRejectedValue(new Error('Erreur'));
        const res = makeRes();

        await listerFichiersDuProjet(makeReq({ params: { id: 'proj-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerFichierDuProjet', () => {

    test('retourne 200 en cas de succès', async () => {
        mockSupprimerFichier.mockResolvedValue({});
        const req = makeReq({ params: { id: 'proj-1', id_fichier: 'f-1' } });
        const res = makeRes();

        await supprimerFichierDuProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockSupprimerFichier.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await supprimerFichierDuProjet(makeReq({ params: { id: 'proj-1', id_fichier: 'f-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 404 si erreur contient "non trouvé"', async () => {
        mockSupprimerFichier.mockRejectedValue(new Error("Fichier non trouvé ou n'appartient pas à ce projet"));
        const res = makeRes();

        await supprimerFichierDuProjet(makeReq({ params: { id: 'proj-1', id_fichier: 'f-x' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockSupprimerFichier.mockRejectedValue(new Error('Erreur inconnue'));
        const res = makeRes();

        await supprimerFichierDuProjet(makeReq({ params: { id: 'proj-1', id_fichier: 'f-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('ajouterParticipant', () => {

    test('retourne 201 en cas de succès', async () => {
        mockAjouterParticipant.mockResolvedValue({ id_projet: 'proj-1', id_etudiant: 'etu-2' });
        const req = makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-2' }, body: { role_joue: 'Dev' } });
        const res = makeRes();

        await ajouterParticipant(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockAjouterParticipant.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await ajouterParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-2' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockAjouterParticipant.mockRejectedValue(new Error('Données invalides'));
        const res = makeRes();

        await ajouterParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-2' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('modifierParticipant', () => {

    test('retourne 200 en cas de succès', async () => {
        mockModifierParticipant.mockResolvedValue({ role_joue: 'Lead' });
        const req = makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-1' }, body: { role_joue: 'Lead' } });
        const res = makeRes();

        await modifierParticipant(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockModifierParticipant.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await modifierParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockModifierParticipant.mockRejectedValue(new Error('Erreur'));
        const res = makeRes();

        await modifierParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('retirerParticipant', () => {

    test('retourne 200 en cas de succès', async () => {
        mockRetirerParticipant.mockResolvedValue({});
        const res = makeRes();

        await retirerParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockRetirerParticipant.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await retirerParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockRetirerParticipant.mockRejectedValue(new Error('Erreur'));
        const res = makeRes();

        await retirerParticipant(makeReq({ params: { id_projet: 'proj-1', id_etudiant: 'etu-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('ajouterTechnologie', () => {

    test('retourne 201 en cas de succès', async () => {
        mockAjouterTechnologieProjet.mockResolvedValue({ id_projet: 'proj-1', id_technologie: 'tech-1' });
        const req = makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' }, body: { version: '3.0' } });
        const res = makeRes();

        await ajouterTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockAjouterTechnologieProjet.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await ajouterTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockAjouterTechnologieProjet.mockRejectedValue(new Error('Erreur'));
        const res = makeRes();

        await ajouterTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('modifierTechnologie', () => {

    test('retourne 200 en cas de succès', async () => {
        mockModifierTechnologieProjet.mockResolvedValue({ version: '4.0' });
        const req = makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' }, body: { version: '4.0' } });
        const res = makeRes();

        await modifierTechnologie(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockModifierTechnologieProjet.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await modifierTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockModifierTechnologieProjet.mockRejectedValue(new Error('Erreur'));
        const res = makeRes();

        await modifierTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────────
describe('retirerTechnologie', () => {

    test('retourne 200 en cas de succès', async () => {
        mockRetirerTechnologieProjet.mockResolvedValue({});
        const res = makeRes();

        await retirerTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retourne 403 si erreur "autorisé"', async () => {
        mockRetirerTechnologieProjet.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à ce projet"));
        const res = makeRes();

        await retirerTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('retourne 400 pour une autre erreur', async () => {
        mockRetirerTechnologieProjet.mockRejectedValue(new Error('Erreur'));
        const res = makeRes();

        await retirerTechnologie(makeReq({ params: { id_projet: 'proj-1', id_technologie: 'tech-1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
