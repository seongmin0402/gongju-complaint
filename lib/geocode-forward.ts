/**
 * 주소 → 좌표 (OpenStreetMap Nominatim 검색).
 * https://operations.osmfoundation.org/policies/nominatim/
 */
import { isInsideGongju } from '@/lib/gongju-bounds';

const UA = 'GongjuEnvComplaint/1.0 (civic reporting; contact via city website)';

export async function geocodeAddressToLatLng(query: string): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}` +
      '&format=json&limit=3&countrycodes=kr&accept-language=ko';
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as { lat?: string; lon?: string }[];
    if (!Array.isArray(arr) || arr.length === 0) return null;

    for (const item of arr) {
      const lat = parseFloat(item.lat || '');
      const lng = parseFloat(item.lon || '');
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (isInsideGongju(lat, lng)) return { lat, lng };
    }

    const first = arr[0];
    const lat = parseFloat(first.lat || '');
    const lng = parseFloat(first.lon || '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
