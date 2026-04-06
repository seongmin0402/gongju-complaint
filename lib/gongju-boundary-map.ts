/**
 * 공주시 행정경계를 네이버 지도에 선(Polyline)만 표시 (내부 채우기 없음)
 */
export function drawGongjuBoundaryPolygon(
  map: any,
  ring: [number, number][],
): { polygon: any } | null {
  if (typeof window === 'undefined' || !window.naver?.maps || !map || !ring?.length) return null;

  const path = ring.map(([lng, lat]) => new window.naver.maps.LatLng(lat, lng));
  const line = new window.naver.maps.Polyline({
    map,
    path,
    strokeColor: '#1d4ed8',
    strokeOpacity: 0.9,
    strokeWeight: 2,
    clickable: false,
    zIndex: 0,
  });

  return { polygon: line };
}
