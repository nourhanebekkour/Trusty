import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.helper.js';

// Métriques custom pour suivre des endpoints spécifiques
const errorRate = new Rate('errors');
const profileTime = new Trend('profile_duration', true);
const projetsTime = new Trend('projets_duration', true);
const notifTime = new Trend('notifs_duration', true);

export const options = {
    stages: [
        { duration: '30s', target: 30 },  // montée : 0 → 30 VUs
        { duration: '1m', target: 30 },  // maintien à 30 VUs
        { duration: '30s', target: 0 },  // descente : 30 → 0 VUs
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],         // moins de 5% d'erreurs
        http_req_duration: ['p(95)<1000'],        // 95% < 1s
        errors: ['rate<0.05'],
        profile_duration: ['p(95)<500'],         // /auth/me doit répondre < 500ms
        projets_duration: ['p(95)<800'],
        notifs_duration: ['p(95)<500'],
    },
};

const EMAIL = __ENV.TEST_EMAIL || 'test@trusty.com';
const PASSWORD = __ENV.TEST_PASSWORD || 'Password123';

// Login une seule fois avant tous les VUs
export function setup() {
    const token = login(EMAIL, PASSWORD);
    return { token };
}

// Parcours utilisateur complet : ce qu'un vrai étudiant fait sur l'app
export default function (data) {
    const headers = authHeaders(data.token);

    // 1. Consulter son profil
    const me = http.get(`${BASE_URL}/api/auth/me`, headers);
    check(me, { 'GET /auth/me → 200': (r) => r.status === 200 });
    profileTime.add(me.timings.duration);
    errorRate.add(me.status !== 200);

    sleep(1);

    // 2. Parcourir la liste des projets
    const projets = http.get(`${BASE_URL}/api/projets`, headers);
    check(projets, { 'GET /projets → 200': (r) => r.status === 200 });
    projetsTime.add(projets.timings.duration);
    errorRate.add(projets.status !== 200);

    sleep(1);

    // 3. Voir ses formations
    const idEtudiant = me.json()?.data?.id_utilisateur;
    if (idEtudiant) {
        const formations = http.get(`${BASE_URL}/api/formations/etudiant/${idEtudiant}`, headers);
        check(formations, { 'GET /formations → 200': (r) => r.status === 200 });
        errorRate.add(formations.status !== 200);
        sleep(1);
    }

    // 4. Vérifier ses notifications
    const notifs = http.get(`${BASE_URL}/api/notifications`, headers);
    check(notifs, { 'GET /notifications → 200': (r) => r.status === 200 });
    notifTime.add(notifs.timings.duration);
    errorRate.add(notifs.status !== 200);

    // dans user-journey.load.js — après les notifications
    const portfolio = http.get(`${BASE_URL}/api/portfolio/etudiant/${idEtudiant}`, headers);
    check(portfolio, { 'GET /portfolio → 200': (r) => r.status === 200 });
    errorRate.add(portfolio.status !== 200);
    sleep(1);

    sleep(1);
}