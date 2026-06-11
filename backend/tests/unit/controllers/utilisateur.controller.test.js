// test unitaire du controller
import { jest } from '@jest/globals';

// 1) On crée les fonctions mock
const mockRecupererTousLesUtilisateurs = jest.fn();
const mockRecupererUtilisateurParId = jest.fn();
const mockModifierRole = jest.fn();
const mockModifierStatut = jest.fn();
const mockSupprimerUtilisateur = jest.fn();

// 2) On dit à Jest "quand quelqu'un importe utilisateurService,
//    donne-lui mes fonctions mock à la place"
await jest.unstable_mockModule('#Modules/identite/utilisateur/utilisateur.service.js', () => ({
    recupererTousLesUtilisateurs: mockRecupererTousLesUtilisateurs,
    recupererUtilisateurParId: mockRecupererUtilisateurParId,
    modifierRole: mockModifierRole,
    modifierStatut: mockModifierStatut,
    supprimerUtilisateur: mockSupprimerUtilisateur,
}));

// 3) SEULEMENT APRÈS on importe le controller
//    → quand le controller va importer utilisateurService,
//    il va recevoir les mocks au lieu du vrai service
const {
    obtenirTousLesUtilisateurs,
    obtenirUtilisateurParId,
    changerRole,
    changerStatut,
    supprimerUnUtilisateur
} = await import('#Modules/identite/utilisateur/utilisateur.controller.js');


describe('Controller Utilisateur', () => {

    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, user: { id: 'user-1', role: 'ADMINISTRATEUR' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('obtenirTousLesUtilisateurs', () => {

        // Test 1 : Cas succès
        // Déclaration du test asynchrone
        test('doit retourner 200 avec la liste des utilisateurs', async () => {

            // Crée de fausses données (ce que la DB retournerait normalement)
            const mockUtilisateurs = [
                { id_utilisateur: 'u-1', email: 'alice@test.com', role: 'ETUDIANT' },
                { id_utilisateur: 'u-2', email: 'bob@test.com', role: 'PROFESSEUR' }
            ];

            // Dit au mock : "quand on t'appelle, retourne mockUtilisateurs comme si
            // la DB avait répondu"
            mockRecupererTousLesUtilisateurs.mockResolvedValue(mockUtilisateurs);

            // Appelle le vrai controller avec le faux req et res.
            // Le controller va appeler recupererTousLesUtilisateurs()
            // mais au lieu du vrai service, il va tomber sur notre mock
            // qui retourne mockUtilisateurs.
            await obtenirTousLesUtilisateurs(req, res);

            // Vérifie que le controller a bien appelé res.status(200)
            expect(res.status).toHaveBeenCalledWith(200);

            // Vérifie que le controller a bien retourné mockUtilisateurs dans la réponse.
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Utilisateurs récupérés avec succès",
                data: mockUtilisateurs,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            mockRecupererTousLesUtilisateurs.mockRejectedValue(new Error('Erreur DB'));

            await obtenirTousLesUtilisateurs(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération des utilisateurs",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('obtenirUtilisateurParId', () => {

        test('doit retourner 200 avec l\'utilisateur trouvé', async () => {
            req.params.id = 'u-1';
            const mockUtilisateur = { id_utilisateur: 'u-1', email: 'alice@test.com', role: 'ETUDIANT' };
            mockRecupererUtilisateurParId.mockResolvedValue(mockUtilisateur);

            await obtenirUtilisateurParId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Utilisateur récupéré avec succès",
                data: mockUtilisateur,
                erreur: null
            });
        });

        test('doit retourner 404 si utilisateur non trouvé', async () => {
            req.params.id = 'id-inexistant';
            // peu importe l'ID qu'on te passe, retourne toujours null
            mockRecupererUtilisateurParId.mockResolvedValue(null);

            await obtenirUtilisateurParId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 404,
                success: false,
                message: "Utilisateur non trouvé",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id = 'u-1';
            mockRecupererUtilisateurParId.mockRejectedValue(new Error('Erreur DB'));

            await obtenirUtilisateurParId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la récupération de l'utilisateur",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('changerRole', () => {

        test('doit retourner 400 si le rôle est absent du body', async () => {
            req.params.id = 'u-1';
            req.body = {}; // pas de role

            await changerRole(req, res);

            // Le service ne doit pas être appelé
            expect(mockModifierRole).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Le rôle est requis",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 200 avec l\'utilisateur mis à jour', async () => {
            req.params.id = 'u-1';
            req.body = { role: 'PROFESSEUR' };
            const mockResult = { id_utilisateur: 'u-1', email: 'alice@test.com', role: 'PROFESSEUR' };
            mockModifierRole.mockResolvedValue(mockResult);

            await changerRole(req, res);

            expect(mockModifierRole).toHaveBeenCalledWith('u-1', 'PROFESSEUR');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Rôle mis à jour avec succès",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur service', async () => {
            req.params.id = 'u-1';
            req.body = { role: 'ROLE_INVALIDE' };
            mockModifierRole.mockRejectedValue(new Error('Rôle invalide'));

            await changerRole(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de la mise à jour du rôle",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('changerStatut', () => {

        test('doit retourner 400 si le statut est absent du body', async () => {
            req.params.id = 'u-1';
            req.body = {}; // pas de status

            await changerStatut(req, res);

            // Le service ne doit pas être appelé
            expect(mockModifierStatut).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Le statut est requis",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 200 avec le statut mis à jour', async () => {
            req.params.id = 'u-1';
            req.body = { status: 'SUSPENDU' };
            const mockResult = { id_utilisateur: 'u-1', email: 'alice@test.com', status_compte: 'SUSPENDU' };
            mockModifierStatut.mockResolvedValue(mockResult);

            await changerStatut(req, res);

            expect(mockModifierStatut).toHaveBeenCalledWith('u-1', 'SUSPENDU');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Statut mis à jour avec succès",
                data: mockResult,
                erreur: null
            });
        });

        test('doit retourner 400 en cas d\'erreur service', async () => {
            req.params.id = 'u-1';
            req.body = { status: 'STATUT_INVALIDE' };
            mockModifierStatut.mockRejectedValue(new Error('Statut invalide'));

            await changerStatut(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 400,
                success: false,
                message: "Erreur lors de la mise à jour du statut",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

    describe('supprimerUnUtilisateur', () => {

        test('doit retourner 200 après suppression réussie', async () => {
            req.params.id = 'u-1';
            // supprimerUtilisateur ne retourne rien d'utile, juste une promesse résolue
            mockSupprimerUtilisateur.mockResolvedValue({});

            await supprimerUnUtilisateur(req, res);

            expect(mockSupprimerUtilisateur).toHaveBeenCalledWith('u-1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 200,
                success: true,
                message: "Utilisateur supprimé avec succès",
                data: null,
                erreur: null
            });
        });

        test('doit retourner 500 en cas d\'erreur', async () => {
            req.params.id = 'id-inexistant';
            mockSupprimerUtilisateur.mockRejectedValue(new Error('Utilisateur introuvable'));

            await supprimerUnUtilisateur(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 500,
                success: false,
                message: "Erreur lors de la suppression de l'utilisateur",
                data: null,
                erreur: expect.any(String)
            });
        });

    });

});
