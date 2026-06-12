import { jest } from '@jest/globals';

// --- Mocks Prisma ---
const mockActiviteModel = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
const mockUtilisateurModel = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
};
const mockHistoriqueValidationModel = { create: jest.fn() };

const mockPrismaInstance = {
    activiteParascolaire: mockActiviteModel,
    utilisateur: mockUtilisateurModel,
    historiqueValidation: mockHistoriqueValidationModel,
};

await jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance),
}));

// --- Mock notifications ---
const mockCreerNotification = jest.fn().mockResolvedValue(undefined);
await jest.unstable_mockModule('#Modules/systeme/notifications/notifications.service.js', () => ({
    creerNotification: mockCreerNotification,
}));

// --- Mock MinIO ---
const mockEnrichEntitiesWithFileUrls = jest.fn(e => Promise.resolve(e));
const mockEnrichEntityWithFileUrls = jest.fn(e => Promise.resolve(e));
const mockUploadAndSaveFile = jest.fn();
const mockDeleteFile = jest.fn().mockResolvedValue(undefined);

await jest.unstable_mockModule('#Services/minio.service.js', () => ({
    enrichEntitiesWithFileUrls: mockEnrichEntitiesWithFileUrls,
    enrichEntityWithFileUrls: mockEnrichEntityWithFileUrls,
    uploadAndSaveFile: mockUploadAndSaveFile,
    deleteFile: mockDeleteFile,
}));

// --- Mock etudiant.service ---
const mockCalculerScore = jest.fn().mockResolvedValue(undefined);
await jest.unstable_mockModule('#Modules/identite/etudiant/etudiant.service.js', () => ({
    calculerEtMettreAJourScoreCredibilite: mockCalculerScore,
}));

const {
    creerActivite,
    validerActivite,
    recupererToutesLesActivites,
    recupererActiviteParId,
    recupererActivitesAValider,
    recupererActivitesParEtudiant,
    modifierActivite,
    associerAttestation,
    supprimerAttestation,
    supprimerActivite,
} = await import('#Modules/parcours/activiteParascolaire/activiteParascolaire.service.js');

// ─────────────────────────────────────────────────
const mockActiviteBase = {
    id_activite: 'act-1',
    nom_activite: 'Club Robotique',
    id_etudiant: 'etu-1',
    id_validateur: null,
    id_attestation: null,
    date_soumission: new Date(),
    attestation: null,
};

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('creerActivite', () => {

    test('lève une erreur si id_etudiant est absent', async () => {
        await expect(creerActivite({ nom_activite: 'Club', date_debut: '2024-01-01' }))
            .rejects.toThrow("L'ID de l'étudiant est requis");
    });

    test('crée une activité et notifie les admins de l\'école', async () => {
        mockActiviteModel.create.mockResolvedValue({ ...mockActiviteBase });
        mockUtilisateurModel.findUnique.mockResolvedValue({ ecole: 'ENSIA' });
        mockUtilisateurModel.findMany.mockResolvedValue([
            { id_utilisateur: 'admin-1' },
            { id_utilisateur: 'admin-2' },
        ]);

        const result = await creerActivite({ id_etudiant: 'etu-1', nom_activite: 'Club Robotique', date_debut: '2024-01-01' });

        expect(mockActiviteModel.create).toHaveBeenCalledTimes(1);
        expect(mockCreerNotification).toHaveBeenCalledTimes(2);
        expect(mockCreerNotification).toHaveBeenCalledWith('admin-1', 'VALIDATION', expect.any(String), expect.any(String));
        expect(result).toMatchObject({ id_activite: 'act-1' });
    });

    test('crée une activité sans notifier si l\'étudiant n\'a pas d\'école', async () => {
        mockActiviteModel.create.mockResolvedValue({ ...mockActiviteBase });
        mockUtilisateurModel.findUnique.mockResolvedValue({ ecole: null });

        await creerActivite({ id_etudiant: 'etu-1', nom_activite: 'Club', date_debut: '2024-01-01' });

        expect(mockCreerNotification).not.toHaveBeenCalled();
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockActiviteModel.create.mockRejectedValue(new Error('DB error'));
        mockUtilisateurModel.findUnique.mockResolvedValue({ ecole: null });

        await expect(creerActivite({ id_etudiant: 'etu-1', nom_activite: 'X', date_debut: '2024-01-01' }))
            .rejects.toThrow('DB error');
    });
});

// ─────────────────────────────────────────────────
describe('validerActivite', () => {

    const mockActiviteAvecEtudiant = {
        ...mockActiviteBase,
        id_etudiant: 'etu-1',
        etudiant: { utilisateur: { ecole: 'ENSIA' } },
    };

    test('valide (VALIDE) → notification + historique + calcul score', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(mockActiviteAvecEtudiant);
        mockUtilisateurModel.findUnique.mockResolvedValue({ role: 'ADMINISTRATEUR', ecole: 'ENSIA' });
        mockActiviteModel.update.mockResolvedValue({ ...mockActiviteBase, status_validation: 'VALIDE' });
        mockHistoriqueValidationModel.create.mockResolvedValue({});

        const result = await validerActivite('act-1', 'admin-1', 'VALIDE', 'Bien');

        expect(mockActiviteModel.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ status_validation: 'VALIDE', id_validateur: 'admin-1' }) })
        );
        expect(mockCreerNotification).toHaveBeenCalledTimes(1);
        expect(mockHistoriqueValidationModel.create).toHaveBeenCalledTimes(1);
        expect(mockCalculerScore).toHaveBeenCalledWith('etu-1');
        expect(result.status_validation).toBe('VALIDE');
    });

    test('rejette (REJETE) → pas de calcul score', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(mockActiviteAvecEtudiant);
        mockUtilisateurModel.findUnique.mockResolvedValue({ role: 'ADMINISTRATEUR', ecole: 'ENSIA' });
        mockActiviteModel.update.mockResolvedValue({ ...mockActiviteBase, status_validation: 'REJETE' });
        mockHistoriqueValidationModel.create.mockResolvedValue({});

        await validerActivite('act-1', 'admin-1', 'REJETE', 'Non conforme');

        expect(mockCalculerScore).not.toHaveBeenCalled();
    });

    test('lève une erreur si l\'activité n\'existe pas', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(null);
        await expect(validerActivite('act-x', 'admin-1', 'VALIDE')).rejects.toThrow('Activité non trouvée');
    });

    test('lève une erreur si le validateur n\'est pas admin', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(mockActiviteAvecEtudiant);
        mockUtilisateurModel.findUnique.mockResolvedValue({ role: 'PROFESSEUR', ecole: 'ENSIA' });

        await expect(validerActivite('act-1', 'prof-1', 'VALIDE'))
            .rejects.toThrow('Seul un administrateur peut valider');
    });

    test('lève une erreur si l\'admin n\'est pas de la même école', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(mockActiviteAvecEtudiant);
        mockUtilisateurModel.findUnique.mockResolvedValue({ role: 'ADMINISTRATEUR', ecole: 'ENSEM' });

        await expect(validerActivite('act-1', 'admin-autre', 'VALIDE'))
            .rejects.toThrow('votre école');
    });
});

// ─────────────────────────────────────────────────
describe('recupererToutesLesActivites', () => {

    test('retourne les activités enrichies avec URLs', async () => {
        const mock = [mockActiviteBase];
        mockActiviteModel.findMany.mockResolvedValue(mock);

        const result = await recupererToutesLesActivites();

        expect(mockActiviteModel.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
        expect(mockEnrichEntitiesWithFileUrls).toHaveBeenCalledWith(mock, 'attestation');
        expect(result).toEqual(mock);
    });

    test('applique les filtres fournis', async () => {
        mockActiviteModel.findMany.mockResolvedValue([]);
        await recupererToutesLesActivites({ status_validation: 'VALIDE' });
        expect(mockActiviteModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { status_validation: 'VALIDE' } })
        );
    });
});

// ─────────────────────────────────────────────────
describe('recupererActiviteParId', () => {

    test('retourne l\'activité enrichie', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(mockActiviteBase);
        const result = await recupererActiviteParId('act-1');
        expect(mockEnrichEntityWithFileUrls).toHaveBeenCalledWith(mockActiviteBase, 'attestation');
        expect(result).toEqual(mockActiviteBase);
    });

    test('retourne null si non trouvée', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(null);
        expect(await recupererActiviteParId('act-x')).toBeNull();
    });
});

// ─────────────────────────────────────────────────
describe('recupererActivitesAValider', () => {

    test('retourne [] si l\'admin n\'a pas d\'école', async () => {
        mockUtilisateurModel.findUnique.mockResolvedValue({ ecole: null });
        const result = await recupererActivitesAValider('admin-1');
        expect(result).toEqual([]);
        expect(mockActiviteModel.findMany).not.toHaveBeenCalled();
    });

    test('retourne [] si l\'admin est introuvable', async () => {
        mockUtilisateurModel.findUnique.mockResolvedValue(null);
        const result = await recupererActivitesAValider('admin-x');
        expect(result).toEqual([]);
    });

    test('retourne les activités EN_ATTENTE de l\'école de l\'admin', async () => {
        mockUtilisateurModel.findUnique.mockResolvedValue({ ecole: 'ENSIA' });
        mockActiviteModel.findMany.mockResolvedValue([mockActiviteBase]);

        const result = await recupererActivitesAValider('admin-1');

        expect(mockActiviteModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: expect.objectContaining({ status_validation: 'EN_ATTENTE' }) })
        );
        expect(mockEnrichEntitiesWithFileUrls).toHaveBeenCalledWith([mockActiviteBase], 'attestation');
        expect(result).toEqual([mockActiviteBase]);
    });
});

// ─────────────────────────────────────────────────
describe('recupererActivitesParEtudiant', () => {

    test('retourne les activités de l\'étudiant', async () => {
        mockActiviteModel.findMany.mockResolvedValue([mockActiviteBase]);
        const result = await recupererActivitesParEtudiant('etu-1');
        expect(mockActiviteModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_etudiant: 'etu-1' } })
        );
        expect(result).toEqual([mockActiviteBase]);
    });
});

// ─────────────────────────────────────────────────
describe('modifierActivite', () => {

    test('modifie si l\'utilisateur est admin', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase });
        mockActiviteModel.update.mockResolvedValue({ ...mockActiviteBase, nom_activite: 'Modifié' });

        const result = await modifierActivite('act-1', { nom_activite: 'Modifié' }, 'admin-1', 'ADMINISTRATEUR');

        expect(mockActiviteModel.update).toHaveBeenCalledTimes(1);
        expect(result.nom_activite).toBe('Modifié');
    });

    test('modifie si l\'utilisateur est le propriétaire', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_etudiant: 'etu-1' });
        mockActiviteModel.update.mockResolvedValue({ ...mockActiviteBase, nom_activite: 'Modifié' });

        await modifierActivite('act-1', { nom_activite: 'Modifié' }, 'etu-1', 'ETUDIANT');

        expect(mockActiviteModel.update).toHaveBeenCalledTimes(1);
    });

    test('lève une erreur si non autorisé', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_etudiant: 'etu-1' });

        await expect(modifierActivite('act-1', {}, 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé");
    });

    test('lève une erreur si activité non trouvée', async () => {
        mockActiviteModel.findUnique.mockResolvedValue(null);
        await expect(modifierActivite('act-x', {}, 'etu-1', 'ETUDIANT')).rejects.toThrow('Activité non trouvée');
    });
});

// ─────────────────────────────────────────────────
describe('associerAttestation', () => {

    test('upload sans ancienne attestation', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_attestation: null });
        mockUploadAndSaveFile.mockResolvedValue({ id_fichier: 'f-new' });
        mockActiviteModel.update.mockResolvedValue({});

        const result = await associerAttestation('act-1', { originalname: 'att.pdf' }, 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).not.toHaveBeenCalled();
        expect(mockUploadAndSaveFile).toHaveBeenCalledWith({ originalname: 'att.pdf' }, 'etu-1', 'ATTESTATION');
        expect(result).toEqual({ id_fichier: 'f-new' });
    });

    test('supprime l\'ancienne attestation avant d\'uploader', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_attestation: 'f-old', id_etudiant: 'etu-1' });
        mockUploadAndSaveFile.mockResolvedValue({ id_fichier: 'f-new' });
        mockActiviteModel.update.mockResolvedValue({});

        await associerAttestation('act-1', { originalname: 'att.pdf' }, 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).toHaveBeenCalledWith('f-old');
        expect(mockUploadAndSaveFile).toHaveBeenCalledTimes(1);
    });

    test('lève une erreur si non autorisé', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_etudiant: 'etu-1' });

        await expect(associerAttestation('act-1', {}, 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé");
    });
});

// ─────────────────────────────────────────────────
describe('supprimerAttestation', () => {

    test('supprime l\'attestation et détache', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_attestation: 'f-1' });
        mockActiviteModel.update.mockResolvedValue({ ...mockActiviteBase, id_attestation: null });

        await supprimerAttestation('act-1', 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).toHaveBeenCalledWith('f-1');
        expect(mockActiviteModel.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { id_attestation: null } })
        );
    });

    test('lève une erreur si aucune attestation', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_attestation: null });

        await expect(supprimerAttestation('act-1', 'etu-1', 'ETUDIANT'))
            .rejects.toThrow('Aucune attestation associée');
    });
});

// ─────────────────────────────────────────────────
describe('supprimerActivite', () => {

    test('supprime sans attestation', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_attestation: null });
        mockActiviteModel.delete.mockResolvedValue(mockActiviteBase);

        await supprimerActivite('act-1', 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).not.toHaveBeenCalled();
        expect(mockActiviteModel.delete).toHaveBeenCalledTimes(1);
    });

    test('supprime le fichier MinIO avant de supprimer l\'activité', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_attestation: 'f-1', id_etudiant: 'etu-1' });
        mockActiviteModel.delete.mockResolvedValue(mockActiviteBase);

        await supprimerActivite('act-1', 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).toHaveBeenCalledWith('f-1');
        expect(mockActiviteModel.delete).toHaveBeenCalledTimes(1);
    });

    test('lève une erreur si non autorisé', async () => {
        mockActiviteModel.findUnique.mockResolvedValue({ ...mockActiviteBase, id_etudiant: 'etu-1' });

        await expect(supprimerActivite('act-1', 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé");
    });
});