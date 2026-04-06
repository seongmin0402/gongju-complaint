import { NextResponse } from 'next/server';

/**
 * 공주시 행정경계 외곽 링 [lng, lat][] (Nominatim/OSM, 24h 캐시)
 */
export async function GET() {
  try {
    const url =
      'https://nominatim.openstreetmap.org/search?q=' +
      encodeURIComponent('공주시 충청남도 대한민국') +
      '&format=json&polygon_geojson=1&limit=1';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GongjuEnvComplaint/1.0 (admin boundary for map overlay)',
        Accept: 'application/json',
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'boundary fetch failed' }, { status: 502 });
    }
    const data = (await res.json()) as Array<{ geojson?: { coordinates?: number[][][] } }>;
    const ring = data[0]?.geojson?.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length < 4) {
      return NextResponse.json({ error: 'invalid polygon' }, { status: 502 });
    }
    return NextResponse.json({ ring }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' },
    });
  } catch {
    return NextResponse.json({ error: 'boundary error' }, { status: 500 });
  }
}
