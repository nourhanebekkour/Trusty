import { jest } from '@jest/globals';

// --- Mocks Prisma (@prisma/client instancié directement dans le service) ---
const mockProjetModel = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
const mockEtudiantModel = { findUnique: jest.fn() };
const mockProfesseurModel = { findUnique: jest.fn() };
const mockParticipationProjetModel = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
const mockProjetTechnologieModel = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
const mockHistoriqueValidationModel = { create: jest.fn() };

const mockPrismaInstance = {
    projet: mockProjetModel,
    etudiant: mockEtudiantModel,
    professeur: mockProfesseurModel,
    participationProjet: mockParticipationProjetModel,
    projetTechnologie: mockProjetTechnologieModel,
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
const mockEnrichEntitiesWithFileUrls = jest.fn(entities => Promise.resolve(entities));
const mockEnrichEntityWithFileUrls = jest.fn(entity => Promise.resolve(entity));
const mockUploadAndSaveFile = jest.fn();
const mockDeleteFile = jest.fn().mockResolvedValue(undefined);
const mockGetFileUrl = jest.fn().mockResolvedValue('https://minio/file.pdf');
const mockGetFileInfo = jest.fn();

await jest.unstable_mockModule('#Services/minio.service.js', () => ({
    enrichEntitiesWithFileUrls: mockEnrichEntitiesWithFileUrls,
    enrichEntityWithFileUrls: mockEnrichEntityWithFileUrls,
    uploadAndSaveFile: mockUploadAndSaveFile,
    deleteFile: mockDeleteFile,
    getFileUrl: mockGetFileUrl,
    getFileInfo: mockGetFileInfo,
}));

// --- Mock etudiant.service (importé mais non utilisé dans ce service) ---
await jest.unstable_mockModule('#Modules/identite/etudiant/etudiant.service.js', () => ({
    calculerEtMettreAJourScoreCredibilite: jest.fn(),
}));

// Import du service après tous les mocks
const {
    creerProjet,
    validerProjet,
    recupererTousLesProjets,
    recupererProjetParId,
    recupererProjetsAValider,
    recupererProjetsParEtudiant,
    modifierProjet,
    supprimerProjet,
    ajouterFichier,
    listerFichiers,
    supprimerFichier,
    ajouterParticipant,
    modifierParticipant,
    retirerParticipant,
    ajouterTechnologieProjet,
    modifierTechnologieProjet,
    retirerTechnologieProjet,
} = await import('#Modules/parcours/projet/projet.service.js');

// ─────────────────────────────────────────────────
const mockProjetBase = {
    id_projet: 'proj-1',
    titre: 'Mon projet',
    id_validateur: 'prof-1',
    date_soumission: new Date(),
    participations: [
        { id_etudiant: 'etu-1', est_createur: true }
    ],
    fichiers: [],
    technologies: [],
};

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────
describe('creerProjet', () => {

    test('crée un projet sans validateur', async () => {
        const donnees = {
            id_etudiant: 'etu-1',
            titre: 'Projet A',
            date_debut: '2024-01-01',
        };
        mockProjetModel.create.mockResolvedValue({ ...mockProjetBase, titre: 'Projet A' });

        const result = await creerProjet(donnees);

        expect(mockProjetModel.create).toHaveBeenCalledTimes(1);
        expect(mockCreerNotification).not.toHaveBeenCalled();
        expect(result.titre).toBe('Projet A');
    });

    test('crée un projet avec validateur et envoie une notification', async () => {
        mockEtudiantModel.findUnique.mockResolvedValue({
            utilisateur: { ecole: 'ENSIA' }
        });
        mockProfesseurModel.findUnique.mockResolvedValue({
            utilisateur: { ecole: 'ENSIA' }
        });
        mockProjetModel.create.mockResolvedValue({ ...mockProjetBase, titre: 'Projet B' });

        const donnees = {
            id_etudiant: 'etu-1',
            id_validateur: 'prof-1',
            titre: 'Projet B',
            date_debut: '2024-01-01',
        };

        const result = await creerProjet(donnees);

        expect(mockCreerNotification).toHaveBeenCalledWith(
            'prof-1', 'VALIDATION', 'Nouveau projet à valider', expect.any(String)
        );
        expect(result.titre).toBe('Projet B');
    });

    test('lève une erreur si id_etudiant est absent', async () => {
        await expect(creerProjet({ titre: 'X', date_debut: '2024-01-01' }))
            .rejects.toThrow("L'ID de l'étudiant créateur est requis");
    });

    test('lève une erreur si le professeur n\'appartient pas à la même école', async () => {
        mockEtudiantModel.findUnique.mockResolvedValue({
            utilisateur: { ecole: 'ENSIA' }
        });
        mockProfesseurModel.findUnique.mockResolvedValue({
            utilisateur: { ecole: 'ENSEM' }
        });

        await expect(creerProjet({
            id_etudiant: 'etu-1',
            id_validateur: 'prof-2',
            titre: 'X',
            date_debut: '2024-01-01',
        })).rejects.toThrow('même école');
    });

    test('lève une erreur si le professeur n\'existe pas', async () => {
        mockEtudiantModel.findUnique.mockResolvedValue({
            utilisateur: { ecole: 'ENSIA' }
        });
        mockProfesseurModel.findUnique.mockResolvedValue(null);

        await expect(creerProjet({
            id_etudiant: 'etu-1',
            id_validateur: 'prof-inexistant',
            titre: 'X',
            date_debut: '2024-01-01',
        })).rejects.toThrow("Le professeur choisi n'existe pas");
    });
});

// ─────────────────────────────────────────────────
describe('validerProjet', () => {

    test('valide un projet (VALIDE) et envoie une notification + historique', async () => {
        mockProjetModel.findUnique.mockResolvedValue({ ...mockProjetBase });
        mockProjetModel.update.mockResolvedValue({
            ...mockProjetBase,
            status_validation: 'VALIDE',
            participations: [{ id_etudiant: 'etu-1' }],
        });
        mockHistoriqueValidationModel.create.mockResolvedValue({});

        const result = await validerProjet('proj-1', 'prof-1', 'VALIDE', 'Bon travail', 'A+');

        expect(mockProjetModel.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ status_validation: 'VALIDE' }) })
        );
        expect(mockCreerNotification).toHaveBeenCalledWith(
            'etu-1', 'VALIDATION', expect.stringContaining('validé'), expect.any(String)
        );
        expect(mockHistoriqueValidationModel.create).toHaveBeenCalledTimes(1);
        expect(result.status_validation).toBe('VALIDE');
    });

    test('rejette un projet (REJETE)', async () => {
        mockProjetModel.findUnique.mockResolvedValue({ ...mockProjetBase });
        mockProjetModel.update.mockResolvedValue({
            ...mockProjetBase,
            status_validation: 'REJETE',
            participations: [{ id_etudiant: 'etu-1' }],
        });
        mockHistoriqueValidationModel.create.mockResolvedValue({});

        await validerProjet('proj-1', 'prof-1', 'REJETE', 'À retravailler', 'C');

        expect(mockCreerNotification).toHaveBeenCalledWith(
            'etu-1', 'VALIDATION', expect.stringContaining('rejeté'), expect.any(String)
        );
    });

    test('lève une erreur si le projet n\'existe pas', async () => {
        mockProjetModel.findUnique.mockResolvedValue(null);

        await expect(validerProjet('proj-x', 'prof-1', 'VALIDE'))
            .rejects.toThrow('Projet non trouvé');
    });

    test('lève une erreur si ce n\'est pas le bon validateur', async () => {
        mockProjetModel.findUnique.mockResolvedValue({ ...mockProjetBase, id_validateur: 'prof-1' });

        await expect(validerProjet('proj-1', 'prof-autre', 'VALIDE'))
            .rejects.toThrow("Vous n'êtes pas le validateur désigné pour ce projet");
    });
});

// ─────────────────────────────────────────────────
describe('recupererTousLesProjets', () => {

    test('retourne la liste des projets avec URLs enrichies', async () => {
        const projets = [mockProjetBase];
        mockProjetModel.findMany.mockResolvedValue(projets);

        const result = await recupererTousLesProjets();

        expect(mockProjetModel.findMany).toHaveBeenCalledTimes(1);
        expect(mockEnrichEntitiesWithFileUrls).toHaveBeenCalledWith(projets, 'fichiers');
        expect(result).toEqual(projets);
    });

    test('propage l\'erreur si Prisma échoue', async () => {
        mockProjetModel.findMany.mockRejectedValue(new Error('DB error'));
        await expect(recupererTousLesProjets()).rejects.toThrow('DB error');
    });
});

// ─────────────────────────────────────────────────
describe('recupererProjetParId', () => {

    test('retourne le projet avec URLs enrichies', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);

        const result = await recupererProjetParId('proj-1');

        expect(mockEnrichEntityWithFileUrls).toHaveBeenCalledWith(mockProjetBase, 'fichiers');
        expect(result).toEqual(mockProjetBase);
    });

    test('retourne null si projet non trouvé', async () => {
        mockProjetModel.findUnique.mockResolvedValue(null);

        const result = await recupererProjetParId('proj-x');
        expect(result).toBeNull();
    });
});

// ─────────────────────────────────────────────────
describe('recupererProjetsAValider', () => {

    test('retourne les projets EN_ATTENTE affectés au professeur', async () => {
        const projets = [mockProjetBase];
        mockProjetModel.findMany.mockResolvedValue(projets);

        const result = await recupererProjetsAValider('prof-1');

        expect(mockProjetModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id_validateur: 'prof-1', status_validation: 'EN_ATTENTE' }
            })
        );
        expect(mockEnrichEntitiesWithFileUrls).toHaveBeenCalledWith(projets, 'fichiers');
        expect(result).toEqual(projets);
    });
});

// ─────────────────────────────────────────────────
describe('recupererProjetsParEtudiant', () => {

    test('retourne les projets auxquels l\'étudiant participe', async () => {
        const projets = [mockProjetBase];
        mockProjetModel.findMany.mockResolvedValue(projets);

        const result = await recupererProjetsParEtudiant('etu-1');

        expect(mockProjetModel.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { participations: { some: { id_etudiant: 'etu-1' } } }
            })
        );
        expect(result).toEqual(projets);
    });
});

// ─────────────────────────────────────────────────
describe('modifierProjet', () => {

    test('modifie le projet si l\'utilisateur est administrateur', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        mockProjetModel.update.mockResolvedValue({ ...mockProjetBase, titre: 'Modifié' });

        const result = await modifierProjet('proj-1', { titre: 'Modifié' }, 'admin-1', 'ADMINISTRATEUR');

        expect(mockProjetModel.update).toHaveBeenCalledTimes(1);
        expect(result.titre).toBe('Modifié');
    });

    test('modifie le projet si l\'utilisateur est participant', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1', est_createur: true }],
        });
        mockProjetModel.update.mockResolvedValue({ ...mockProjetBase, titre: 'Modifié par etu' });

        const result = await modifierProjet('proj-1', { titre: 'Modifié par etu' }, 'etu-1', 'ETUDIANT');

        expect(result.titre).toBe('Modifié par etu');
    });

    test('lève une erreur si l\'utilisateur n\'est pas autorisé', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1' }],
        });

        await expect(modifierProjet('proj-1', {}, 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé à accéder à ce projet");
    });

    test('lève une erreur si le projet n\'existe pas', async () => {
        mockProjetModel.findUnique.mockResolvedValue(null);

        await expect(modifierProjet('proj-x', {}, 'etu-1', 'ETUDIANT'))
            .rejects.toThrow('Projet non trouvé');
    });

    test('valide l\'école si un nouveau validateur est fourni', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1', est_createur: true }],
        });
        mockEtudiantModel.findUnique.mockResolvedValue({ utilisateur: { ecole: 'ENSIA' } });
        mockProfesseurModel.findUnique.mockResolvedValue({ utilisateur: { ecole: 'ENSIA' } });
        mockProjetModel.update.mockResolvedValue(mockProjetBase);

        await modifierProjet('proj-1', { id_validateur: 'prof-2' }, 'etu-1', 'ETUDIANT');

        expect(mockEtudiantModel.findUnique).toHaveBeenCalledTimes(1);
        expect(mockProfesseurModel.findUnique).toHaveBeenCalledTimes(1);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerProjet', () => {

    test('supprime le projet sans fichiers', async () => {
        mockProjetModel.findUnique.mockResolvedValue({ ...mockProjetBase, fichiers: [] });
        mockProjetModel.delete.mockResolvedValue(mockProjetBase);

        const result = await supprimerProjet('proj-1', 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).not.toHaveBeenCalled();
        expect(mockProjetModel.delete).toHaveBeenCalledTimes(1);
    });

    test('supprime les fichiers MinIO avant de supprimer le projet', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1' }],
            fichiers: [{ id_fichier: 'f-1' }, { id_fichier: 'f-2' }],
        });
        mockProjetModel.delete.mockResolvedValue(mockProjetBase);

        await supprimerProjet('proj-1', 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).toHaveBeenCalledTimes(2);
        expect(mockDeleteFile).toHaveBeenCalledWith('f-1');
        expect(mockDeleteFile).toHaveBeenCalledWith('f-2');
    });

    test('lève une erreur si l\'utilisateur n\'est pas autorisé', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1' }],
        });

        await expect(supprimerProjet('proj-1', 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé");
    });
});

// ─────────────────────────────────────────────────
describe('ajouterFichier', () => {

    test('ajoute un fichier si l\'utilisateur est autorisé', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        const mockFileRecord = { id_fichier: 'f-new', nom_stockage: 'proj/file.pdf' };
        mockUploadAndSaveFile.mockResolvedValue(mockFileRecord);

        const result = await ajouterFichier('proj-1', { originalname: 'file.pdf' }, 'etu-1', 'ETUDIANT', 'PROJET');

        expect(mockUploadAndSaveFile).toHaveBeenCalledWith(
            { originalname: 'file.pdf' }, 'etu-1', 'PROJET', { id_projet: 'proj-1' }
        );
        expect(result).toEqual(mockFileRecord);
    });

    test('lève une erreur si l\'utilisateur n\'est pas autorisé', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1' }],
        });

        await expect(ajouterFichier('proj-1', {}, 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé");
    });
});

// ─────────────────────────────────────────────────
describe('listerFichiers', () => {

    test('retourne les fichiers avec leurs URLs', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            fichiers: [{ id_fichier: 'f-1', nom_stockage: 'proj/f1.pdf' }],
        });

        const result = await listerFichiers('proj-1');

        expect(mockGetFileUrl).toHaveBeenCalledWith('proj/f1.pdf');
        expect(result[0]).toMatchObject({ id_fichier: 'f-1', url: 'https://minio/file.pdf' });
    });

    test('lève une erreur si le projet n\'existe pas', async () => {
        mockProjetModel.findUnique.mockResolvedValue(null);

        await expect(listerFichiers('proj-x')).rejects.toThrow('Projet non trouvé');
    });

    test('retourne tableau vide si aucun fichier', async () => {
        mockProjetModel.findUnique.mockResolvedValue({ ...mockProjetBase, fichiers: [] });

        const result = await listerFichiers('proj-1');
        expect(result).toEqual([]);
    });
});

// ─────────────────────────────────────────────────
describe('supprimerFichier', () => {

    test('supprime le fichier s\'il appartient au projet', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        mockGetFileInfo.mockResolvedValue({ id_fichier: 'f-1', id_projet: 'proj-1' });
        mockDeleteFile.mockResolvedValue({ deleted: true });

        const result = await supprimerFichier('proj-1', 'f-1', 'etu-1', 'ETUDIANT');

        expect(mockDeleteFile).toHaveBeenCalledWith('f-1');
        expect(result).toEqual({ deleted: true });
    });

    test('lève une erreur si le fichier n\'appartient pas au projet', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        mockGetFileInfo.mockResolvedValue({ id_fichier: 'f-1', id_projet: 'autre-projet' });

        await expect(supprimerFichier('proj-1', 'f-1', 'etu-1', 'ETUDIANT'))
            .rejects.toThrow("Fichier non trouvé ou n'appartient pas à ce projet");
    });
});

// ─────────────────────────────────────────────────
describe('ajouterParticipant', () => {

    test('ajoute un participant si l\'utilisateur est autorisé', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        const mockParticipation = { id_projet: 'proj-1', id_etudiant: 'etu-2', role_joue: 'Dev' };
        mockParticipationProjetModel.create.mockResolvedValue(mockParticipation);

        const result = await ajouterParticipant(
            'proj-1', 'etu-2',
            { role_joue: 'Dev', date_debut: '2024-01-01' },
            'etu-1', 'ETUDIANT'
        );

        expect(mockParticipationProjetModel.create).toHaveBeenCalledTimes(1);
        expect(result.role_joue).toBe('Dev');
    });

    test('lève une erreur si l\'utilisateur n\'est pas autorisé', async () => {
        mockProjetModel.findUnique.mockResolvedValue({
            ...mockProjetBase,
            participations: [{ id_etudiant: 'etu-1' }],
        });

        await expect(ajouterParticipant('proj-1', 'etu-2', {}, 'etu-autre', 'ETUDIANT'))
            .rejects.toThrow("Vous n'êtes pas autorisé");
    });
});

// ─────────────────────────────────────────────────
describe('modifierParticipant', () => {

    test('modifie la participation', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        const mockUpdated = { id_projet: 'proj-1', id_etudiant: 'etu-1', role_joue: 'Lead' };
        mockParticipationProjetModel.update.mockResolvedValue(mockUpdated);

        const result = await modifierParticipant('proj-1', 'etu-1', { role_joue: 'Lead' }, 'etu-1', 'ETUDIANT');

        expect(mockParticipationProjetModel.update).toHaveBeenCalledTimes(1);
        expect(result.role_joue).toBe('Lead');
    });
});

// ─────────────────────────────────────────────────
describe('retirerParticipant', () => {

    test('retire un participant', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        mockParticipationProjetModel.delete.mockResolvedValue({ deleted: true });

        const result = await retirerParticipant('proj-1', 'etu-1', 'etu-1', 'ETUDIANT');

        expect(mockParticipationProjetModel.delete).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ deleted: true });
    });
});

// ─────────────────────────────────────────────────
describe('ajouterTechnologieProjet', () => {

    test('ajoute une technologie au projet', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        const mockTech = { id_projet: 'proj-1', id_technologie: 'tech-1', version: '3.0' };
        mockProjetTechnologieModel.create.mockResolvedValue(mockTech);

        const result = await ajouterTechnologieProjet(
            'proj-1', 'tech-1',
            { version: '3.0', niveau_utilisation: 'AVANCE' },
            'etu-1', 'ETUDIANT'
        );

        expect(mockProjetTechnologieModel.create).toHaveBeenCalledTimes(1);
        expect(result.version).toBe('3.0');
    });
});

// ─────────────────────────────────────────────────
describe('modifierTechnologieProjet', () => {

    test('modifie la technologie du projet', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        const mockUpdated = { id_projet: 'proj-1', id_technologie: 'tech-1', version: '4.0' };
        mockProjetTechnologieModel.update.mockResolvedValue(mockUpdated);

        const result = await modifierTechnologieProjet('proj-1', 'tech-1', { version: '4.0' }, 'etu-1', 'ETUDIANT');

        expect(mockProjetTechnologieModel.update).toHaveBeenCalledTimes(1);
        expect(result.version).toBe('4.0');
    });
});

// ─────────────────────────────────────────────────
describe('retirerTechnologieProjet', () => {

    test('retire la technologie du projet', async () => {
        mockProjetModel.findUnique.mockResolvedValue(mockProjetBase);
        mockProjetTechnologieModel.delete.mockResolvedValue({ deleted: true });

        const result = await retirerTechnologieProjet('proj-1', 'tech-1', 'etu-1', 'ETUDIANT');

        expect(mockProjetTechnologieModel.delete).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ deleted: true });
    });
});
