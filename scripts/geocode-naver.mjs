/**
 * 네이버 Geocoding API로 CCTV 주소 → 좌표 일괄 변환
 * node scripts/geocode-naver.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CLIENT_ID = 'qwwyia25gh';
const CLIENT_SECRET = 'PFjfxkuF16yp8a64dgzZmeCy4xCGORZUmGJrpwtI';

const RAW = [
  { row_no: 1, jurisdiction: '유구읍', install_location: '유구읍 유구리 379-6', note: '유구마곡사로 131 진입구간' },
  { row_no: 2, jurisdiction: '유구읍', install_location: '유구읍 백교리 60-1', note: '좋은교회(만천길 15-2) 건너편' },
  { row_no: 3, jurisdiction: '유구읍', install_location: '유구읍 석남리 368-3', note: '' },
  { row_no: 4, jurisdiction: '유구읍', install_location: '유구읍 석남리 380-12', note: '유구자원(유구외곽로 221) 입구부근 교차로' },
  { row_no: 5, jurisdiction: '유구읍', install_location: '유구읍 석남리 220-1', note: '애플하우스(수촌중앙길 9) 건너편' },
  { row_no: 6, jurisdiction: '유구읍', install_location: '유구읍 석남리 212-6', note: '등운야식(중앙1길 130) 건너편' },
  { row_no: 7, jurisdiction: '유구읍', install_location: '유구읍 석남리 57-20', note: '미주그린빌라(수촌중앙길 22) 맞은편 공터' },
  { row_no: 8, jurisdiction: '유구읍', install_location: '유구읍 녹천리 26-20', note: '녹천교 부근' },
  { row_no: 9, jurisdiction: '유구읍', install_location: '유구읍 유구리 460-2', note: '고속도로순찰대 제2지구대 집입교차로 부근' },
  { row_no: 10, jurisdiction: '유구읍', install_location: '유구읍 백교리 98-4', note: '백교1리 마을입구' },
  { row_no: 11, jurisdiction: '유구읍', install_location: '유구읍 석남리 303-3', note: '근화아파트 정문 마을정자 건너편' },
  { row_no: 12, jurisdiction: '유구읍', install_location: '유구읍 신영리 443-4', note: '신영2리 버스승강장 부근' },
  { row_no: 13, jurisdiction: '유구읍', install_location: '유구읍 석남리 442-4', note: '유구시장 광장 내' },
  { row_no: 14, jurisdiction: '유구읍', install_location: '유구읍 백교리 15-3', note: '유구마이스터고 삼거리' },
  { row_no: 15, jurisdiction: '이인면', install_location: '이인면 목동리 414-3', note: '목동(남월) 버스승강장 부근' },
  { row_no: 16, jurisdiction: '이인면', install_location: '이인면 발양리 871', note: '발양리 경로당(고분티로 241) 주차장 내' },
  { row_no: 17, jurisdiction: '이인면', install_location: '이인면 초봉리 272-1', note: '초봉리 마을회관(숭선군로 127) 건너편 공터 클린하우스' },
  { row_no: 18, jurisdiction: '이인면', install_location: '이인면 초봉리 78-1', note: '장익는마을 농촌체험관 주차장 내' },
  { row_no: 19, jurisdiction: '이인면', install_location: '이인면 이인리 428-7', note: '우릉골2길 15-2 앞' },
  { row_no: 20, jurisdiction: '탄천면', install_location: '탄천면 분강리 산38-8', note: '분강리 버스승강장 부근' },
  { row_no: 21, jurisdiction: '탄천면', install_location: '탄천면 덕지리 226-6', note: '덕지리 창고(하효동길 81) 앞 교차로 내' },
  { row_no: 22, jurisdiction: '탄천면', install_location: '탄천면 삼각리 487-1', note: '공주소방서 탄천면119지역대 옆 공중화장실(통산로 182-5) 부근' },
  { row_no: 23, jurisdiction: '탄천면', install_location: '탄천면 덕지리 673', note: '월량이천교 부근' },
  { row_no: 24, jurisdiction: '탄천면', install_location: '탄천면 덕지리 696', note: '공주시 탄천면 덕지리 682-6 부근 덕지리 버스승강장 건너편' },
  { row_no: 25, jurisdiction: '계룡면', install_location: '계룡면 화은리 174-3', note: '도로 합류지점' },
  { row_no: 26, jurisdiction: '계룡면', install_location: '계룡면 중장리 328-5', note: '계룡커피농장(왕흥장악로 67) 입구 부근 교차로' },
  { row_no: 27, jurisdiction: '계룡면', install_location: '계룡면 양화리 53-1', note: '공중화장실(신원사로 526) 앞 주차장 내' },
  { row_no: 28, jurisdiction: '계룡면', install_location: '계룡면 경천리 822-13', note: '경천교 초입 부근' },
  { row_no: 29, jurisdiction: '계룡면', install_location: '계룡면 경천리 55-10', note: '돌정길 17 담벼락' },
  { row_no: 30, jurisdiction: '계룡면', install_location: '계룡면 봉명리 492-12', note: '신봉교 부근 봉명리 마을집하장' },
  { row_no: 31, jurisdiction: '계룡면', install_location: '계룡면 유평리 405-1', note: '신곡길 32 부근 마을공터 내' },
  { row_no: 32, jurisdiction: '계룡면', install_location: '계룡면 내흥리 545-2', note: '내흥삼거리 부근' },
  { row_no: 33, jurisdiction: '계룡면', install_location: '계룡면 기산리 377-19', note: '원동교 통로박스 교차로 부근' },
  { row_no: 34, jurisdiction: '계룡면', install_location: '계룡면 경천리 500-1', note: '상평마을 버스승강장 부근' },
  { row_no: 35, jurisdiction: '계룡면', install_location: '계룡면 경천리 62-15', note: '돌정길 7 부근' },
  { row_no: 36, jurisdiction: '계룡면', install_location: '계룡면 중장리 723-26', note: '중장3리 마을회관 초입' },
  { row_no: 37, jurisdiction: '반포면', install_location: '반포면 학봉리 814', note: '' },
  { row_no: 38, jurisdiction: '반포면', install_location: '반포면 상신리 575-1', note: '도예촌 집입구간 클린하우스 부근' },
  { row_no: 39, jurisdiction: '반포면', install_location: '반포면 마암리 339-2', note: '할매순대국밥(금벽로 1351) 옆 충남과학고등학교 교차로 부근' },
  { row_no: 40, jurisdiction: '반포면', install_location: '반포면 학봉리 469-11', note: '장군봉 공영주차장 초입' },
  { row_no: 41, jurisdiction: '반포면', install_location: '반포면 봉곡리 421', note: '시골영양탕(과수원길 3) 건너편 봉곡리 공동집하장' },
  { row_no: 42, jurisdiction: '반포면', install_location: '반포면 공암리 451-2', note: '반포초 교차로 부근' },
  { row_no: 43, jurisdiction: '반포면', install_location: '반포면 공암리 산 11-19', note: '반포농협 건너편 현수막게시대 부근' },
  { row_no: 44, jurisdiction: '반포면', install_location: '반포면 마암리 569-5', note: '반포마암 마을하수도 부근' },
  { row_no: 45, jurisdiction: '의당면', install_location: '의당면 청룡리 677-25', note: '와룡교 초입' },
  { row_no: 46, jurisdiction: '의당면', install_location: '의당면 가산리 8-2', note: '태산리 버스승강장 부근' },
  { row_no: 47, jurisdiction: '의당면', install_location: '의당면 중흥리 634-4', note: '중흥리 634-4 교차로 내' },
  { row_no: 48, jurisdiction: '의당면', install_location: '의당면 도신리 632', note: '청송염소탕(의당전의로 1240) 건너편 도신교 초입 마을정자 부근' },
  { row_no: 49, jurisdiction: '의당면', install_location: '의당면 수촌리 31-5', note: '수촌리 회전교차로 부근' },
  { row_no: 50, jurisdiction: '의당면', install_location: '의당면 유계리 279', note: '유계길 47-2 부근 분리수거장' },
  { row_no: 51, jurisdiction: '정안면', install_location: '정안면 월산리 4-1', note: '월산1리 진입로 월산교 초입' },
  { row_no: 52, jurisdiction: '정안면', install_location: '정안면 사현리 254-2', note: '사현교 초입(정안농공단지 > 사현1리)' },
  { row_no: 53, jurisdiction: '정안면', install_location: '정안면 하정안길 69', note: '고속도로 고가 아래' },
  { row_no: 54, jurisdiction: '정안면', install_location: '정안면 대산리 27-14', note: '고속도로 고가 아래 대산리 창고(정안마곡사로 33) 옆 공터' },
  { row_no: 55, jurisdiction: '정안면', install_location: '정안면 대산리 458-15', note: '대산2리 마을회관 건너편 노죽교 초입 부근' },
  { row_no: 56, jurisdiction: '정안면', install_location: '정안면 운궁리 218-5', note: '운궁리 버스승강장 부근' },
  { row_no: 57, jurisdiction: '정안면', install_location: '정안면 광정리 62-3', note: '창말교 앞 통로박스 부근' },
  { row_no: 58, jurisdiction: '정안면', install_location: '정안면 광정리 73-6', note: '정안세종로 고가 아래' },
  { row_no: 59, jurisdiction: '우성면', install_location: '우성면 신웅리 187-19', note: '고가 아래' },
  { row_no: 60, jurisdiction: '우성면', install_location: '우성면 신웅리 53', note: '마을정자(신웅리 145-7) 부근' },
  { row_no: 61, jurisdiction: '우성면', install_location: '우성면 상서리 531-3', note: '우성길 171 맞은편 상서교 초입 클린하우스 부근' },
  { row_no: 62, jurisdiction: '우성면', install_location: '우성면 대성리 266-12', note: '우성교 부근 고가아래 공터' },
  { row_no: 63, jurisdiction: '우성면', install_location: '우성면 도천리 77-3', note: '뜸밭길 167 앞 교차로 내' },
  { row_no: 64, jurisdiction: '우성면', install_location: '우성면 단지리 338-2', note: '단지리 공영주차장 내 클린하우스 부근' },
  { row_no: 65, jurisdiction: '우성면', install_location: '우성면 상서리 880', note: '우성길 171 맞은편 상서교 초입 클린하우스 부근' },
  { row_no: 66, jurisdiction: '우성면', install_location: '우성면 귀산길 81', note: '우성농협 맞은편 버스승강장 부근' },
  { row_no: 67, jurisdiction: '우성면', install_location: '우성면 용봉리 84', note: '' },
  { row_no: 68, jurisdiction: '사곡면', install_location: '사곡면 화월리 700-5', note: '화월교 초입 부근' },
  { row_no: 69, jurisdiction: '사곡면', install_location: '사곡면 운암리 731-2', note: '마곡사 공영주차장 공중화장실 앞' },
  { row_no: 70, jurisdiction: '사곡면', install_location: '사곡면 해월리 21-7', note: '해월2리 버스승강장 부근' },
  { row_no: 71, jurisdiction: '사곡면', install_location: '사곡면 운암리 731-2', note: '마곡사 공영주차장 공중화장실 앞' },
  { row_no: 72, jurisdiction: '사곡면', install_location: '사곡면 운암리 375-4', note: '운암삼거리 부근 창고(유구마곡사로 1187-1) 주차장 내' },
  { row_no: 73, jurisdiction: '사곡면', install_location: '사곡면 가교리 203-5', note: '마곡사로 598-8 집입로 초입' },
  { row_no: 74, jurisdiction: '신풍면', install_location: '신풍면 동원리 206-4', note: '신풍농협미곡종합처리장(충의로 2670) 맞은편 신풍면 선별장 내' },
  { row_no: 75, jurisdiction: '신풍면', install_location: '신풍면 산정리 247-11', note: '산정2리 버스승강장 부근 교차로 내' },
  { row_no: 76, jurisdiction: '신풍면', install_location: '신풍면 동원리 204-3', note: '신풍농협미곡종합처리장(충의로 2670) 맞은편 신풍면 선별장 내' },
  { row_no: 77, jurisdiction: '신풍면', install_location: '신풍면 산정리 82', note: '신풍길 88-3 앞 공터' },
  { row_no: 78, jurisdiction: '신풍면', install_location: '신풍면 조평리 760-5', note: '조평1리 마을회관(대룡조평길 396) 맞은편' },
  { row_no: 79, jurisdiction: '신풍면', install_location: '신풍면 동원리 206-2', note: '신풍농협미곡종합처리장(충의로 2670) 맞은편 신풍면 선별장 내' },
  { row_no: 80, jurisdiction: '중학동', install_location: '봉황동 36-1', note: '로뎀주간보호센터(대통1길 20) 부근' },
  { row_no: 81, jurisdiction: '중학동', install_location: '중학동 169-4', note: '새마을슈퍼/강원연탄(중학새마을1길 2) 부근 공주고담벼락' },
  { row_no: 82, jurisdiction: '중학동', install_location: '중학동 200', note: '공주고등학교 공영주차장 입구 버스승강장 부근' },
  { row_no: 83, jurisdiction: '중학동', install_location: '반죽동 150-2', note: '웅진목욕탕(대통1길 73) 부근 공주북중학교 담벼락' },
  { row_no: 84, jurisdiction: '중학동', install_location: '봉황동 273-3', note: '효심3길 공영주차장 부근' },
  { row_no: 85, jurisdiction: '중학동', install_location: '중동 147-13', note: '특급뉴스(먹자2길 10) 앞' },
  { row_no: 86, jurisdiction: '중학동', install_location: '반죽동 110-5', note: '반죽하봉1길 11-2 앞 골목길' },
  { row_no: 87, jurisdiction: '웅진동', install_location: '웅진동 734-2', note: '' },
  { row_no: 88, jurisdiction: '웅진동', install_location: '산성동 31-5', note: '고개마을길 21-1 앞 골목길' },
  { row_no: 89, jurisdiction: '웅진동', install_location: '교동 2', note: '' },
  { row_no: 90, jurisdiction: '웅진동', install_location: '교동 211', note: '향교1길 30 담벼락' },
  { row_no: 91, jurisdiction: '웅진동', install_location: '금성동 97-6', note: '청송맨션 앞 공터 내' },
  { row_no: 92, jurisdiction: '웅진동', install_location: '교동 86-18', note: '공주문화예술촌(봉황로 134) 옆 골목길' },
  { row_no: 93, jurisdiction: '웅진동', install_location: '웅진동 95-3', note: '덕수빌리지(시어골1길 12) 입구' },
  { row_no: 94, jurisdiction: '웅진동', install_location: '산성동 161-2', note: '덕성공원빌리지(남문길 13) 지하주차장 집입로 부근' },
  { row_no: 95, jurisdiction: '웅진동', install_location: '교동 2', note: '웅진교 부근' },
  { row_no: 96, jurisdiction: '웅진동', install_location: '교동 120', note: '공주시 재활용센터 앞' },
  { row_no: 97, jurisdiction: '웅진동', install_location: '산성동 195', note: '산성교' },
  { row_no: 98, jurisdiction: '웅진동', install_location: '웅진동 64-1', note: '웅진동주민자치센터(용당길 45) 맞은편' },
  { row_no: 99, jurisdiction: '웅진동', install_location: '금성동 20-25', note: '산성시장 개미식당(산성시장5길 78-2) 부근' },
  { row_no: 100, jurisdiction: '웅진동', install_location: '웅진동 659-18', note: '웅진어린이집(웅진절골1길 7) 진입로 초입' },
  { row_no: 101, jurisdiction: '금학동', install_location: '금학동 275-5', note: '서울우유 앞 공영주차장 내' },
  { row_no: 102, jurisdiction: '금학동', install_location: '금학동 270-26', note: '캠퍼스원룸(제민천2길 16-1) 맞은편 무안교 부근' },
  { row_no: 103, jurisdiction: '금학동', install_location: '주미동 산27-3', note: '주미동노인회관 주차장 내 클린하우스 부근' },
  { row_no: 104, jurisdiction: '금학동', install_location: '봉정동 402-2', note: '천안논산고속도로 본사 집입로 부근 통로박스' },
  { row_no: 105, jurisdiction: '금학동', install_location: '오곡동 849', note: '점촌 버스승강장(오곡동 658-5) 부근' },
  { row_no: 106, jurisdiction: '금학동', install_location: '태봉동 327-3', note: '태봉1동(모세골) 버스승강장 부근' },
  { row_no: 107, jurisdiction: '금학동', install_location: '오곡동 767-1', note: '마을 진출입로' },
  { row_no: 108, jurisdiction: '금학동', install_location: '금학동 275-5', note: '금학동 공영주차장(금학동 250-23) 부근' },
  { row_no: 109, jurisdiction: '금학동', install_location: '금학동 368', note: '캠퍼스원룸(제민천2길 16-1) 부근' },
  { row_no: 110, jurisdiction: '옥룡동', install_location: '대추골1길 60-2', note: '대추골1길 버스승강장 부근 담벼락' },
  { row_no: 111, jurisdiction: '옥룡동', install_location: '옥룡동 422-17', note: '중앙연립(버드나무4길 17) 부근' },
  { row_no: 112, jurisdiction: '옥룡동', install_location: '신기동 368-1', note: '효포초등학교 앞 육교/효포교 사이' },
  { row_no: 113, jurisdiction: '옥룡동', install_location: '옥룡동 244-4', note: '대추골1길 17 앞 골목길' },
  { row_no: 114, jurisdiction: '옥룡동', install_location: '상왕동 847-11', note: '하왕촌교 초입 교차로 상왕2통 버스승강장 부근' },
  { row_no: 115, jurisdiction: '옥룡동', install_location: '중골1길 21-2', note: '다솜원룸 부근' },
  { row_no: 116, jurisdiction: '옥룡동', install_location: '소학동 151', note: '학소교 아래 하천부지 내' },
  { row_no: 117, jurisdiction: '옥룡동', install_location: '옥룡동 105', note: '우금티로 695-4 앞 교차로 내' },
  { row_no: 118, jurisdiction: '옥룡동', install_location: '신기동 306', note: '계룡산묵사랑(전진배길 389) 아래 통로박스 부근' },
  { row_no: 119, jurisdiction: '신관동', install_location: '신관동 223-48', note: '편의점(번영3로 52-1) 앞' },
  { row_no: 120, jurisdiction: '신관동', install_location: '신관동 246-1', note: '청솔타운(공주대학로 94-31) 입구 부근' },
  { row_no: 121, jurisdiction: '신관동', install_location: '신관동 602-14', note: '번영1공원 입구 부근' },
  { row_no: 122, jurisdiction: '신관동', install_location: '신관동 269-4', note: '청운오피스텔(일신역길 13) 앞' },
  { row_no: 123, jurisdiction: '신관동', install_location: '흑수골길 38-6', note: '흑수골길 38-6 부근 골목길' },
  { row_no: 124, jurisdiction: '신관동', install_location: '신금2길 38-6', note: '신금2길 38-6 옆 골목길 초입' },
  { row_no: 125, jurisdiction: '신관동', install_location: '시목길 2', note: '시목길 2 옆 골목길 초입' },
  { row_no: 126, jurisdiction: '신관동', install_location: '신관동 553', note: '금강신관공원 주차장 내' },
  { row_no: 127, jurisdiction: '신관동', install_location: '월미동 277', note: '마을운동기구(월미동 352) 부근 공동집하장' },
  { row_no: 128, jurisdiction: '신관동', install_location: '월미동길 63', note: '월미1통 마을공동기계 보관창고 옆' },
  { row_no: 129, jurisdiction: '신관동', install_location: '신관동 606-15', note: '공주시여성회관(번영2로 10-5) 주차장 입구 부근' },
  { row_no: 130, jurisdiction: '신관동', install_location: '신관동 517-21', note: '신관동영농폐기물 집합장' },
  { row_no: 131, jurisdiction: '월송동', install_location: '송선동 458-12', note: '공주세종패션아울렛(장기로 204-4) 옆 골목길(요동길) 초입' },
  { row_no: 132, jurisdiction: '월송동', install_location: '금흥동 542-28', note: '금남공업사(중뫼1길 6) 부근' },
  { row_no: 133, jurisdiction: '월송동', install_location: '동현동 101-4', note: '지랭이 마을입구 창고(지랭이길 6) 앞' },
  { row_no: 134, jurisdiction: '월송동', install_location: '월송동 426-3', note: '월송동 마을회관(월송동현로 109) 버스승강장 건너편 공터' },
  { row_no: 135, jurisdiction: '월송동', install_location: '무릉동 448', note: '느랏마을 버스승강장 부근 교차로' },
  { row_no: 136, jurisdiction: '월송동', install_location: '송선동 657', note: '천년갈비 맞은편 버스승강장' },
  { row_no: 137, jurisdiction: '월송동', install_location: '금흥동 287-11', note: '서우마트 앞 교차로' },
  { row_no: 138, jurisdiction: '월송동', install_location: '월송동 570', note: '서울칼국수(월송동현로 48) 맞은편' },
  { row_no: 139, jurisdiction: '월송동', install_location: '상왕동 815-4', note: '초려 이유태 유허지 진입로 초입' },
  { row_no: 140, jurisdiction: '월송동', install_location: '석장리동 23-6', note: '장암휴게소(금벽로 1083) 부근' },
];

// note에서 괄호 안 도로명 주소 추출: "xxx(도로명 123)" → "도로명 123"
function extractRoadFromNote(note) {
  if (!note) return null;
  const m = note.match(/\(([^)]+(?:로|길)\s*[\d-]+[^)]*)\)/);
  if (!m) return null;
  const road = m[1].trim();
  // 숫자가 포함된 도로명만 유효하게 처리
  if (!/\d/.test(road)) return null;
  return road;
}

function buildQueries(r) {
  const ins = r.install_location.trim();
  const hasUnit = /^(유구읍|이인면|탄천면|계룡면|반포면|의당면|정안면|우성면|사곡면|신풍면|중학동|웅진동|금학동|옥룡동|신관동|월송동)/.test(ins);
  const jibn = hasUnit ? `충청남도 공주시 ${ins}` : `충청남도 공주시 ${r.jurisdiction} ${ins}`;

  const road = extractRoadFromNote(r.note);
  const queries = [];
  // 도로명이 있으면 1순위로 시도
  if (road) queries.push(`충청남도 공주시 ${road}`);
  queries.push(jibn);
  return queries;
}

async function geocode(query) {
  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
      'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  const data = await res.json();
  if (!data.addresses?.length) return null;
  const addr = data.addresses[0];
  const lat = parseFloat(addr.y);
  const lng = parseFloat(addr.x);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return { lat, lng };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

console.log(`네이버 Geocoding API로 ${RAW.length}개 주소 변환 시작…\n`);

const results = [];
for (let i = 0; i < RAW.length; i++) {
  const r = RAW[i];
  const queries = buildQueries(r);
  let found = null;
  let usedQuery = '';
  try {
    for (const q of queries) {
      const coords = await geocode(q);
      if (coords) { found = coords; usedQuery = q; break; }
      await sleep(80);
    }
    if (found) {
      console.log(`[${String(r.row_no).padStart(3)}] ✓  ${found.lat.toFixed(5)}, ${found.lng.toFixed(5)}  ← ${usedQuery}`);
      results.push({ ...r, lat: found.lat, lng: found.lng });
    } else {
      console.log(`[${String(r.row_no).padStart(3)}] ✗  FAIL`);
      results.push({ ...r, lat: null, lng: null });
    }
  } catch (e) {
    console.error(`[${r.row_no}] ERROR: ${e.message}`);
    results.push({ ...r, lat: null, lng: null });
  }
  if (i < RAW.length - 1) await sleep(120);
}

const ok = results.filter(r => r.lat !== null);
const fail = results.filter(r => r.lat === null);
console.log(`\n완료: 성공 ${ok.length}건 / 실패 ${fail.length}건`);
if (fail.length) console.log('실패 연번:', fail.map(r => r.row_no).join(', '));

const lines = results.map(r =>
  r.lat !== null
    ? `  { row_no: ${r.row_no}, jurisdiction: '${r.jurisdiction}', install_location: '${r.install_location.replace(/'/g, "\\'")}', note: '${r.note.replace(/'/g, "\\'")}', lat: ${r.lat}, lng: ${r.lng} },`
    : `  { row_no: ${r.row_no}, jurisdiction: '${r.jurisdiction}', install_location: '${r.install_location.replace(/'/g, "\\'")}', note: '${r.note.replace(/'/g, "\\'")}', lat: null, lng: null }, // geocode failed`
);

const outPath = join(__dirname, '..', 'lib', 'cctv-coords.ts');
writeFileSync(outPath, [
  '// 자동 생성 — node scripts/geocode-naver.mjs',
  '// 네이버 Geocoding API 사용 (지번 주소 기준)',
  '',
  'export interface CctvCoord {',
  '  row_no: number;',
  '  jurisdiction: string;',
  '  install_location: string;',
  '  note: string;',
  '  lat: number | null;',
  '  lng: number | null;',
  '}',
  '',
  'export const CCTV_COORDS: CctvCoord[] = [',
  ...lines,
  '];',
  '',
].join('\n'), 'utf8');

console.log(`\n저장: lib/cctv-coords.ts (성공 ${ok.length}건 포함)`);
