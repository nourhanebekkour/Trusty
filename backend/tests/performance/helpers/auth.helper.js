import http from 'k6/http';
import { check } from 'k6';
// http pour faire des requêtes
// check pour les assertions (mesurer taux de succès)
// k6 n'est pas Node.js donc on peut pas utiliser axios

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
// __ENV est une variable globale k6 qui lit les 
// variables d'environnement 
// ça permet de faire k6 run --env BASE_URL=http://mon-serveur.com script.js
// si rien n'est passé -> fallback sur localhost:3000

export function login(email, password) {
    const res = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email, password }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, { 'login réussi': (r) => r.status === 200 });

    const cookie = res.cookies['accessToken'];
    return cookie ? cookie[0].value : null;
}
// On fait le POST login, on vérifie le status 200,
// et on retourne le token. Si le login échoue → retourne null


export function authHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            Cookie: `accessToken=${token}`,
        },
    };
}

// Le backend met le token dans un cookie HttpOnly,
// pas dans le body donc on doit l'envoyer via Cookie:
// et non Authorization: Bearer


// Retourne l'objet headers prêt à être passé à n'importe 
// quelle requête HTTP protégée.


// Ce fichier est la base commune importée par tous les autres scripts de test.
// Il évite de réécrire à chaque fichier :
// l'URL de base de l'API
// la logique de login (POST + extraction du token)
// la construction des headers Bearer