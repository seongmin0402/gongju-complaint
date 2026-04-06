/**
 * 공주시 행정구역 외접 사각형 (OpenStreetMap / Nominatim relation 7578884 기준 bbox).
 * 정확한 경계선은 아니므로, 실제 허용 여부는 역지오코딩·행정명 검증과 함께 쓴다.
 */
export const GONGJU_BOUNDS = {
  /** 남쪽 */
  south: 36.2751492,
  /** 서쪽 */
  west: 126.8841962,
  /** 북쪽 */
  north: 36.6794321,
  /** 동쪽 */
  east: 127.2823194,
} as const;

/** 빠른 1차 필터: bbox 안 여부 */
export function isInsideGongju(lat: number, lng: number): boolean {
  return (
    lat >= GONGJU_BOUNDS.south &&
    lat <= GONGJU_BOUNDS.north &&
    lng >= GONGJU_BOUNDS.west &&
    lng <= GONGJU_BOUNDS.east
  );
}
