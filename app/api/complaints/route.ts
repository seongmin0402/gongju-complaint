import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { reverseGeocodeLatLng } from '@/lib/reverse-geocode';
import { sendNewComplaintAdminEmail } from '@/lib/notify-admin-email';
import { verifyGongjuLocation } from '@/lib/gongju-validation';

function generateComplaintNumber(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `GJ-${ymd}-${rand}`;
}

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category, description, latitude, longitude, address, reporter_name, reporter_phone, photo_urls, photo_url, odor_level } = body;

  if (!category || !description || !latitude || !longitude || !reporter_name || !reporter_phone) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: '유효한 위치가 아닙니다.' }, { status: 400 });
  }
  const inGongju = await verifyGongjuLocation(lat, lng);
  if (!inGongju) {
    return NextResponse.json({ error: '민원 위치는 공주시 행정구역 안에서만 선택할 수 있습니다.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 접수번호 중복 방지 재시도
  let complaint_number = generateComplaintNumber();
  for (let i = 0; i < 3; i++) {
    const { data: existing } = await supabase.from('complaints').select('id').eq('complaint_number', complaint_number).maybeSingle();
    if (!existing) break;
    complaint_number = generateComplaintNumber();
  }

  const urls: string[] = Array.isArray(photo_urls) ? photo_urls : (photo_url ? [photo_url] : []);

  let resolvedAddress = typeof address === 'string' ? address.trim() : '';
  if (!resolvedAddress) {
    resolvedAddress = await reverseGeocodeLatLng(lat, lng);
  }

  const { data, error } = await supabase
    .from('complaints')
    .insert([{
      complaint_number,
      category,
      description,
      latitude: lat,
      longitude: lng,
      address: resolvedAddress,
      reporter_name,
      reporter_phone,
      photo_urls: urls.length > 0 ? urls : null,
      photo_url: urls[0] || null,
      odor_level: category === '악취' && typeof odor_level === 'number' ? odor_level : null,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  void sendNewComplaintAdminEmail({
    complaintNumber: data.complaint_number,
    category,
    description,
    address: resolvedAddress,
    reporterName: reporter_name,
    reporterPhone: reporter_phone,
  });

  return NextResponse.json(data, { status: 201 });
}
