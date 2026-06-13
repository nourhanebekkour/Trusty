import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.helper.js';

const errorRate = new Rate('errors');
const profileTime = new Trend('profile_duration', true);

export const options = {
    stages: [
        { duration: '2m', target: 100 },  // montée douce
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 600 },
        { duration: '2m', target: 700 },
        { duration: '2m', target: 800 },
        { duration: '2m', target: 900 },
        { duration: '2m', target: 1000 },  // point de rupture attendu
    ],
    thresholds: {
        http_req_failed: ['rate<0.30'],   // on tolère 30% d'erreurs avant d'arrêter
        errors: ['rate<0.30'],
    },
};

const EMAIL = __ENV.TEST_EMAIL || 'etudiant1@etu.uae.ac.ma';
const PASSWORD = __ENV.TEST_PASSWORD || 'password123';

export function setup() {
    const token = login(EMAIL, PASSWORD);
    return { token };
}

export default function (data) {
    const headers = authHeaders(data.token);

    const me = http.get(`${BASE_URL}/api/auth/me`, headers);
    check(me, { 'GET /auth/me → 200': (r) => r.status === 200 });
    profileTime.add(me.timings.duration);
    errorRate.add(me.status !== 200);
    sleep(1);

    const projets = http.get(`${BASE_URL}/api/projets`, headers);
    check(projets, { 'GET /projets → 200': (r) => r.status === 200 });
    errorRate.add(projets.status !== 200);
    sleep(1);
}