/**
 * OSM Nominatim에서 공주시 행정경계 폴리곤을 받아 lib/gongju-polygon.json 으로 저장.
 * 실행: node scripts/fetch-gongju-polygon.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'lib', 'gongju-polygon.json');

const url =
  'https://nominatim.openstreetmap.org/search?q=' +
  encodeURIComponent('공주시 충청남도 대한민국') +
  '&format=json&polygon_geojson=1&limit=1';

const res = await fetch(url, {
  headers: { 'User-Agent': 'GongjuEnvComplaint/1.0 (boundary sync)' },
});
if (!res.ok) throw new Error(`Nominatim ${res.status}`);
const data = await res.json();
const ring = data[0]?.geojson?.coordinates?.[0];
if (!Array.isArray(ring) || ring.length < 4) throw new Error('Invalid polygon');
fs.writeFileSync(out, JSON.stringify({ ring }));
console.log('Wrote', out, 'vertices:', ring.length);
