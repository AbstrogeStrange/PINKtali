import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 500,
  duration: '5m',
  thresholds: {
    http_req_connecting: ['p(95)<2000'], // Time to first byte threshold
  },
};

export default function () {
  // Simulate fetching the master playlist for a video
  const res = http.get('http://cdn.streamverse.local/videos/vid-1/master.m3u8');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // Simulate fetching a segment
  const segmentRes = http.get('http://cdn.streamverse.local/videos/vid-1/1080p_001.ts');
  check(segmentRes, {
    'segment status is 200': (r) => r.status === 200,
  });

  sleep(2); // Wait between "segments"
}
