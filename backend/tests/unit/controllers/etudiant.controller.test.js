// test unitaire du controller
import { jest } from '@jest/globals';

// 1) On crée les fonctions mock
const mockRecupererTousLesProfils = jest.fn();
const mockRecupererParId = jest.fn();
const mockAjouterOuModifierEtudiant = jest.fn();
const mockMettreAJourAvatar = jest.fn();

// 2) On dit à Jest "quand quelqu'un importe etudiantService,
//    donne-lui mes fonctions mock à la place"
await jest.unstable_mockModule('#Modules/identite/etudiant/etudiant.service.js', () => ({
    recupererTousLesProfils: mockRecupererTousLesProfils,
    recupererParId: mockRecupererParId,
    ajouterOuModifierEtudiant: mockAjouterOuModifierEtudiant,
    mettreAJourAvatar: mockMettreAJourAvatar,
}));

// 3) SEULEMENT APRÈS on importe le controller
//    → quand le controller va importe etudiantService,
//    il va recevoir les mocks au lieu du vrai service
const { obtenirTousLesProfils, obtenirProfilParId, traiterProfil, uploadAvatar } =
    await import('#Modules/identite/etudiant/etudiant.controller.js');


describe('Controller Profil Étudiant', () => {

    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, user: { id: 'user-1', role: 'ETUDIANT' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('obtenirTousLesProfils', () => {

        // Test 1 : Cas succès
        // Déclaration du test asynchrone 
        test('doit retourner 200 avec la liste des étudiants', async () => {

            // Crée de fausses données (ce que la DB retournerait normalement)
            const mockEtudiants = [{ id_etudiant: '1', filiere: 'GINF' }];

            // Dit au mock : "quand on t'appelle, retourne mockEtudiants comme si
            // la DB avait répondu"
            mockRecupererTousLesProfils.mockResolvedValue(mockEtudiants);

            // Appelle le vrai controller avec le faux req et res.
            // Le controller va appeler recupererTousLesProfils() 
            // mais au lieu du vrai service, il va tomber sur notre mock 
            // qui retourne mockEtudiants.
            await obtenirTousLesProfils(req, res);

            // Vérifie que le controller a bien appelé res.status(200)
            expect(res.status).toHaveBeenCalledWith(200);

            // Vérifie que le controller a bien retourné mockEtudiants dans la réponse.
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Profils récupérés avec succès",
                data: mockEtudiants,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererTousLesProfils.mockRejectedValue(new Error('Erreur DB'));

            await obtenirTousLesProfils(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des profils",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('obtenirProfilParId', () => {

        test('doit retourner 200 avec l\'étudiant trouvé', async () => {
            req.params.id = 'id-valide';
            const mockEtudiant = { id_etudiant: 'id-valide', filiere: 'GINF' };
            mockRecupererParId.mockResolvedValue(mockEtudiant);

            await obtenirProfilParId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Profil récupéré avec succès",
                data: mockEtudiant,
                erreur: null
            }
            );
        });

        test('doit retourner 404 si étudiant non trouvé', async () => {
            req.params.id = 'id-inexistant';
            mockRecupererParId.mockResolvedValue(null);

            await obtenirProfilParId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Étudiant non trouvé",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id = 'id-valide';
            mockRecupererParId.mockRejectedValue(new Error('Erreur DB'));

            await obtenirProfilParId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération du profil",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('traiterProfil', () => {

        test('doit retourner 200 avec le profil traité', async () => {
            req.params.id = 'id-valide';
            req.body = { filiere: 'GINF', ville: 'Tanger' };
            const mockProfil = { id_etudiant: 'id-valide', filiere: 'GINF' };
            mockAjouterOuModifierEtudiant.mockResolvedValue(mockProfil);

            await traiterProfil(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Profil traité avec succès",
                data: mockProfil,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur', async () => {
            req.params.id = 'id-valide';
            mockAjouterOuModifierEtudiant.mockRejectedValue(new Error('Erreur DB'));

            await traiterProfil(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors du traitement du profil",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('uploadAvatar', () => {

        test('doit retourner 200 avec l\'URL de la photo uploadée', async () => {
            req.params.id = 'id-valide';
            req.file = { originalname: 'photo.jpg', buffer: Buffer.from('test') };
            const mockResult = { url: 'http://minio/photo.jpg', nom_stockage: 'photo.jpg' };
            mockMettreAJourAvatar.mockResolvedValue(mockResult);

            await uploadAvatar(req, res);

            expect(mockMettreAJourAvatar).toHaveBeenCalledWith('id-valide', req.file, 'user-1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Photo de profil mise à jour",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 400 si aucun fichier fourni', async () => {
            req.params.id = 'id-valide';
            req.file = undefined;

            await uploadAvatar(req, res);

            expect(mockMettreAJourAvatar).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Aucun fichier fourni",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 404 si étudiant non trouvé', async () => {
            req.params.id = 'id-inexistant';
            req.file = { originalname: 'photo.jpg' };
            mockMettreAJourAvatar.mockRejectedValue(new Error('Étudiant non trouvé'));

            await uploadAvatar(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Étudiant non trouvé",
                data: null,
                erreur: expect.any(String)
            });
        });

        test('doit retourner 500 en cas d\'erreur serveur (ex: MinIO)', async () => {
            req.params.id = 'id-valide';
            req.file = { originalname: 'photo.jpg' };
            mockMettreAJourAvatar.mockRejectedValue(new Error('Erreur MinIO'));

            await uploadAvatar(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur MinIO",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

});