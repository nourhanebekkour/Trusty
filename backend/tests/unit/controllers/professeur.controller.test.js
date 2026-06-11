import { jest } from '@jest/globals';

// Mocks des fonctions du service
const mockAjouterOuModifierProfesseur = jest.fn();
const mockRecupererProfesseurParId = jest.fn();
const mockRecupererTousLesProfesseurs = jest.fn();
const mockRecupererProfesseursParFiliere = jest.fn();
const mockMettreAJourAvatar = jest.fn();

// Mock du module service
await jest.unstable_mockModule('#Modules/identite/professeur/professeur.service.js', () => ({
    ajouterOuModifierProfesseur: mockAjouterOuModifierProfesseur,
    recupererProfesseurParId: mockRecupererProfesseurParId,
    recupererTousLesProfesseurs: mockRecupererTousLesProfesseurs,
    recupererProfesseursParFiliere: mockRecupererProfesseursParFiliere,
    mettreAJourAvatar: mockMettreAJourAvatar
}));

// Import dynamique du controller après le mock
const { createOrUpdateProfile, obtenirProfilParId, obtenirTousLesProfils, obtenirProfesseursParFiliere, uploadAvatar }
    = await import('#Modules/identite/professeur/professeur.controller.js');


describe('Controller Professeur', () => {

    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: { id: 'user-1', role: 'PROFESSEUR' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createOrUpdateProfile', () => {

        test('doit retourner 200 avec le profil créé ou mis à jour', async () => {
            req.params.id = 'prof-1';
            req.body = { departement: 'SIC', specialite: 'Informatique' };
            const mockData = { id_professeur: 'prof-1', departement: 'SIC' };
            mockAjouterOuModifierProfesseur.mockResolvedValue(mockData);

            await createOrUpdateProfile(req, res);

            expect(mockAjouterOuModifierProfesseur).toHaveBeenCalledWith('prof-1', req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Professeur créé ou mis à jour avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id = 'prof-1';
            mockAjouterOuModifierProfesseur.mockRejectedValue(new Error('Erreur DB'));

            await createOrUpdateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors du traitement du profil",
                data: null,
                erreur: expect.any(String)
            });
        });
    });

    describe('obtenirProfilParId', () => {

        test('doit retourner 200 avec le profil trouvé', async () => {
            req.params.id = 'prof-1';
            const mockData = { id_professeur: 'prof-1', departement: 'SIC' };
            mockRecupererProfesseurParId.mockResolvedValue(mockData);

            await obtenirProfilParId(req, res);

            expect(mockRecupererProfesseurParId).toHaveBeenCalledWith('prof-1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Profil récupéré avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 404 si professeur non trouvé', async () => {
            req.params.id = 'id-inexistant';
            mockRecupererProfesseurParId.mockResolvedValue(null);

            await obtenirProfilParId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Utilisateur introuvable",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id = 'prof-1';
            mockRecupererProfesseurParId.mockRejectedValue(new Error('Erreur DB'));

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

    describe('obtenirTousLesProfils', () => {

        test('doit retourner 200 avec la liste des professeurs', async () => {
            const mockData = [{ id_professeur: 'prof-1' }, { id_professeur: 'prof-2' }];
            mockRecupererTousLesProfesseurs.mockResolvedValue(mockData);

            await obtenirTousLesProfils(req, res);

            expect(mockRecupererTousLesProfesseurs).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Profils récupérés avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererTousLesProfesseurs.mockRejectedValue(new Error('Erreur DB'));

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


    describe('obtenirProfesseursParFiliere', () => {

        test('doit retourner 200 avec les professeurs de la filière', async () => {
            req.params.filiere = 'GINF';
            const mockData = [{ id_professeur: 'prof-1' }];
            mockRecupererProfesseursParFiliere.mockResolvedValue(mockData);

            await obtenirProfesseursParFiliere(req, res);

            expect(mockRecupererProfesseursParFiliere).toHaveBeenCalledWith('GINF');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Professeurs de la filière GINF récupérés avec succès",
                data: mockData,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.filiere = 'GINF';
            mockRecupererProfesseursParFiliere.mockRejectedValue(new Error('Erreur DB'));

            await obtenirProfesseursParFiliere(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });


    describe('uploadAvatar', () => {

        test('doit retourner 200 avec l\'URL de la photo', async () => {
            req.params.id = 'prof-1';
            req.file = { originalname: 'photo.jpg', buffer: Buffer.from('test') };
            const mockResult = { url: 'http://minio/photo.jpg', nom_stockage: 'photo.jpg' };
            mockMettreAJourAvatar.mockResolvedValue(mockResult);

            await uploadAvatar(req, res);

            expect(mockMettreAJourAvatar).toHaveBeenCalledWith('prof-1', req.file, 'user-1');
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
            req.params.id = 'prof-1';
            req.file = undefined;

            await uploadAvatar(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Aucun fichier fourni",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 404 si professeur non trouvé', async () => {
            req.params.id = 'id-inexistant';
            req.file = { originalname: 'photo.jpg' };
            mockMettreAJourAvatar.mockRejectedValue(new Error('Professeur non trouvé'));

            await uploadAvatar(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('doit retourner 500 en cas d\'erreur serveur', async () => {
            req.params.id = 'prof-1';
            req.file = { originalname: 'photo.jpg' };
            mockMettreAJourAvatar.mockRejectedValue(new Error('Erreur MinIO'));

            await uploadAvatar(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});