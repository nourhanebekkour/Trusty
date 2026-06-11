import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Réessayez dans 1 minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Trop de demandes de réinitialisation. Réessayez dans 1 minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
