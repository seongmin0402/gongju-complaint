/**
 * 실패한 28개 CCTV 주소 재시도
 * node scripts/geocode-retry.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CLIENT_ID = 'qwwyia25gh';
const CLIENT_SECRET = 'PFjfxkuF16yp8a64dgzZmeCy4xCGORZUmGJrpwtI';

// 실패한 항목들 — 여러 쿼리 순서로 시도
const FAILED = [
  { row_no: 84,  jurisdiction: '중학동', install_location: '봉황동 273-3',    note: '효심3길 공영주차장 부근',
    queries: ['충청남도 공주시 봉황동 273-3', '충청남도 공주시 봉황동 효심3길'] },
  { row_no: 86,  jurisdiction: '중학동', install_location: '반죽동 110-5',    note: '반죽하봉1길 11-2 앞 골목길',
    queries: ['충청남도 공주시 반죽동 110-5', '충청남도 공주시 반죽하봉1길 11-2'] },
  { row_no: 88,  jurisdiction: '웅진동', install_location: '산성동 31-5',     note: '고개마을길 21-1 앞 골목길',
    queries: ['충청남도 공주시 산성동 31-5', '충청남도 공주시 산성동 고개마을길 21-1'] },
  { row_no: 89,  jurisdiction: '웅진동', install_location: '교동 2',          note: '',
    queries: ['충청남도 공주시 교동 2', '충청남도 공주시 웅진동 교동'] },
  { row_no: 90,  jurisdiction: '웅진동', install_location: '교동 211',        note: '향교1길 30 담벼락',
    queries: ['충청남도 공주시 교동 211', '충청남도 공주시 향교1길 30'] },
  { row_no: 91,  jurisdiction: '웅진동', install_location: '금성동 97-6',     note: '청송맨션 앞 공터 내',
    queries: ['충청남도 공주시 금성동 97-6', '충청남도 공주시 금성동'] },
  { row_no: 95,  jurisdiction: '웅진동', install_location: '교동 2',          note: '웅진교 부근',
    queries: ['충청남도 공주시 교동 2', '충청남도 공주시 웅진교'] },
  { row_no: 96,  jurisdiction: '웅진동', install_location: '교동 120',        note: '공주시 재활용센터 앞',
    queries: ['충청남도 공주시 교동 120', '충청남도 공주시 교동'] },
  { row_no: 97,  jurisdiction: '웅진동', install_location: '산성동 195',      note: '산성교',
    queries: ['충청남도 공주시 산성동 195', '충청남도 공주시 산성동'] },
  { row_no: 103, jurisdiction: '금학동', install_location: '주미동 산27-3',   note: '주미동노인회관 주차장 내',
    queries: ['충청남도 공주시 주미동', '충청남도 공주시 주미동 산27'] },
  { row_no: 104, jurisdiction: '금학동', install_location: '봉정동 402-2',    note: '천안논산고속도로 본사 집입로 부근',
    queries: ['충청남도 공주시 봉정동 402-2', '충청남도 공주시 봉정동'] },
  { row_no: 105, jurisdiction: '금학동', install_location: '오곡동 849',      note: '점촌 버스승강장(오곡동 658-5) 부근',
    queries: ['충청남도 공주시 오곡동 849', '충청남도 공주시 오곡동 658-5', '충청남도 공주시 오곡동'] },
  { row_no: 106, jurisdiction: '금학동', install_location: '태봉동 327-3',    note: '태봉1동(모세골) 버스승강장 부근',
    queries: ['충청남도 공주시 태봉동 327-3', '충청남도 공주시 태봉동'] },
  { row_no: 107, jurisdiction: '금학동', install_location: '오곡동 767-1',    note: '마을 진출입로',
    queries: ['충청남도 공주시 오곡동 767-1', '충청남도 공주시 오곡동'] },
  { row_no: 110, jurisdiction: '옥룡동', install_location: '대추골1길 60-2',  note: '대추골1길 버스승강장 부근',
    queries: ['충청남도 공주시 대추골1길 60-2', '충청남도 공주시 옥룡동 대추골1길'] },
  { row_no: 112, jurisdiction: '옥룡동', install_location: '신기동 368-1',    note: '효포초등학교 앞 육교/효포교 사이',
    queries: ['충청남도 공주시 신기동 368-1', '충청남도 공주시 신기동'] },
  { row_no: 113, jurisdiction: '옥룡동', install_location: '옥룡동 244-4',    note: '대추골1길 17 앞 골목길',
    queries: ['충청남도 공주시 옥룡동 244-4', '충청남도 공주시 옥룡동'] },
  { row_no: 114, jurisdiction: '옥룡동', install_location: '상왕동 847-11',   note: '하왕촌교 초입 교차로 상왕2통 버스승강장',
    queries: ['충청남도 공주시 상왕동 847-11', '충청남도 공주시 상왕동'] },
  { row_no: 115, jurisdiction: '옥룡동', install_location: '중골1길 21-2',    note: '다솜원룸 부근',
    queries: ['충청남도 공주시 중골1길 21-2', '충청남도 공주시 옥룡동 중골1길'] },
  { row_no: 116, jurisdiction: '옥룡동', install_location: '소학동 151',      note: '학소교 아래 하천부지 내',
    queries: ['충청남도 공주시 소학동 151', '충청남도 공주시 소학동'] },
  { row_no: 123, jurisdiction: '신관동', install_location: '흑수골길 38-6',   note: '흑수골길 38-6 부근 골목길',
    queries: ['충청남도 공주시 흑수골길 38-6', '충청남도 공주시 신관동 흑수골길'] },
  { row_no: 124, jurisdiction: '신관동', install_location: '신금2길 38-6',    note: '신금2길 38-6 옆 골목길',
    queries: ['충청남도 공주시 신금2길 38-6', '충청남도 공주시 신관동 신금2길'] },
  { row_no: 125, jurisdiction: '신관동', install_location: '시목길 2',        note: '시목길 2 옆 골목길 초입',
    queries: ['충청남도 공주시 시목길 2', '충청남도 공주시 신관동 시목길'] },
  { row_no: 127, jurisdiction: '신관동', install_location: '월미동 277',      note: '마을운동기구(월미동 352) 부근',
    queries: ['충청남도 공주시 월미동 277', '충청남도 공주시 월미동 352', '충청남도 공주시 월미동'] },
  { row_no: 128, jurisdiction: '신관동', install_location: '월미동길 63',     note: '월미1통 마을공동기계 보관창고 옆',
    queries: ['충청남도 공주시 월미동길 63', '충청남도 공주시 신관동 월미동길'] },
  { row_no: 135, jurisdiction: '월송동', install_location: '무릉동 448',      note: '느랏마을 버스승강장 부근',
    queries: ['충청남도 공주시 무릉동 448', '충청남도 공주시 무릉동'] },
  { row_no: 136, jurisdiction: '월송동', install_location: '송선동 657',      note: '천년갈비 맞은편 버스승강장',
    queries: ['충청남도 공주시 송선동 657', '충청남도 공주시 송선동'] },
  { row_no: 137, jurisdiction: '월송동', install_location: '금흥동 287-11',   note: '서우마트 앞 교차로',
    queries: ['충청남도 공주시 금흥동 287-11', '충청남도 공주시 금흥동'] },
  { row_no: 139, jurisdiction: '월송동', install_location: '상왕동 815-4',    note: '초려 이유태 유허지 진입로',
    queries: ['충청남도 공주시 상왕동 815-4', '충청남도 공주시 상왕동'] },
];

async function geocode(query) {
  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
      'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.addresses?.length) return null;
  const addr = data.addresses[0];
  const lat = parseFloat(addr.y);
  const lng = parseFloat(addr.x);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return { lat, lng };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

console.log(`실패 ${FAILED.length}개 재시도…\n`);

const found = [];
const stillFail = [];

for (const item of FAILED) {
  let result = null;
  let usedQ = '';
  for (const q of item.queries) {
    try {
      const c = await geocode(q);
      if (c) { result = c; usedQ = q; break; }
    } catch(e) { /* skip */ }
    await sleep(100);
  }
  if (result) {
    console.log(`[${String(item.row_no).padStart(3)}] ✓  ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}  ← ${usedQ}`);
    found.push({ row_no: item.row_no, lat: result.lat, lng: result.lng });
  } else {
    console.log(`[${String(item.row_no).padStart(3)}] ✗  FAIL`);
    stillFail.push(item.row_no);
  }
  await sleep(120);
}

console.log(`\n재시도 결과: 성공 ${found.length}건 / 실패 ${stillFail.length}건`);
if (stillFail.length) console.log('여전히 실패:', stillFail.join(', '));

// 성공한 항목을 cctv-coords.ts에 패치
if (found.length === 0) { console.log('패치할 항목 없음'); process.exit(0); }

const coordsPath = join(__dirname, '..', 'lib', 'cctv-coords.ts');
let src = readFileSync(coordsPath, 'utf8');

for (const { row_no, lat, lng } of found) {
  // null → 좌표로 교체
  src = src.replace(
    new RegExp(`(row_no: ${row_no},[^}]+)lat: null, lng: null \\}, // geocode failed`),
    `$1lat: ${lat}, lng: ${lng} },`
  );
}

writeFileSync(coordsPath, src, 'utf8');
console.log(`\nlib/cctv-coords.ts 패치 완료 (${found.length}건 업데이트)`);
