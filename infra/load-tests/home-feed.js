import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // ramp up to 100 users
    { duration: '3m', target: 1000 }, // ramp up to 1000 users
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // error rate must be less than 1%
  },
};

export default function () {
  const res = http.get('http://api.streamverse.local/api/v1/feed/home');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => r.json().data.length > 0,
  });
  sleep(1);
}
