import { NextRequest, NextResponse } from 'next/server';

/* ------------------------------------------------------------------ */
/*  공주시 품목별 배출 규칙 DB                                           */
/* ------------------------------------------------------------------ */

interface WasteRule {
  category: string;        // 배출 분류 (재활용, 대형폐기물, 음식물 등)
  items: string[];         // 매칭 Vision AI 라벨 키워드 (소문자)
  icon: string;
  title: string;
  instructions: string[];  // 배출 방법 목록
  caution?: string;        // 주의사항
  fee?: string;            // 수수료 (대형폐기물)
  tip?: string;            // 꿀팁
}

const WASTE_RULES: WasteRule[] = [
  // ── 투명 PET병 ──────────────────────────────────────────────────────
  {
    category: '재활용(투명 PET병)',
    items: ['bottle', 'plastic bottle', 'water bottle', 'beverage', 'pet bottle', 'drinking water'],
    icon: '🍶',
    title: '투명 PET병은 별도 분리배출!',
    instructions: [
      '내용물을 완전히 비우고 물로 헹구세요.',
      '라벨(상표)을 완전히 제거하세요.',
      '찌그러뜨려 뚜껑을 닫아 부피를 줄이세요.',
      '투명 PET 전용 수거함 또는 재활용 수거함에 배출하세요.',
    ],
    caution: '유색 PET, 불투명 플라스틱과 혼합 배출 금지',
    tip: '세척 후 배출하면 재활용 품질이 높아집니다.',
  },
  // ── 플라스틱 일반 ───────────────────────────────────────────────────
  {
    category: '재활용(플라스틱)',
    items: ['plastic', 'plastic bag', 'packaging', 'container', 'cup', 'tray', 'tupperware', 'bucket'],
    icon: '♻️',
    title: '플라스틱류 분리배출',
    instructions: [
      '내용물을 깨끗이 비우세요.',
      '다른 재질(비닐 코팅, 은박지, 상표 스티커)을 제거하세요.',
      '재활용 수거함(플라스틱 전용)에 배출하세요.',
    ],
    caution: '오염된 플라스틱(음식물 묻은 것)은 생활쓰레기 종량제봉투에 배출',
    tip: 'PP·PE·PS·PET 마크가 있으면 재활용 가능합니다.',
  },
  // ── 유리병 ──────────────────────────────────────────────────────────
  {
    category: '재활용(유리병)',
    items: ['glass', 'glass bottle', 'jar', 'wine bottle', 'beer bottle', 'wine glass'],
    icon: '🍾',
    title: '유리병 분리배출',
    instructions: [
      '담배꽁초 등 이물질이 들어가지 않게 내용물을 비우세요.',
      '뚜껑은 따로 분리해 각 재질에 맞게 배출하세요.',
      '유리 전용 수거함에 배출하세요.',
    ],
    caution: '깨진 유리는 신문지에 싸서 생활쓰레기 봉투에 배출(재활용 불가)',
    tip: '맥주·소주·사이다·콜라 병은 소매점에서 보증금 환불 가능합니다.',
  },
  // ── 캔·고철 ─────────────────────────────────────────────────────────
  {
    category: '재활용(캔·금속)',
    items: ['can', 'tin can', 'aluminum can', 'metal', 'steel', 'iron', 'aluminum', 'aerosol'],
    icon: '🥫',
    title: '캔·금속류 분리배출',
    instructions: [
      '내용물을 비우고 찌그러뜨려 부피를 줄이세요.',
      '스프레이 캔은 구멍을 뚫어 가스를 완전히 제거 후 배출하세요.',
      '재활용 수거함(캔·금속류)에 배출하세요.',
    ],
    caution: '페인트·오일 캔 등 유해물질이 든 캔은 주민센터 유해물질 수거함에 배출',
  },
  // ── 종이·신문지·박스 ────────────────────────────────────────────────
  {
    category: '재활용(종이류)',
    items: ['paper', 'newspaper', 'cardboard', 'book', 'magazine', 'document', 'box', 'carton', 'envelope'],
    icon: '📰',
    title: '종이류 분리배출',
    instructions: [
      '이물질(스테이플러, 비닐 코팅, 테이프 등)을 제거하세요.',
      '물에 젖지 않게 묶음으로 배출하거나 종이 수거함에 넣으세요.',
      '택배 상자는 테이프와 송장을 제거 후 펼쳐서 배출하세요.',
    ],
    caution: '영수증(감열지), 기름종이, 왁스 코팅지는 일반 쓰레기 봉투에 배출',
    tip: '종이팩(우유갑 등)은 헹군 뒤 펴서 별도 수거함에 배출하면 화장지로 교환 가능합니다.',
  },
  // ── 스티로폼 ────────────────────────────────────────────────────────
  {
    category: '재활용(스티로폼)',
    items: ['styrofoam', 'foam', 'polystyrene', 'packaging foam', 'foam box'],
    icon: '📦',
    title: '폐스티로폼 분리배출',
    instructions: [
      '스티로폼에 붙은 상표·테이프·이물질을 완전히 제거하세요.',
      '흰색 스티로폼만 재활용 수거함에 배출하세요.',
    ],
    caution: '유색 스티로폼, 코팅된 스티로폼, 이물질이 묻은 것은 생활쓰레기 봉투에 배출',
  },
  // ── 의류·섬유 ───────────────────────────────────────────────────────
  {
    category: '재활용(의류·섬유)',
    items: ['clothing', 'clothes', 'shirt', 'pants', 'jacket', 'dress', 'fabric', 'textile', 'shoe', 'shoes', 'bag', 'handbag'],
    icon: '👕',
    title: '의류·섬유류 배출',
    instructions: [
      '세탁 후 의류 수거함(헌 옷 수거함)에 배출하세요.',
      '공주시 알뜰매장(재활용센터)에 직접 가져가도 됩니다.',
    ],
    tip: '공주시 알뜰매장 ☎ 041-854-3325 (우체국길 11)',
    caution: '너무 낡거나 오염된 의류는 생활쓰레기 봉투에 배출',
  },
  // ── 음식물 쓰레기 ───────────────────────────────────────────────────
  {
    category: '음식물쓰레기',
    items: ['food', 'fruit', 'vegetable', 'meat', 'fish', 'leftovers', 'banana', 'apple', 'orange', 'bread', 'rice', 'noodle', 'egg'],
    icon: '🍎',
    title: '음식물쓰레기 배출',
    instructions: [
      '물기를 최대한 제거 후 음식물 전용 수거용기(납부필증 부착)에 배출하세요.',
      '또는 RFID 음식물 수거기에 배출하세요.',
    ],
    caution: '뼈·껍데기·과일씨·계란껍질·조개껍데기·티백 등은 음식물 쓰레기 아님 → 생활쓰레기 봉투에 배출',
    tip: '음식물 납부필증 가격: 3L 600원, 5L 1,000원, 10L 2,000원 (공주시 기준)',
  },
  // ── 가전제품 소형 ───────────────────────────────────────────────────
  {
    category: '소형 가전(재활용)',
    items: ['electronics', 'phone', 'smartphone', 'tablet', 'laptop', 'computer', 'keyboard', 'mouse', 'remote control', 'charger', 'cable', 'headphone', 'earphone'],
    icon: '📱',
    title: '소형 가전제품 배출',
    instructions: [
      '한국전자제품자원순환공제조합 무상수거(☎ 1599-0903) 이용하세요.',
      '주민센터·아파트 단지 내 소형가전 수거함에 배출하세요.',
      '공주시 재활용센터에 직접 가져가도 됩니다.',
    ],
    caution: '개인정보(폰·PC)는 반드시 초기화 후 배출하세요.',
  },
  // ── 대형 가전 ───────────────────────────────────────────────────────
  {
    category: '대형폐기물(가전)',
    items: ['refrigerator', 'washing machine', 'air conditioner', 'television', 'tv', 'monitor', 'microwave', 'dishwasher', 'dryer', 'vacuum cleaner'],
    icon: '📺',
    title: '대형 가전제품 → 대형폐기물 스티커 필요',
    instructions: [
      '공주시 대형폐기물 스티커를 구매 후 부착하세요.',
      '스티커는 주민센터 또는 종량제봉투 판매소에서 구입 가능합니다.',
      '배출 당일 지정 장소에 내놓으세요.',
    ],
    fee: '냉장고 2,000~5,000원, TV 1,000~3,000원, 세탁기 2,000~4,000원 (크기에 따라 상이)',
    caution: '스티커 없이 배출 시 과태료 부과',
    tip: '에어컨·냉장고·세탁기·TV 등은 한국전자제품자원순환공제조합(☎ 1599-0903)의 무상수거 서비스 이용 가능',
  },
  // ── 가구 ────────────────────────────────────────────────────────────
  {
    category: '대형폐기물(가구)',
    items: ['furniture', 'chair', 'table', 'desk', 'sofa', 'couch', 'bed', 'mattress', 'cabinet', 'shelf', 'drawer', 'wardrobe', 'bookcase'],
    icon: '🛋️',
    title: '가구류 → 대형폐기물 스티커 필요',
    instructions: [
      '공주시 대형폐기물 처리 스티커를 구매 후 부착하세요.',
      '배출 당일 오전 8시 이전에 집 앞 또는 지정 장소에 내놓으세요.',
    ],
    fee: '의자 500~1,000원, 소파 2,000~5,000원, 침대 3,000~8,000원, 장롱 5,000~10,000원 (크기별 상이)',
    caution: '스티커 미부착 시 수거 거부 및 과태료 부과',
    tip: '재사용 가능한 물품은 공주시 알뜰매장(☎ 041-854-3325)에 기증하면 무료 수거 가능',
  },
  // ── 배터리 ──────────────────────────────────────────────────────────
  {
    category: '폐건전지·형광등',
    items: ['battery', 'batteries', 'light bulb', 'fluorescent', 'lamp', 'led'],
    icon: '🔋',
    title: '폐건전지·형광등 배출',
    instructions: [
      '주민센터, 아파트 관리사무소, 대형마트의 전용 수거함에 배출하세요.',
      '형광등은 깨지지 않게 주의하여 전용 수거함에 배출하세요.',
    ],
    caution: '일반 쓰레기 봉투나 재활용 수거함에 혼합 배출 금지',
  },
  // ── 폐의약품 ────────────────────────────────────────────────────────
  {
    category: '폐의약품',
    items: ['medicine', 'pill', 'capsule', 'tablet', 'syringe', 'medication'],
    icon: '💊',
    title: '폐의약품 배출',
    instructions: [
      '가까운 약국 또는 보건소의 폐의약품 수거함에 배출하세요.',
      '알약은 포장째로, 물약은 병째로 배출하세요.',
    ],
    caution: '변기나 하수구에 버리면 수질오염 발생 — 절대 금지',
  },
  // ── 종이컵 / 일회용 ─────────────────────────────────────────────────
  {
    category: '재활용(종이컵·일회용컵)',
    items: ['paper cup', 'disposable cup', 'coffee cup', 'takeout cup'],
    icon: '☕',
    title: '종이컵·일회용컵 배출',
    instructions: [
      '내용물을 비우고 말린 뒤 종이류 수거함(또는 마대에 묶어서) 배출하세요.',
      '플라스틱 뚜껑·빨대는 분리해서 각 재질 수거함에 배출하세요.',
    ],
  },
  // ── 나무·목재 ───────────────────────────────────────────────────────
  {
    category: '대형폐기물(목재)',
    items: ['wood', 'wooden', 'plank', 'board', 'lumber', 'timber', 'tree branch'],
    icon: '🪵',
    title: '목재류 → 대형폐기물 스티커 필요',
    instructions: [
      '50cm 이하로 절단 후 끈으로 묶어 대형폐기물 스티커 부착 후 배출하세요.',
      '나뭇가지는 50cm 이하로 잘라 묶음으로 배출하세요.',
    ],
    fee: '소형 목재 500원~, 대형 목재 1,000원~',
  },
];

/* ------------------------------------------------------------------ */
/*  Vision AI 인증 토큰 발급                                             */
/* ------------------------------------------------------------------ */

function base64url(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_VISION_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_VISION_PRIVATE_KEY;
  if (!clientEmail || !privateKeyRaw) throw new Error('Google Vision 환경변수 미설정');
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const signingInput = `${header}.${payload}`;
  const { createSign } = await import('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = base64url(sign.sign(privateKey));
  const jwt = `${signingInput}.${signature}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!tokenRes.ok) throw new Error(`OAuth 토큰 발급 실패: ${await tokenRes.text()}`);
  const { access_token } = await tokenRes.json() as { access_token: string };
  return access_token;
}

/* ------------------------------------------------------------------ */
/*  Vision AI 라벨 → 배출 규칙 매칭                                      */
/* ------------------------------------------------------------------ */

function matchRules(labels: Array<{ description: string; score: number }>): WasteRule[] {
  const matched = new Map<string, { rule: WasteRule; maxScore: number }>();

  for (const label of labels) {
    if (label.score < 0.55) continue;
    const lower = label.description.toLowerCase();

    for (const rule of WASTE_RULES) {
      const hit = rule.items.some((kw) => lower.includes(kw) || kw.includes(lower));
      if (hit) {
        const existing = matched.get(rule.category);
        if (!existing || existing.maxScore < label.score) {
          matched.set(rule.category, { rule, maxScore: label.score });
        }
      }
    }
  }

  // 매칭 점수 높은 순으로 정렬, 최대 3개
  return Array.from(matched.values())
    .sort((a, b) => b.maxScore - a.maxScore)
    .slice(0, 3)
    .map((v) => v.rule);
}

/* ------------------------------------------------------------------ */
/*  POST /api/waste-guide                                               */
/*  body: { image_base64: string } — 브라우저에서 직접 Base64로 전송      */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  let body: { image_base64?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 잘못되었습니다.' }, { status: 400 });
  }

  const { image_base64 } = body;
  if (!image_base64) {
    return NextResponse.json({ error: 'image_base64가 필요합니다.' }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    return NextResponse.json({ error: `Google 인증 실패: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }

  const visionRes = await fetch('https://vision.googleapis.com/v1/images:annotate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      requests: [{
        image: { content: image_base64 },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 30 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
        ],
      }],
    }),
  });

  if (!visionRes.ok) {
    const errText = await visionRes.text();
    return NextResponse.json({ error: `Vision API 오류 (${visionRes.status}): ${errText}` }, { status: 502 });
  }

  const visionData = await visionRes.json() as {
    responses: Array<{
      labelAnnotations?: Array<{ description: string; score: number }>;
      localizedObjectAnnotations?: Array<{ name: string; score: number }>;
    }>;
  };

  const response = visionData.responses[0];
  const labels = response.labelAnnotations ?? [];
  const objects = response.localizedObjectAnnotations ?? [];

  // 객체 인식 결과도 라벨처럼 병합
  const allLabels = [
    ...labels,
    ...objects.map((o) => ({ description: o.name, score: o.score })),
  ];

  const matchedRules = matchRules(allLabels);

  const topLabels = labels
    .filter((l) => l.score > 0.6)
    .slice(0, 10)
    .map((l) => ({ name: l.description, score: Math.round(l.score * 100) }));

  return NextResponse.json({
    rules: matchedRules,
    detectedLabels: topLabels,
    matched: matchedRules.length > 0,
  });
}
