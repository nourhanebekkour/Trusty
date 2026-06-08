import { jest } from '@jest/globals';

// Le service stage instancie son propre PrismaClient → on mock @prisma/client directement
const mockStageModel = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
};
const mockEtudiantModel = { findUnique: jest.fn() };
const mockProfesseurModel = { findUnique: jest.fn() };
const mockStageTechnologieModel = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
const mockHistoriqueValidationModel = { create: jest.fn() };

// L'instance mockée que PrismaClient() retournera
const mockPrismaInstance = {
    stage: mockStageModel,
    etudiant: mockEtudiantModel,
    professeur: mockProfesseurModel,
    stageTechnologie: mockStageTechnologieModel,
    historiqueValidation: mockHistoriqueValidationModel
};

await jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance)
}));

// Mock du service de notifications (appelé à la création et validation d'un stage)
const mockCreerNotification = jest.fn().mockResolvedValue(undefined);
await jest.unstable_mockModule('#Modules/systeme/notifications/notifications.service.js', () => ({
    creerNotification: mockCreerNotification
}));

// Mock du service MinIO (appelé pour enrichir les URLs des rapports)
const mockEnrichEntitiesWithFileUrls = jest.fn(entities => Promise.resolve(entities));
const mockEnrichEntityWithFileUrls = jest.fn(entity => Promise.resolve(entity));
const mockUploadAndSaveFile = jest.fn();
const mockDeleteFile = jest.fn().mockResolvedValue(undefined);

await jest.unstable_mockModule('#Services/minio.service.js', () => ({
    enrichEntitiesWithFileUrls: mockEnrichEntitiesWithFileUrls,
    enrichEntityWithFileUrls: mockEnrichEntityWithFileUrls,
    uploadAndSaveFile: mockUploadAndSaveFile,
    deleteFile: mockDeleteFile
}));

// Import dynamique du Service après les mocks
const {
    creerStage,
    recupererTousLesStages,
    recupererStageParId,
    recupererStagesParEtudiant,
    recupererStagesAValider,
    modifierStage,
    validerStage,
    associerRapport,
    supprimerRapport,
    supprimerStage,
    ajouterTechnologieStage,
    modifierTechnologieStage,
    retirerTechnologieStage
} = await import('#Modules/parcours/stage/stage.service.js');


describe('Service Stage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Par défaut, enrichir retourne les entités telles quelles (pas de MinIO réel)
        mockEnrichEntitiesWithFileUrls.mockImplementation(entities => Promise.resolve(entities));
        mockEnrichEntityWithFileUrls.mockImplementation(entity => Promise.resolve(entity));
    });

    describe('creerStage', () => {

        test('doit créer un stage sans validateur', async () => {
            const mockStage = { id_stage: 's-1', entreprise: 'TechCorp', id_etudiant: 'etud-1' };
            mockStageModel.create.mockResolvedValue(mockStage);

            const donnees = {
                id_etudiant: 'etud-1',
                entreprise: 'TechCorp',
                poste: 'Dev',
                date_debut: '2025-07-01',
                missions: 'Développer'
            };
            const result = await creerStage(donnees);

            expect(mockStageModel.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ id_etudiant: 'etud-1', entreprise: 'TechCorp' })
            }));
            // Sans validateur → pas de notification envoyée
            expect(mockCreerNotification).not.toHaveBeenCalled();
            expect(result).toEqual(mockStage);
        });

        test('doit créer un stage avec validateur et envoyer une notification', async () => {
            // L'étudiant et le professeur sont dans la même école → OK
            mockEtudiantModel.findUnique.mockResolvedValue({ filiere: 'GINF', utilisateur: { ecole: 'ENSATanger' } });
            mockProfesseurModel.findUnique.mockResolvedValue({ filieres_interv: ['GINF'], utilisateur: { ecole: 'ENSATanger' } });
            const mockStage = { id_stage: 's-1', entreprise: 'TechCorp', id_etudiant: 'etud-1', id_validateur: 'prof-1' };
            mockStageModel.create.mockResolvedValue(mockStage);

            const donnees = {
                id_etudiant: 'etud-1',
                id_validateur: 'prof-1',
                entreprise: 'TechCorp',
                poste: 'Dev',
                date_debut: '2025-07-01',
                missions: 'Développer'
            };
            const result = await creerStage(donnees);

            expect(mockStageModel.create).toHaveBeenCalled();
            // Avec validateur → une notification de validation doit être envoyée
            expect(mockCreerNotification).toHaveBeenCalledWith(
                'prof-1', 'VALIDATION', expect.any(String), expect.any(String)
            );
            expect(result).toEqual(mockStage);
        });

        test('doit lever une erreur si le professeur n\'appartient pas à la même école', async () => {
            // L'étudiant est à ENSATanger, mais le professeur est à ENCG
            mockEtudiantModel.findUnique.mockResolvedValue({ filiere: 'GINF', utilisateur: { ecole: 'ENSATanger' } });
            mockProfesseurModel.findUnique.mockResolvedValue({ filieres_interv: ['SIC'], utilisateur: { ecole: 'ENCG' } });

            const donnees = { id_etudiant: 'etud-1', id_validateur: 'prof-1', entreprise: 'TechCorp', date_debut: '2025-07-01', missions: 'Dev', poste: 'Dev' };
            await expect(creerStage(donnees)).rejects.toThrow('ENSATanger');
        });

        test('doit lever une erreur si l\'ID étudiant est absent', async () => {
            await expect(creerStage({ entreprise: 'TechCorp' })).rejects.toThrow("L'ID de l'étudiant est requis");
        });

    });

    describe('recupererTousLesStages', () => {

        test('doit retourner la liste de tous les stages', async () => {
            const mockStages = [{ id_stage: 's-1' }, { id_stage: 's-2' }];
            mockStageModel.findMany.mockResolvedValue(mockStages);

            const result = await recupererTousLesStages();

            expect(mockStageModel.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockStages);
        });

        // si Prisma lance une erreur → le service ne la gère pas
        // → elle remonte vers le controller → le controller l'attrape dans son catch
        test('doit propager l\'erreur si Prisma échoue', async () => {
            mockStageModel.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererTousLesStages()).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('recupererStageParId', () => {

        test('doit retourner le stage avec ses relations', async () => {
            const mockStage = { id_stage: 's-1', entreprise: 'TechCorp', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);

            const result = await recupererStageParId('s-1');

            expect(mockStageModel.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_stage: 's-1' }
            }));
            expect(result).toEqual(mockStage);
        });

        test('doit retourner null si stage non trouvé', async () => {
            // peu importe l'ID qu'on te passe, retourne toujours null
            mockStageModel.findUnique.mockResolvedValue(null);

            const result = await recupererStageParId('id-inexistant');

            expect(result).toBeNull();
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            mockStageModel.findUnique.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererStageParId('s-1')).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('recupererStagesParEtudiant', () => {

        test('doit retourner les stages d\'un étudiant', async () => {
            const mockStages = [{ id_stage: 's-1', id_etudiant: 'etud-1' }];
            mockStageModel.findMany.mockResolvedValue(mockStages);

            const result = await recupererStagesParEtudiant('etud-1');

            expect(mockStageModel.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_etudiant: 'etud-1' }
            }));
            expect(result).toEqual(mockStages);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            mockStageModel.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererStagesParEtudiant('etud-1')).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('recupererStagesAValider', () => {

        test('doit retourner les stages EN_ATTENTE affectés au professeur', async () => {
            const mockStages = [{ id_stage: 's-1', status_validation: 'EN_ATTENTE', id_validateur: 'prof-1' }];
            mockStageModel.findMany.mockResolvedValue(mockStages);

            const result = await recupererStagesAValider('prof-1');

            expect(mockStageModel.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_validateur: 'prof-1', status_validation: 'EN_ATTENTE' }
            }));
            expect(result).toEqual(mockStages);
        });

        test('doit propager l\'erreur si Prisma échoue', async () => {
            mockStageModel.findMany.mockRejectedValue(new Error('Erreur Prisma'));

            await expect(recupererStagesAValider('prof-1')).rejects.toThrow('Erreur Prisma');
        });

    });

    describe('modifierStage', () => {

        test('doit modifier le stage si l\'utilisateur est propriétaire', async () => {
            // verifierAccesStage utilise stage.findUnique → on simule le stage existant
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            const mockUpdated = { id_stage: 's-1', entreprise: 'NewCorp' };
            mockStageModel.update.mockResolvedValue(mockUpdated);

            const result = await modifierStage('s-1', { entreprise: 'NewCorp' }, 'user-1', 'ETUDIANT');

            expect(mockStageModel.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_stage: 's-1' }
            }));
            expect(result).toEqual(mockUpdated);
        });

        test('doit lever une erreur si l\'utilisateur n\'est pas propriétaire', async () => {
            // Le stage appartient à 'user-1' mais c'est 'autre-user' qui essaie de modifier
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);

            await expect(modifierStage('s-1', {}, 'autre-user', 'ETUDIANT'))
                .rejects.toThrow('autorisé');
        });

    });

    describe('validerStage', () => {

        test('doit valider le stage et envoyer une notification à l\'étudiant', async () => {
            const mockStage = { id_stage: 's-1', id_validateur: 'prof-1', id_etudiant: 'etud-1', entreprise: 'TechCorp', date_soumission: new Date() };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            const mockUpdated = { ...mockStage, status_validation: 'VALIDE' };
            mockStageModel.update.mockResolvedValue(mockUpdated);
            mockHistoriqueValidationModel.create.mockResolvedValue({});

            const result = await validerStage('s-1', 'prof-1', 'VALIDE', 'Bon travail');

            expect(mockStageModel.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ status_validation: 'VALIDE' })
            }));
            // Une notification doit être envoyée à l'étudiant
            expect(mockCreerNotification).toHaveBeenCalledWith('etud-1', 'VALIDATION', expect.any(String), expect.any(String));
            // Un historique de validation doit être créé
            expect(mockHistoriqueValidationModel.create).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });

        test('doit lever une erreur si ce n\'est pas le bon validateur', async () => {
            const mockStage = { id_stage: 's-1', id_validateur: 'prof-1', id_etudiant: 'etud-1' };
            mockStageModel.findUnique.mockResolvedValue(mockStage);

            // 'prof-2' n'est pas le validateur désigné
            await expect(validerStage('s-1', 'prof-2', 'VALIDE', ''))
                .rejects.toThrow('validateur');
        });

        test('doit lever une erreur si le stage n\'existe pas', async () => {
            mockStageModel.findUnique.mockResolvedValue(null);

            await expect(validerStage('id-inexistant', 'prof-1', 'VALIDE', ''))
                .rejects.toThrow('Stage non trouvé');
        });

    });

    describe('associerRapport', () => {

        test('doit uploader et associer le rapport au stage', async () => {
            // verifierAccesStage → stage existant, appartient à user-1, pas de rapport existant
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', id_rapport: null, rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            const mockFileRecord = { id_fichier: 'f-1', nom_stockage: 'rapport.pdf' };
            mockUploadAndSaveFile.mockResolvedValue(mockFileRecord);
            mockStageModel.update.mockResolvedValue({});

            const fichier = { originalname: 'rapport.pdf', buffer: Buffer.from('pdf') };
            const result = await associerRapport('s-1', fichier, 'user-1', 'ETUDIANT');

            expect(mockUploadAndSaveFile).toHaveBeenCalledWith(fichier, 'user-1', 'RAPPORT');
            // Le stage doit être mis à jour avec l'id du fichier
            expect(mockStageModel.update).toHaveBeenCalledWith({
                where: { id_stage: 's-1' },
                data: { id_rapport: 'f-1' }
            });
            expect(result).toEqual(mockFileRecord);
        });

        test('doit lever une erreur si le stage n\'existe pas', async () => {
            mockStageModel.findUnique.mockResolvedValue(null);

            await expect(associerRapport('id-inexistant', {}, 'user-1', 'ETUDIANT'))
                .rejects.toThrow('Stage non trouvé');
        });

    });

    describe('supprimerRapport', () => {

        test('doit supprimer le rapport de MinIO et détacher du stage', async () => {
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', id_rapport: 'f-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            mockStageModel.update.mockResolvedValue({});

            await supprimerRapport('s-1', 'user-1', 'ETUDIANT');

            // Le fichier doit être supprimé de MinIO
            expect(mockDeleteFile).toHaveBeenCalledWith('f-1');
            // Le stage doit être mis à jour pour détacher le rapport
            expect(mockStageModel.update).toHaveBeenCalledWith({
                where: { id_stage: 's-1' },
                data: { id_rapport: null }
            });
        });

        test('doit lever une erreur si aucun rapport n\'est associé', async () => {
            // Le stage existe mais n'a pas de rapport
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', id_rapport: null, rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);

            await expect(supprimerRapport('s-1', 'user-1', 'ETUDIANT'))
                .rejects.toThrow('Aucun rapport associé à ce stage');
            expect(mockDeleteFile).not.toHaveBeenCalled();
        });

    });

    describe('supprimerStage', () => {

        test('doit supprimer le stage (propriétaire, sans rapport)', async () => {
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', id_rapport: null, rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            mockStageModel.delete.mockResolvedValue(mockStage);

            await supprimerStage('s-1', 'user-1', 'ETUDIANT');

            expect(mockDeleteFile).not.toHaveBeenCalled();
            expect(mockStageModel.delete).toHaveBeenCalledWith({ where: { id_stage: 's-1' } });
        });

        test('doit supprimer le rapport MinIO avant de supprimer le stage', async () => {
            // Le stage a un rapport → il faut d'abord supprimer le fichier MinIO
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', id_rapport: 'f-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            mockStageModel.delete.mockResolvedValue(mockStage);

            await supprimerStage('s-1', 'user-1', 'ETUDIANT');

            expect(mockDeleteFile).toHaveBeenCalledWith('f-1');
            expect(mockStageModel.delete).toHaveBeenCalled();
        });

    });

    describe('ajouterTechnologieStage', () => {

        test('doit ajouter une technologie au stage', async () => {
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            const mockResult = { id_stage: 's-1', id_technologie: 'tech-1' };
            mockStageTechnologieModel.create.mockResolvedValue(mockResult);

            const result = await ajouterTechnologieStage('s-1', 'tech-1', { version: '18', niveau_utilisation: 'INTERMEDIAIRE' }, 'user-1', 'ETUDIANT');

            expect(mockStageTechnologieModel.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ id_stage: 's-1', id_technologie: 'tech-1' })
            }));
            expect(result).toEqual(mockResult);
        });

        test('doit lever une erreur si l\'utilisateur n\'est pas autorisé', async () => {
            const mockStage = { id_stage: 's-1', id_etudiant: 'autre-user', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);

            await expect(ajouterTechnologieStage('s-1', 'tech-1', {}, 'user-1', 'ETUDIANT'))
                .rejects.toThrow('autorisé');
        });

    });

    describe('modifierTechnologieStage', () => {

        test('doit modifier la technologie du stage', async () => {
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            const mockResult = { id_stage: 's-1', id_technologie: 'tech-1', niveau_utilisation: 'AVANCE' };
            mockStageTechnologieModel.update.mockResolvedValue(mockResult);

            const result = await modifierTechnologieStage('s-1', 'tech-1', { niveau_utilisation: 'AVANCE' }, 'user-1', 'ETUDIANT');

            expect(mockStageTechnologieModel.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id_stage_id_technologie: { id_stage: 's-1', id_technologie: 'tech-1' } }
            }));
            expect(result).toEqual(mockResult);
        });

    });

    describe('retirerTechnologieStage', () => {

        test('doit retirer la technologie du stage', async () => {
            const mockStage = { id_stage: 's-1', id_etudiant: 'user-1', rapport: null };
            mockStageModel.findUnique.mockResolvedValue(mockStage);
            mockStageTechnologieModel.delete.mockResolvedValue({});

            await retirerTechnologieStage('s-1', 'tech-1', 'user-1', 'ETUDIANT');

            expect(mockStageTechnologieModel.delete).toHaveBeenCalledWith({
                where: { id_stage_id_technologie: { id_stage: 's-1', id_technologie: 'tech-1' } }
            });
        });

    });

});
