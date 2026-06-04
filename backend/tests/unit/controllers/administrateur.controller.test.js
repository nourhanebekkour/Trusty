import { jest } from '@jest/globals';

// on crée un fake pour chaque fonction du service
const mockAjouterOuModifierAdmin = jest.fn();
const mockRecupererAdminParId = jest.fn();
const mockRecupererTousLesAdmins = jest.fn();
const mockMettreAJourAvatar = jest.fn();

// on remplace le vrai service par nos fakes avant l'import du controller
await jest.unstable_mockModule('#Modules/identite/administrateur/administrateur.service.js', () => ({
    ajouterOuModifierAdmin: mockAjouterOuModifierAdmin,
    recupererAdminParId: mockRecupererAdminParId,
    recupererTousLesAdmins: mockRecupererTousLesAdmins,
    mettreAJourAvatar: mockMettreAJourAvatar,
}));

// import du controller après les mocks
const {
    createOrUpdateProfile,
    getProfileByID,
    getProfiles,
    uploadAvatar,
} = await import('#Modules/identite/administrateur/administrateur.controller.js');

// req et res simulés , recréés avant chaque test
let req, res;

beforeEach(() => {
    req = {
        params: { id: 'a1' },   // simule l'id dans l'url /:id
        body: {},              // simule le body de la requête
        file: null,            // simule le fichier uploadé (multer)
        user: { id: 'u1' },   // injecté par authMiddleware
    };
    res = {
        status: jest.fn().mockReturnThis(), // .mockReturnThis() permet res.status(200).json(...)
        json: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    };
    jest.clearAllMocks(); // remet tous les jest.fn() à zéro entre chaque test
});

describe('createOrUpdateProfile', () => {

    test('retourne 200 si le service réussit', async () => {
        const mockProfil = { id_administrateur: 'a1', niveau_acces: 'ADMIN' };
        // on dit au fake service de retourner ce profil
        mockAjouterOuModifierAdmin.mockResolvedValue(mockProfil);

        await createOrUpdateProfile(req, res);

        // le controller doit répondre 200 avec success: true
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Administrateur créé ou mis à jour avec succès',
            data: mockProfil,
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        // le service plante — le controller doit attraper l'erreur
        mockAjouterOuModifierAdmin.mockRejectedValue(new Error('Erreur BDD'));

        await createOrUpdateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Erreur lors du traitement du profil',
        }));
    });
});

describe('getProfileByID', () => {

    test('retourne 200 avec le profil si trouvé', async () => {
        const mockProfil = { id_administrateur: 'a1', niveau_acces: 'ADMIN' };
        mockRecupererAdminParId.mockResolvedValue(mockProfil);

        await getProfileByID(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: mockProfil,
        }));
    });

    test('retourne 404 si le service retourne null (admin inexistant)', async () => {
        // null = pas trouvé en BDD
        mockRecupererAdminParId.mockResolvedValue(null);

        await getProfileByID(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Utilisateur introuvable',
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        mockRecupererAdminParId.mockRejectedValue(new Error('Erreur BDD'));

        await getProfileByID(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});

describe('getProfiles', () => {

    test('retourne 200 avec la liste des admins', async () => {
        const mockProfils = [
            { id_administrateur: 'a1' },
            { id_administrateur: 'a2' },
        ];
        mockRecupererTousLesAdmins.mockResolvedValue(mockProfils);

        await getProfiles(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: mockProfils,
        }));
    });

    test('retourne 500 si le service lève une erreur', async () => {
        mockRecupererTousLesAdmins.mockRejectedValue(new Error('Erreur BDD'));

        await getProfiles(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});

describe('uploadAvatar', () => {

    test('retourne 400 si aucun fichier fourni (req.file est null)', async () => {
        // req.file est null par défaut dans notre beforeEach
        await uploadAvatar(req, res);

        // le service ne doit jamais être appelé si pas de fichier
        expect(mockMettreAJourAvatar).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Aucun fichier fourni',
        }));
    });

    test('retourne 200 si l\'upload réussit', async () => {
        // on simule un fichier uploadé par multer
        req.file = { originalname: 'photo.jpg', buffer: Buffer.from('data'), mimetype: 'image/jpeg' };
        mockMettreAJourAvatar.mockResolvedValue({
            url: 'http://minio/photo.jpg',
            nom_stockage: 'avatars/photo.jpg',
        });

        await uploadAvatar(req, res);

        // le service doit être appelé avec l'id, le fichier et l'id de l'utilisateur connecté
        expect(mockMettreAJourAvatar).toHaveBeenCalledWith('a1', req.file, 'u1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Photo de profil mise à jour',
        }));
    });

    test('retourne 404 si le service lève "Administrateur non trouvé"', async () => {
        req.file = { originalname: 'photo.jpg', buffer: Buffer.from('data') };
        // le service lève cette erreur exacte → le controller doit retourner 404
        mockMettreAJourAvatar.mockRejectedValue(new Error('Administrateur non trouvé'));

        await uploadAvatar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Administrateur non trouvé',
        }));
    });

    test('retourne 500 si le service lève une autre erreur', async () => {
        req.file = { originalname: 'photo.jpg', buffer: Buffer.from('data') };
        // toute autre erreur → 500
        mockMettreAJourAvatar.mockRejectedValue(new Error('MinIO indisponible'));

        await uploadAvatar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });
});
