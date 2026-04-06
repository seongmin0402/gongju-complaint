import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verify-admin';
import { createAdminClient } from '@/lib/supabase';

/**
 * 확실한 쓰레기·오염 라벨 (가중치 높음 — 단어 자체가 투기/오염을 직접 의미)
 * Vision AI 라벨은 영문 소문자로 비교
 */
const STRONG_WASTE_LABELS = [
  'waste', 'garbage', 'trash', 'rubbish', 'litter', 'dumping',
  'landfill', 'sewage', 'contamination', 'refuse', 'junk',
];

/**
 * 보조 라벨 (가중치 낮음 — 맥락에 따라 쓰레기일 수도 있지만 일상에도 등장)
 * 단독으로는 판단 근거로 쓰지 않고, STRONG 라벨과 함께 나올 때만 가중
 */
const WEAK_WASTE_LABELS = [
  'pollution', 'debris', 'plastic bag', 'waste container',
];

const ODOR_LABELS = [
  'sewage', 'waste', 'compost', 'manure', 'garbage',
  'trash', 'rubbish', 'drainage', 'sewer',
];

interface VisionLabel {
  description: string;
  score: number;
  topicality: number;
}

interface SafeSearch {
  adult: string;
  medical: string;
  violence: string;
  racy: string;
}

/** Base64url 인코딩 (Node.js Buffer 사용) */
function base64url(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** 서비스 계정 JSON으로 Vision API용 액세스 토큰 발급 */
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_VISION_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_VISION_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error('GOOGLE_VISION_CLIENT_EMAIL 또는 GOOGLE_VISION_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.');
  }

  // Vercel 환경변수의 개행 처리
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const signingInput = `${header}.${payload}`;

  // Node.js crypto로 RS256 서명
  const { createSign } = await import('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = base64url(sign.sign(privateKey));

  const jwt = `${signingInput}.${signature}`;

  // JWT로 액세스 토큰 교환
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google OAuth 토큰 발급 실패: ${err}`);
  }

  const tokenData = await tokenRes.json() as { access_token: string };
  return tokenData.access_token;
}

function calcSeverity(
  labels: VisionLabel[],
  safeSearch: SafeSearch,
  category: string,
): { level: 'low' | 'medium' | 'high' | 'critical'; comment: string; matchedLabels: string[] } {
  const isOdorCategory = category === '악취';
  const isViolent = ['LIKELY', 'VERY_LIKELY'].includes(safeSearch.violence ?? '');

  /**
   * 점수 기반 가중 합산:
   *  - STRONG 라벨에 매칭된 경우: score * 2.0 (확신도 0.9 → +1.8점)
   *  - WEAK 라벨에 매칭된 경우:  score * 0.8 (보조적으로만 기여)
   *  - ODOR 라벨(악취 카테고리): score * 1.5
   *
   * 최종 totalScore 기준으로 등급 결정:
   *  critical : 4.0 이상  (예: STRONG 라벨 score≥0.9 짜리 2개 이상 → 3.6+, 혹은 3개)
   *  high     : 2.5 이상  (예: STRONG 라벨 score≥0.85 짜리 1개 + 보조 1개)
   *  medium   : 1.0 이상  (예: STRONG 라벨 score 0.7 미만이거나 WEAK만 있는 경우)
   *  low      : 그 외
   */
  let totalScore = 0;
  const matchedSet = new Set<string>();

  for (const label of labels) {
    const lower = label.description.toLowerCase();

    const strongMatch = STRONG_WASTE_LABELS.find((w) => lower.includes(w));
    if (strongMatch) {
      totalScore += label.score * 2.0;
      matchedSet.add(strongMatch);
      continue;
    }

    const weakMatch = WEAK_WASTE_LABELS.find((w) => lower.includes(w));
    if (weakMatch) {
      totalScore += label.score * 0.8;
      matchedSet.add(weakMatch);
      continue;
    }

    if (isOdorCategory) {
      const odorMatch = ODOR_LABELS.find((o) => lower.includes(o));
      if (odorMatch) {
        totalScore += label.score * 1.5;
        matchedSet.add(odorMatch);
      }
    }
  }

  // 폭력성 감지 시 critical 강제 부여
  if (isViolent) totalScore = Math.max(totalScore, 4.0);

  const matchedLabels = Array.from(matchedSet);

  let level: 'low' | 'medium' | 'high' | 'critical';
  let comment: string;

  if (totalScore >= 4.0) {
    level = 'critical';
    comment = isOdorCategory
      ? '심각한 오염원이 감지되었습니다. 즉시 현장 점검 및 처리가 필요합니다.'
      : '대량의 쓰레기 무단투기가 확인됩니다. 즉시 처리를 권장합니다.';
  } else if (totalScore >= 2.5) {
    level = 'high';
    comment = isOdorCategory
      ? '상당한 수준의 오염이 감지되었습니다. 조속한 처리가 필요합니다.'
      : '상당한 규모의 쓰레기가 확인됩니다. 신속한 수거를 권장합니다.';
  } else if (totalScore >= 1.0) {
    level = 'medium';
    comment = isOdorCategory
      ? '일부 오염 흔적이 감지되었습니다. 현장 확인이 필요합니다.'
      : '쓰레기 또는 폐기물이 감지되었습니다. 수거 처리를 권장합니다.';
  } else {
    level = 'low';
    comment = '사진에서 명확한 오염·쓰레기 징후가 감지되지 않았습니다. 현장 육안 확인을 권장합니다.';
  }

  return { level, comment, matchedLabels };
}

const labelKrMap: Record<string, string> = {
  waste: '폐기물', garbage: '쓰레기', trash: '쓰레기봉투', rubbish: '잡동사니',
  litter: '투기물', pollution: '오염', debris: '파편·잔해', junk: '잡폐물',
  'plastic bag': '비닐봉투', bottle: '병', can: '캔', cardboard: '골판지',
  sewage: '하수·오폐수', compost: '퇴비', road: '도로', street: '거리',
  vehicle: '차량', building: '건물', tree: '나무', grass: '풀밭',
};

export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });
  }

  const body = await request.json() as { photo_url: string; complaint_id: string; category?: string };
  const { photo_url, complaint_id, category = '' } = body;

  if (!photo_url || !complaint_id) {
    return NextResponse.json({ error: 'photo_url과 complaint_id가 필요합니다.' }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    return NextResponse.json(
      { error: `Google 인증 실패: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // Google Vision API 호출
  const visionRes = await fetch(
    'https://vision.googleapis.com/v1/images:annotate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: photo_url } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 20 },
              { type: 'SAFE_SEARCH_DETECTION' },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            ],
          },
        ],
      }),
    },
  );

  if (!visionRes.ok) {
    const errText = await visionRes.text();
    return NextResponse.json(
      { error: `Vision API 오류 (${visionRes.status}): ${errText}` },
      { status: 502 },
    );
  }

  const visionData = await visionRes.json() as {
    responses: Array<{
      labelAnnotations?: VisionLabel[];
      safeSearchAnnotation?: SafeSearch;
      localizedObjectAnnotations?: Array<{ name: string; score: number }>;
    }>;
  };

  const response = visionData.responses[0];
  const labels: VisionLabel[] = response.labelAnnotations ?? [];
  const safeSearch: SafeSearch = response.safeSearchAnnotation ?? { adult: '', medical: '', violence: '', racy: '' };
  const objects = response.localizedObjectAnnotations ?? [];

  const detectedKr = labels
    .filter((l) => l.score > 0.6)
    .map((l) => {
      const lower = l.description.toLowerCase();
      return labelKrMap[lower] ?? l.description;
    })
    .slice(0, 8);

  const { level, comment, matchedLabels } = calcSeverity(labels, safeSearch, category);

  const severityLevelMap = { low: '낮음', medium: '보통', high: '높음', critical: '매우 높음' };
  const severityText = `[심각도: ${severityLevelMap[level]}] ${comment}`;

  // AI level → priority 매핑
  const priorityMap: Record<string, '높음' | '보통' | '낮음'> = {
    critical: '높음',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };
  const autoPriority = priorityMap[level];

  const supabase = createAdminClient();

  // 이 민원이 '접수' 상태인 경우에만 priority 자동 설정
  const { data: complaintRow } = await supabase
    .from('complaints')
    .select('status')
    .eq('id', complaint_id)
    .single();

  const isOpen = complaintRow?.status === '접수';

  const { error: updateError } = await supabase
    .from('complaints')
    .update({
      ai_severity: severityText,
      ...(isOpen ? { priority: autoPriority } : {}),
    })
    .eq('id', complaint_id);

  if (updateError) {
    return NextResponse.json({ error: `DB 저장 오류: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    severity: severityText,
    level,
    autoPriority: isOpen ? autoPriority : null,
    labels: detectedKr,
    matchedWasteLabels: matchedLabels,
    objectCount: objects.length,
    rawLabels: labels.slice(0, 10).map((l) => ({ name: l.description, score: Math.round(l.score * 100) })),
  });
}
