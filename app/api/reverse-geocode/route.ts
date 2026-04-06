import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocodeLatLng } from '@/lib/reverse-geocode';

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'));
  const lng = Number(request.nextUrl.searchParams.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: '유효한 lat, lng가 필요합니다.' }, { status: 400 });
  }
  const address = await reverseGeocodeLatLng(lat, lng);
  return NextResponse.json({ address });
}
