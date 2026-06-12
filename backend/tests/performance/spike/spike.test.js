import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.helper.js';

const errorRate = new Rate('errors');

export const options = {
    stages: [
        { duration: '30s', target: 30 },  // trafic normal
        { duration: '1m', target: 30 },  // maintien normal
        { duration: '10s', target: 500 },  // SPIKE brutal : 30 → 500 en 10s
        { duration: '2m', target: 500 },  // maintien du pic
        { duration: '10s', target: 30 },  // retour normal
        { duration: '2m', target: 30 },  // récupération — le système revient-il ?
        { duration: '10s', target: 0 },  // descente
    ],
    thresholds: {
        http_req_failed: ['rate<0.20'],  // on tolère 20% d'erreurs pendant le pic
        http_req_duration: ['p(95)<5000'], // p95 < 5s pendant le pic
        errors: ['rate<0.20'],
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

    const me = http.get(`${BASE_URL}/api/auth/me`, headers);
    check(me, { 'GET /auth/me → 200': (r) => r.status === 200 });
    errorRate.add(me.status !== 200);

    sleep(1);

    const projets = http.get(`${BASE_URL}/api/projets`, headers);
    check(projets, { 'GET /projets → 200': (r) => r.status === 200 });
    errorRate.add(projets.status !== 200);

    sleep(1);
}