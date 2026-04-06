import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isInsideGongju } from '@/lib/gongju-bounds';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radiusM = parseFloat(searchParams.get('radius') || '150');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: '위치 정보가 필요합니다.' }, { status: 400 });
  }
  if (!isInsideGongju(lat, lng)) {
    return NextResponse.json({ count: 0, complaints: [] });
  }

  const supabase = createAdminClient();

  // 위도/경도 ±0.003도 범위 내 민원 조회 (완료 제외)
  const degOffset = radiusM / 111000;
  const { data, error } = await supabase
    .from('complaints')
    .select('id, complaint_number, category, status, description, address, created_at, latitude, longitude')
    .neq('status', '완료')
    .gte('latitude', lat - degOffset)
    .lte('latitude', lat + degOffset)
    .gte('longitude', lng - degOffset)
    .lte('longitude', lng + degOffset)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Haversine 정밀 필터
  function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const nearby = (data || []).filter(
    (c) => haversineM(lat, lng, c.latitude, c.longitude) <= radiusM
  );

  return NextResponse.json({ count: nearby.length, complaints: nearby });
}
