/**
 * 좌표 → 주소 (OpenStreetMap Nominatim). 클라이언트 역지오코딩 실패 시 보조용.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export async function reverseGeocodeLatLng(lat: number, lng: number): Promise<string> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}` +
      `&lon=${encodeURIComponent(String(lng))}&format=json&accept-language=ko`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GongjuEnvComplaint/1.0 (educational civic reporting app)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) return '';
    const data = (await res.json()) as { display_name?: string };
    const name = data.display_name;
    if (!name || typeof name !== 'string') return '';
    return name.trim();
  } catch {
    return '';
  }
}

export type NominatimReverseResult = {
  display_name?: string;
  address?: Record<string, string>;
};

/** 역지오코딩 전체 응답 (행정구역 판별용) */
export async function fetchNominatimReverse(lat: number, lng: number): Promise<NominatimReverseResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}` +
      `&lon=${encodeURIComponent(String(lng))}&format=json&accept-language=ko,en&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GongjuEnvComplaint/1.0 (educational civic reporting app)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as NominatimReverseResult;
  } catch {
    return null;
  }
}
