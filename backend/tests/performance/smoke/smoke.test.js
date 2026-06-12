import http from 'k6/http';
import { check, sleep } from 'k6';
import { login, authHeaders, BASE_URL } from '../helpers/auth.helper.js';

export const options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate<0.01'],   // moins de 1% d'erreurs
        http_req_duration: ['p(95)<1000'],  // 95% des requêtes < 1s
    },
};

const EMAIL = __ENV.TEST_EMAIL || 'test@trusty.com';
const PASSWORD = __ENV.TEST_PASSWORD || 'Password123';

// setup() s'exécute UNE SEULE FOIS avant tous les VUs
// → login fait 1 seule fois, token réutilisé dans toutes les itérations
// → évite de déclencher le rate limiter sur /api/auth/login
export function setup() {
    const token = login(EMAIL, PASSWORD);
    return { token };
}

export default function (data) {
    const headers = authHeaders(data.token);

    // 1. Mon profil
    const me = http.get(`${BASE_URL}/api/auth/me`, headers);
    check(me, { 'GET /auth/me → 200': (r) => r.status === 200 });

    // 2. Liste des projets
    const projets = http.get(`${BASE_URL}/api/projets`, headers);
    check(projets, { 'GET /projets → 200': (r) => r.status === 200 });

    // 3. Formations de l'étudiant
    const idEtudiant = me.json()?.data?.id_utilisateur;
    if (idEtudiant) {
        const formations = http.get(`${BASE_URL}/api/formations/etudiant/${idEtudiant}`, headers);
        check(formations, { 'GET /formations → 200': (r) => r.status === 200 });
    }

    // 4. Mes notifications
    const notifs = http.get(`${BASE_URL}/api/notifications`, headers);
    check(notifs, { 'GET /notifications → 200': (r) => r.status === 200 });

    sleep(1);
}