import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.helper.js';

const errorRate = new Rate('errors');
const profileTime = new Trend('profile_duration', true);
const projetsTime = new Trend('projets_duration', true);

export const options = {
    stages: [
        { duration: '30s', target: 30 },  // baseline
        { duration: '1m', target: 30 },
        { duration: '30s', target: 100 },  // x3
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },  // x6
        { duration: '1m', target: 200 },
        { duration: '30s', target: 350 },  // x10
        { duration: '1m', target: 350 },
        { duration: '30s', target: 500 },  // max
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },  // descente
    ],
    thresholds: {
        http_req_failed: ['rate<0.10'],   // on tolère jusqu'à 10% d'erreurs
        http_req_duration: ['p(95)<3000'],  // p95 < 3s (plus souple qu'en load)
        errors: ['rate<0.10'],
    },
};

const EMAIL = __ENV.TEST_EMAIL || 'test@trusty.com';
const PASSWORD = __ENV.TEST_PASSWORD || 'Password123';

export function setup() {
    const token = login(EMAIL, PASSWORD);
    return { token };
}

export default function (data) {
    const headers = authHeaders(data.token);

    // 1. Profil
    const me = http.get(`${BASE_URL}/api/auth/me`, headers);
    check(me, { 'GET /auth/me → 200': (r) => r.status === 200 });
    profileTime.add(me.timings.duration);
    errorRate.add(me.status !== 200);

    sleep(1);

    // 2. Projets
    const projets = http.get(`${BASE_URL}/api/projets`, headers);
    check(projets, { 'GET /projets → 200': (r) => r.status === 200 });
    projetsTime.add(projets.timings.duration);
    errorRate.add(projets.status !== 200);

    sleep(1);

    // 3. Notifications
    const notifs = http.get(`${BASE_URL}/api/notifications`, headers);
    check(notifs, { 'GET /notifications → 200': (r) => r.status === 200 });
    errorRate.add(notifs.status !== 200);

    sleep(1);
}