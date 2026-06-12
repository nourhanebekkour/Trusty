import { jest } from '@jest/globals';

// --- Mock nodemailer (transporter créé au load du module) ---
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

await jest.unstable_mockModule('nodemailer', () => ({
    default: {
        createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
    },
}));

const {
    envoyerEmailReinitialisation,
    envoyerEmailCredentiels,
    envoyerEmailDemandeCompte,
    envoyerEmailVerification,
} = await import('#Modules/systeme/emails/emails.service.js');

beforeEach(() => {
    jest.resetAllMocks();
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });
});

// ─────────────────────────────────────────────────
describe('envoyerEmailReinitialisation', () => {

    test('appelle sendMail avec le bon destinataire et le bon lien', async () => {
        await envoyerEmailReinitialisation('user@test.com', 'tok-123');

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const options = mockSendMail.mock.calls[0][0];
        expect(options.to).toBe('user@test.com');
        expect(options.subject).toMatch(/[Rr]éinitialisation/);
        expect(options.html).toContain('tok-123');
        expect(options.html).toContain('reset-password');
    });

    test('propage l\'erreur si sendMail échoue', async () => {
        mockSendMail.mockRejectedValue(new Error('SMTP error'));

        await expect(envoyerEmailReinitialisation('user@test.com', 'tok'))
            .rejects.toThrow('SMTP error');
    });
});

// ─────────────────────────────────────────────────
describe('envoyerEmailCredentiels', () => {

    test('appelle sendMail avec les infos du compte', async () => {
        await envoyerEmailCredentiels('admin@test.com', 'Dupont', 'Jean', 'mdp-tmp', 'ADMINISTRATEUR');

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const options = mockSendMail.mock.calls[0][0];
        expect(options.to).toBe('admin@test.com');
        expect(options.subject).toMatch(/compte/i);
        expect(options.html).toContain('Jean');
        expect(options.html).toContain('Dupont');
        expect(options.html).toContain('mdp-tmp');
        expect(options.html).toContain('ADMINISTRATEUR');
    });

    test('propage l\'erreur si sendMail échoue', async () => {
        mockSendMail.mockRejectedValue(new Error('SMTP error'));

        await expect(envoyerEmailCredentiels('a@test.com', 'N', 'P', 'mdp', 'ETUDIANT'))
            .rejects.toThrow('SMTP error');
    });
});

// ─────────────────────────────────────────────────
describe('envoyerEmailDemandeCompte', () => {

    test('inclut le message si fourni', async () => {
        await envoyerEmailDemandeCompte('Dupont', 'Jean', 'jean@test.com', 'PROFESSIONNEL', 'Je veux rejoindre');

        const options = mockSendMail.mock.calls[0][0];
        expect(options.subject).toContain('PROFESSIONNEL');
        expect(options.html).toContain('Jean');
        expect(options.html).toContain('jean@test.com');
        expect(options.html).toContain('Je veux rejoindre');
    });

    test('n\'inclut pas de balise message si message absent', async () => {
        await envoyerEmailDemandeCompte('Dupont', 'Jean', 'jean@test.com', 'PROFESSIONNEL', null);

        const options = mockSendMail.mock.calls[0][0];
        expect(options.html).not.toContain('<strong>Message');
    });

    test('propage l\'erreur si sendMail échoue', async () => {
        mockSendMail.mockRejectedValue(new Error('SMTP error'));

        await expect(envoyerEmailDemandeCompte('N', 'P', 'e@t.com', 'PROF', null))
            .rejects.toThrow('SMTP error');
    });
});

// ─────────────────────────────────────────────────
describe('envoyerEmailVerification', () => {

    test('appelle sendMail avec le bon lien de vérification', async () => {
        await envoyerEmailVerification('new@test.com', 'verify-tok-456');

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const options = mockSendMail.mock.calls[0][0];
        expect(options.to).toBe('new@test.com');
        expect(options.subject).toMatch(/[Vv]érification/);
        expect(options.html).toContain('verify-tok-456');
        expect(options.html).toContain('verify-email');
    });

    test('propage l\'erreur si sendMail échoue', async () => {
        mockSendMail.mockRejectedValue(new Error('SMTP error'));

        await expect(envoyerEmailVerification('u@t.com', 'tok'))
            .rejects.toThrow('SMTP error');
    });
});