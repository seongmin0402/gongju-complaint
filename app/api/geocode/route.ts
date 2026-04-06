import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) return NextResponse.json({ error: 'query 파라미터가 필요합니다.' }, { status: 400 });

  const clientId = process.env.NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Naver API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': clientId,
      'X-NCP-APIGW-API-KEY': clientSecret,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Geocoding API 오류: ${res.status}` }, { status: 502 });
  }

  const data = await res.json() as {
    addresses?: Array<{ x: string; y: string; roadAddress: string; jibunAddress: string }>;
  };

  const first = data.addresses?.[0];
  if (!first) return NextResponse.json({ error: '결과 없음' }, { status: 404 });

  return NextResponse.json({
    lat: parseFloat(first.y),
    lng: parseFloat(first.x),
    roadAddress: first.roadAddress,
    jibunAddress: first.jibunAddress,
  });
}
