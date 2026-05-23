// test unitaire du controller
import { jest } from '@jest/globals';

// 1) On crée les fonctions mock du service
const mockCreerStage = jest.fn();
const mockRecupererTousLesStages = jest.fn();
const mockRecupererStageParId = jest.fn();
const mockRecupererStagesParEtudiant = jest.fn();
const mockRecupererStagesAValider = jest.fn();
const mockModifierStage = jest.fn();
const mockValiderStage = jest.fn();
const mockSupprimerStage = jest.fn();
const mockAssocierRapport = jest.fn();
const mockSupprimerRapport = jest.fn();
const mockAjouterTechnologieStage = jest.fn();
const mockModifierTechnologieStage = jest.fn();
const mockRetirerTechnologieStage = jest.fn();

// 2) On dit à Jest "quand quelqu'un importe stageService,
//    donne-lui mes fonctions mock à la place"
await jest.unstable_mockModule('#Modules/parcours/stage/stage.service.js', () => ({
    creerStage: mockCreerStage,
    recupererTousLesStages: mockRecupererTousLesStages,
    recupererStageParId: mockRecupererStageParId,
    recupererStagesParEtudiant: mockRecupererStagesParEtudiant,
    recupererStagesAValider: mockRecupererStagesAValider,
    modifierStage: mockModifierStage,
    validerStage: mockValiderStage,
    supprimerStage: mockSupprimerStage,
    associerRapport: mockAssocierRapport,
    supprimerRapport: mockSupprimerRapport,
    ajouterTechnologieStage: mockAjouterTechnologieStage,
    modifierTechnologieStage: mockModifierTechnologieStage,
    retirerTechnologieStage: mockRetirerTechnologieStage,
}));

// 3) SEULEMENT APRÈS on importe le controller
//    → quand le controller va importer stageService,
//    il va recevoir les mocks au lieu du vrai service
const {
    creerStage,
    listerStages,
    obtenirStage,
    listerStagesParEtudiant,
    listerStagesAValider,
    modifierStage,
    validerStage,
    supprimerStage,
    uploadRapport,
    supprimerRapport,
    ajouterTechnologie,
    modifierTechnologie,
    retirerTechnologie,
} = await import('#Modules/parcours/stage/stage.controller.js');


describe('Controller Stage', () => {

    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { id: 'user-1', role: 'ETUDIANT' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('creerStage', () => {

        test('doit retourner 201 avec le stage créé', async () => {
            req.params.id_etudiant = 'etud-1';
            req.body = { entreprise: 'TechCorp', poste: 'Dev', date_debut: '2025-07-01', missions: 'Développer' };
            const mockStage = { id_stage: 's-1', entreprise: 'TechCorp', id_etudiant: 'etud-1' };
            mockCreerStage.mockResolvedValue(mockStage);

            await creerStage(req, res);

            // Le controller fusionne id_etudiant avec les données du body
            expect(mockCreerStage).toHaveBeenCalledWith(expect.objectContaining({ id_etudiant: 'etud-1' }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 201,
                success: true,
                message: "Stage crée avec succès",
                data: mockStage,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            req.params.id_etudiant = 'etud-1';
            mockCreerStage.mockRejectedValue(new Error('Étudiant introuvable'));

            await creerStage(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de la création du stage",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('listerStages', () => {

        test('doit retourner 200 avec la liste des stages', async () => {
            const mockStages = [{ id_stage: 's-1' }, { id_stage: 's-2' }];
            mockRecupererTousLesStages.mockResolvedValue(mockStages);

            await listerStages(req, res);

            expect(mockRecupererTousLesStages).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stages récupérés avec succès",
                data: mockStages,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererTousLesStages.mockRejectedValue(new Error('Erreur DB'));

            await listerStages(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des stages",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('obtenirStage', () => {

        test('doit retourner 200 avec le stage trouvé', async () => {
            req.params.id = 's-1';
            const mockStage = { id_stage: 's-1', entreprise: 'TechCorp' };
            mockRecupererStageParId.mockResolvedValue(mockStage);

            await obtenirStage(req, res);

            expect(mockRecupererStageParId).toHaveBeenCalledWith('s-1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stage récupéré avec succès",
                data: mockStage,
                erreur: null
            });
        });

        test('doit retourner 404 si stage non trouvé', async () => {
            req.params.id = 'id-inexistant';
            // peu importe l'ID qu'on te passe, retourne toujours null
            mockRecupererStageParId.mockResolvedValue(null);

            await obtenirStage(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Stage non trouvé",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id = 's-1';
            mockRecupererStageParId.mockRejectedValue(new Error('Erreur DB'));

            await obtenirStage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération du stage",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('listerStagesParEtudiant', () => {

        test('doit retourner 200 avec les stages de l\'étudiant', async () => {
            req.params.id_etudiant = 'etud-1';
            const mockStages = [{ id_stage: 's-1', id_etudiant: 'etud-1' }];
            mockRecupererStagesParEtudiant.mockResolvedValue(mockStages);

            await listerStagesParEtudiant(req, res);

            expect(mockRecupererStagesParEtudiant).toHaveBeenCalledWith('etud-1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stages récupérés avec succès",
                data: mockStages,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id_etudiant = 'etud-1';
            mockRecupererStagesParEtudiant.mockRejectedValue(new Error('Erreur DB'));

            await listerStagesParEtudiant(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

    });

    describe('listerStagesAValider', () => {

        test('doit retourner 200 avec les stages en attente de validation', async () => {
            req.user = { id: 'prof-1', role: 'PROFESSEUR' };
            const mockStages = [{ id_stage: 's-1', status_validation: 'EN_ATTENTE' }];
            mockRecupererStagesAValider.mockResolvedValue(mockStages);

            await listerStagesAValider(req, res);

            // Le controller passe l'ID du professeur connecté (req.user.id)
            expect(mockRecupererStagesAValider).toHaveBeenCalledWith('prof-1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stages à valider récupérés avec succès",
                data: mockStages,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererStagesAValider.mockRejectedValue(new Error('Erreur DB'));

            await listerStagesAValider(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

    });

    describe('modifierStage', () => {

        test('doit retourner 200 avec le stage modifié', async () => {
            req.params.id = 's-1';
            req.body = { entreprise: 'NewCorp' };
            const mockStage = { id_stage: 's-1', entreprise: 'NewCorp' };
            mockModifierStage.mockResolvedValue(mockStage);

            await modifierStage(req, res);

            expect(mockModifierStage).toHaveBeenCalledWith('s-1', req.body, 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stage modifié avec succès",
                data: mockStage,
                erreur: null
            });
        });

        test('doit retourner 403 si utilisateur non autorisé', async () => {
            req.params.id = 's-1';
            // Le service lève cette erreur quand l'utilisateur n'est pas propriétaire ni admin
            mockModifierStage.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await modifierStage(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                status: 403,
                success: false,
                message: "Erreur lors de la modification du stage",
                data: null,
                erreur: expect.any(String)
            });
        });

        test('doit retourner 400 en cas d\'autre erreur', async () => {
            req.params.id = 's-1';
            mockModifierStage.mockRejectedValue(new Error('Données invalides'));

            await modifierStage(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

    });

    describe('validerStage', () => {

        test('doit retourner 200 après validation réussie', async () => {
            req.params.id = 's-1';
            req.body = { decision: 'VALIDE', commentaire: 'Très bon travail' };
            req.user = { id: 'prof-1', role: 'PROFESSEUR' };
            const mockStage = { id_stage: 's-1', status_validation: 'VALIDE' };
            mockValiderStage.mockResolvedValue(mockStage);

            await validerStage(req, res);

            expect(mockValiderStage).toHaveBeenCalledWith('s-1', 'prof-1', 'VALIDE', 'Très bon travail');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stage valide avec succès",
                data: mockStage,
                erreur: null
            });
        });

        test('doit retourner 403 si non validateur désigné', async () => {
            req.params.id = 's-1';
            req.body = { decision: 'VALIDE' };
            // Le service lève cette erreur si ce n'est pas le bon validateur
            mockValiderStage.mockRejectedValue(new Error("Vous n'êtes pas le validateur désigné pour ce stage"));

            await validerStage(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('doit retourner 400 en cas d\'autre erreur', async () => {
            req.params.id = 's-1';
            req.body = { decision: 'INVALIDE' };
            mockValiderStage.mockRejectedValue(new Error('Stage non trouvé'));

            await validerStage(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

    });

    describe('supprimerStage', () => {

        test('doit retourner 200 après suppression réussie', async () => {
            req.params.id = 's-1';
            mockSupprimerStage.mockResolvedValue({});

            await supprimerStage(req, res);

            expect(mockSupprimerStage).toHaveBeenCalledWith('s-1', 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Stage supprimé avec succès",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 403 si non autorisé', async () => {
            req.params.id = 's-1';
            mockSupprimerStage.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await supprimerStage(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('doit retourner 404 si stage non trouvé', async () => {
            req.params.id = 'id-inexistant';
            mockSupprimerStage.mockRejectedValue(new Error("Stage non trouvé"));

            await supprimerStage(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

    });

    describe('uploadRapport', () => {

        test('doit retourner 400 si aucun fichier fourni', async () => {
            req.params.id = 's-1';
            req.file = undefined;

            await uploadRapport(req, res);

            expect(mockAssocierRapport).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Aucun fichier fourni",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 200 après upload réussi', async () => {
            req.params.id = 's-1';
            req.file = { originalname: 'rapport.pdf', buffer: Buffer.from('test') };
            const mockRecord = { id_fichier: 'f-1', url: 'http://minio/rapport.pdf' };
            mockAssocierRapport.mockResolvedValue(mockRecord);

            await uploadRapport(req, res);

            expect(mockAssocierRapport).toHaveBeenCalledWith('s-1', req.file, 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Rapport de stage uploadé avec succès",
                data: mockRecord,
                erreur: null
            });
        });

        test('doit retourner 403 si non autorisé', async () => {
            req.params.id = 's-1';
            req.file = { originalname: 'rapport.pdf' };
            mockAssocierRapport.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await uploadRapport(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('doit retourner 404 si stage non trouvé', async () => {
            req.params.id = 'id-inexistant';
            req.file = { originalname: 'rapport.pdf' };
            mockAssocierRapport.mockRejectedValue(new Error("Stage non trouvé"));

            await uploadRapport(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('doit retourner 500 en cas d\'erreur serveur (ex: MinIO)', async () => {
            req.params.id = 's-1';
            req.file = { originalname: 'rapport.pdf' };
            mockAssocierRapport.mockRejectedValue(new Error('Erreur MinIO'));

            await uploadRapport(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

    });

    describe('supprimerRapport', () => {

        test('doit retourner 200 après suppression du rapport réussie', async () => {
            req.params.id = 's-1';
            mockSupprimerRapport.mockResolvedValue({});

            await supprimerRapport(req, res);

            expect(mockSupprimerRapport).toHaveBeenCalledWith('s-1', 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Rapport de stage supprimé avec succès",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 403 si non autorisé', async () => {
            req.params.id = 's-1';
            mockSupprimerRapport.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await supprimerRapport(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('doit retourner 404 si aucun rapport associé', async () => {
            req.params.id = 's-1';
            mockSupprimerRapport.mockRejectedValue(new Error("Aucun rapport associé à ce stage"));

            await supprimerRapport(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

    });

    describe('ajouterTechnologie', () => {

        test('doit retourner 201 avec la technologie ajoutée', async () => {
            req.params = { id_stage: 's-1', id_technologie: 'tech-1' };
            req.body = { version: '18', niveau_utilisation: 'INTERMEDIAIRE' };
            const mockResult = { id_stage: 's-1', id_technologie: 'tech-1' };
            mockAjouterTechnologieStage.mockResolvedValue(mockResult);

            await ajouterTechnologie(req, res);

            expect(mockAjouterTechnologieStage).toHaveBeenCalledWith('s-1', 'tech-1', req.body, 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 201,
                success: true,
                message: "Technologie ajoutée au stage avec succès",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 403 si non autorisé', async () => {
            req.params = { id_stage: 's-1', id_technologie: 'tech-1' };
            mockAjouterTechnologieStage.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await ajouterTechnologie(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

    });

    describe('modifierTechnologie', () => {

        test('doit retourner 200 avec la technologie modifiée', async () => {
            req.params = { id_stage: 's-1', id_technologie: 'tech-1' };
            req.body = { niveau_utilisation: 'AVANCE' };
            const mockResult = { id_stage: 's-1', id_technologie: 'tech-1', niveau_utilisation: 'AVANCE' };
            mockModifierTechnologieStage.mockResolvedValue(mockResult);

            await modifierTechnologie(req, res);

            expect(mockModifierTechnologieStage).toHaveBeenCalledWith('s-1', 'tech-1', req.body, 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Technologie du stage modifiée avec succès",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 403 si non autorisé', async () => {
            req.params = { id_stage: 's-1', id_technologie: 'tech-1' };
            mockModifierTechnologieStage.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await modifierTechnologie(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

    });

    describe('retirerTechnologie', () => {

        test('doit retourner 200 après retrait de la technologie', async () => {
            req.params = { id_stage: 's-1', id_technologie: 'tech-1' };
            mockRetirerTechnologieStage.mockResolvedValue({});

            await retirerTechnologie(req, res);

            expect(mockRetirerTechnologieStage).toHaveBeenCalledWith('s-1', 'tech-1', 'user-1', 'ETUDIANT');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Technologie retirée du stage avec succès",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 403 si non autorisé', async () => {
            req.params = { id_stage: 's-1', id_technologie: 'tech-1' };
            mockRetirerTechnologieStage.mockRejectedValue(new Error("Vous n'êtes pas autorisé à accéder à cette ressource"));

            await retirerTechnologie(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

    });

});
