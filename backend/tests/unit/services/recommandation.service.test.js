import { jest } from '@jest/globals';
import { mockPrisma } from '../../mocks/prismaMock.js';

// --- Mocks ---
await jest.unstable_mockModule('#Config/prismaClient.js', () => ({
    default: mockPrisma,
}));

const mockCreerNotification = jest.fn().mockResolvedValue(undefined);
await jest.unstable_mockModule('#Modules/systeme/notifications/notifications.service.js', () => ({
    creerNotification: mockCreerNotification,
}));

const mockCalculerScore = jest.fn().mockResolvedValue(undefined);
await jest.unstable_mockModule('#Modules/identite/etudiant/etudiant.service.js', () => ({
    calculerEtMettreAJourScoreCredibilite: mockCalculerScore,
}));

const {
    creerRecommandation,
    recupererRecommandations,
    recupererRecommandationParId,
    validerRecommandation,
    supprimerRecommandation,
    recupererRecommandationsValidees,
    recupererRecommandationsRecus,
    recupererRecommandationsEmises,
} = await import('#Modules/systeme/recommandation/recommandation.service.js');

// mockPrisma n'a pas de modèle recommandation — on l'ajoute dynamiquement
const mockRecommandationModel = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
mockPrisma.recommandation = mockRecommandationModel;

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('creerRecommandation', () => {

    test('crée une recommandation et envoie une notification à l\'étudiant', async () => {
        const mockResult = {
            id_recommandation: 'r-1',
            id_etudiant: 'etu-1',
            auteur: { nom: 'Dupont', prenom: 'Jean', photo: null, role: 'PROFESSIONNEL' }
        };
        mockRecommandationModel.create.mockResolvedValue(mockResult);

        const result = await creerRecommandation('pro-1', { id_etudiant: 'etu-1', message: 'Excellent étudiant' });

        expect(mockRecommandationModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id_recommandeur: 'pro-1',
                    id_etudiant: 'etu-1',
                    message: 'Excellent étudiant',
                    status: 'EN_ATTENTE'
                })
            })
        );
        expect(mockCreerNotification).toHaveBeenCalledWith(
            'etu-1', 'RECOMMANDATION', 'Nouvelle recommandation', expect.stringContaining('Jean'), expect.any(String)
        );
        expect(result).toEqual(mockResult);
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockRecommandationModel.create.mockRejectedValue(new Error('DB error'));
        await expect(creerRecommandation('pro-1', { id_etudiant: 'etu-1', message: 'X' }))
            .rejects.toThrow('DB error');
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandations', () => {

    test('retourne toutes les recommandations sans filtre', async () => {
        const mock = [{ id_recommandation: 'r-1' }, { id_recommandation: 'r-2' }];
        mockRecommandationModel.findMany.mockResolvedValue(mock);

        const result = await recupererRecommandations();

        expect(mockRecommandationModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: {} })
        );
        expect(result).toEqual(mock);
    });

    test('applique les filtres fournis', async () => {
        mockRecommandationModel.findMany.mockResolvedValue([]);

        await recupererRecommandations({ status: 'VALIDE', id_etudiant: 'etu-1' });

        expect(mockRecommandationModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { status: 'VALIDE', id_etudiant: 'etu-1' } })
        );
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockRecommandationModel.findMany.mockRejectedValue(new Error('DB error'));
        await expect(recupererRecommandations()).rejects.toThrow('DB error');
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandationParId', () => {

    test('retourne la recommandation trouvée', async () => {
        const mock = { id_recommandation: 'r-1', message: 'Bon' };
        mockRecommandationModel.findUnique.mockResolvedValue(mock);

        const result = await recupererRecommandationParId('r-1');

        expect(mockRecommandationModel.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_recommandation: 'r-1' } })
        );
        expect(result).toEqual(mock);
    });

    test('retourne null si non trouvée', async () => {
        mockRecommandationModel.findUnique.mockResolvedValue(null);
        expect(await recupererRecommandationParId('r-x')).toBeNull();
    });
});

// ─────────────────────────────────────────────────
describe('validerRecommandation', () => {

    test('valide (VALIDE) → notification + calcul score crédibilité', async () => {
        const mock = { id_recommandation: 'r-1', id_recommandeur: 'pro-1', id_etudiant: 'etu-1', status: 'VALIDE' };
        mockRecommandationModel.update.mockResolvedValue(mock);

        const result = await validerRecommandation('r-1', 'VALIDE');

        expect(mockRecommandationModel.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id_recommandation: 'r-1' },
                data: expect.objectContaining({ status: 'VALIDE', date_validation: expect.any(Date) })
            })
        );
        expect(mockCreerNotification).toHaveBeenCalledWith(
            'pro-1', 'VALIDATION', expect.stringContaining('acceptée'), expect.any(String), null
        );
        expect(mockCalculerScore).toHaveBeenCalledWith('etu-1');
        expect(result).toEqual(mock);
    });

    test('rejette (REJETE) → notification sans calcul score', async () => {
        const mock = { id_recommandation: 'r-1', id_recommandeur: 'pro-1', id_etudiant: 'etu-1', status: 'REJETE' };
        mockRecommandationModel.update.mockResolvedValue(mock);

        await validerRecommandation('r-1', 'REJETE');

        expect(mockCreerNotification).toHaveBeenCalledWith(
            'pro-1', 'VALIDATION', expect.stringContaining('refusée'), expect.any(String), null
        );
        expect(mockCalculerScore).not.toHaveBeenCalled();
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockRecommandationModel.update.mockRejectedValue(new Error('DB error'));
        await expect(validerRecommandation('r-x', 'VALIDE')).rejects.toThrow('DB error');
    });
});

// ─────────────────────────────────────────────────
describe('supprimerRecommandation', () => {

    test('supprime la recommandation', async () => {
        const mock = { id_recommandation: 'r-1' };
        mockRecommandationModel.delete.mockResolvedValue(mock);

        const result = await supprimerRecommandation('r-1');

        expect(mockRecommandationModel.delete).toHaveBeenCalledWith({ where: { id_recommandation: 'r-1' } });
        expect(result).toEqual(mock);
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockRecommandationModel.delete.mockRejectedValue(new Error('DB error'));
        await expect(supprimerRecommandation('r-x')).rejects.toThrow('DB error');
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandationsValidees', () => {

    test('filtre sur id_etudiant et status VALIDE', async () => {
        mockRecommandationModel.findMany.mockResolvedValue([]);

        await recupererRecommandationsValidees('etu-1');

        expect(mockRecommandationModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_etudiant: 'etu-1', status: 'VALIDE' } })
        );
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandationsRecus', () => {

    test('filtre uniquement sur id_etudiant', async () => {
        mockRecommandationModel.findMany.mockResolvedValue([]);

        await recupererRecommandationsRecus('etu-1');

        expect(mockRecommandationModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_etudiant: 'etu-1' } })
        );
    });
});

// ─────────────────────────────────────────────────
describe('recupererRecommandationsEmises', () => {

    test('filtre sur id_recommandeur', async () => {
        mockRecommandationModel.findMany.mockResolvedValue([]);

        await recupererRecommandationsEmises('pro-1');

        expect(mockRecommandationModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id_recommandeur: 'pro-1' } })
        );
    });
});