import { isInsideGongju } from '@/lib/gongju-bounds';
import { fetchNominatimReverse } from '@/lib/reverse-geocode';

/** 네이버 역지오코딩 응답으로 공주시 여부 (한국 주소·행정구역명) */
export function isGongjuFromNaverReverseResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;
  const r = response as {
    v2?: {
      address?: { roadAddress?: string; jibunAddress?: string };
      results?: Array<{ region?: { area1?: { name?: string }; area2?: { name?: string }; area3?: { name?: string }; area4?: { name?: string } } }>;
    };
  };
  const a = r.v2?.address;
  const road = typeof a?.roadAddress === 'string' ? a.roadAddress : '';
  const jibun = typeof a?.jibunAddress === 'string' ? a.jibunAddress : '';
  const line = `${road} ${jibun}`;
  if (line.includes('공주시')) return true;

  const region = r.v2?.results?.[0]?.region;
  if (region) {
    const a2 = region.area2?.name;
    const a3 = region.area3?.name;
    if (a2 === '공주시' || a3 === '공주시') return true;
  }
  return false;
}

/** Nominatim 역지오코딩 결과로 공주시 행정구역 여부 */
export function isGongjuFromNominatim(data: { display_name?: string; address?: Record<string, string> }): boolean {
  const dn = data.display_name ?? '';
  if (dn.includes('공주시')) return true;
  if (/\bGongju(-si)?\b/i.test(dn) || dn.includes('Gongju-si')) return true;

  const addr = data.address ?? {};
  for (const v of Object.values(addr)) {
    if (typeof v !== 'string') continue;
    if (v.includes('공주시') || v.includes('공주')) return true;
    if (/gongju/i.test(v)) return true;
  }
  return false;
}

/** 서버: bbox + Nominatim으로 공주시 내 좌표인지 확인 */
export async function verifyGongjuLocation(lat: number, lng: number): Promise<boolean> {
  if (!isInsideGongju(lat, lng)) return false;
  const data = await fetchNominatimReverse(lat, lng);
  if (!data) return false;
  return isGongjuFromNominatim(data);
}
