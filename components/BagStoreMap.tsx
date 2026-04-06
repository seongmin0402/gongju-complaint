'use client';

import { useEffect, useRef, useState } from 'react';

interface Store {
  no: number;
  name: string;
  address: string;
  region: string;
  phone: string;
}

interface StoreWithCoords extends Store {
  lat: number;
  lng: number;
  distKm: number;
}

interface Props {
  stores: Store[];
}

/** 지역별 대표 좌표 — 가까운 지역 판매소를 먼저 geocoding하기 위한 용도 */
const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  '계룡면':   { lat: 36.3957, lng: 127.1897 },
  '금학동':   { lat: 36.4468, lng: 127.1056 },
  '반포면':   { lat: 36.3779, lng: 127.2167 },
  '사곡면':   { lat: 36.5126, lng: 127.0234 },
  '신관동':   { lat: 36.4682, lng: 127.1452 },
  '옥룡동':   { lat: 36.4503, lng: 127.1310 },
  '우성면':   { lat: 36.5312, lng: 127.1789 },
  '유구읍':   { lat: 36.5667, lng: 127.0194 },
  '의당면':   { lat: 36.5023, lng: 127.1967 },
  '이인면':   { lat: 36.4234, lng: 127.0712 },
  '장기면':   { lat: 36.4989, lng: 127.2234 },
  '정안면':   { lat: 36.5456, lng: 127.1456 },
  '중학동':   { lat: 36.4489, lng: 127.1189 },
  '탄천면':   { lat: 36.4123, lng: 127.2456 },
  '웅진동':   { lat: 36.4456, lng: 127.1145 },
  '봉황동':   { lat: 36.4501, lng: 127.1178 },
  '산성동':   { lat: 36.4578, lng: 127.1223 },
};

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`/api/geocode?query=${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.lat && data.lng) return { lat: data.lat, lng: data.lng };
    return null;
  } catch {
    return null;
  }
}

function storeMarkerHtml(rank: number) {
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'];
  const color = colors[rank] ?? '#6B7280';
  return `<div style="
    width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:${color};border:2.5px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.35);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:800;line-height:1;">${rank + 1}</span></div>`;
}

function myLocationMarkerHtml() {
  return `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#3B82F6;border:3px solid #fff;
    box-shadow:0 0 0 5px rgba(59,130,246,.2);
  "></div>`;
}

export default function BagStoreMap({ stores }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const myMarkerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [nearStores, setNearStores] = useState<StoreWithCoords[]>([]);

  // Naver Maps SDK 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.naver?.maps) { setIsMapLoaded(true); return; }
    const existing = document.getElementById('naver-map-script');
    if (existing) {
      const check = setInterval(() => {
        if (window.naver?.maps) { clearInterval(check); setIsMapLoaded(true); }
      }, 200);
      return () => clearInterval(check);
    }
    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    script.onload = () => {
      const check = setInterval(() => {
        if (window.naver?.maps) { clearInterval(check); setIsMapLoaded(true); }
      }, 200);
    };
    document.head.appendChild(script);
  }, []);

  async function findNearestStores(userLat: number, userLng: number): Promise<StoreWithCoords[]> {
    // 1단계: 지역 대표 좌표로 가까운 순서로 정렬
    const regionOrder = Object.entries(REGION_COORDS)
      .map(([region, coords]) => ({
        region,
        dist: getDistanceKm(userLat, userLng, coords.lat, coords.lng),
      }))
      .sort((a, b) => a.dist - b.dist);

    // 2단계: 가까운 지역 순서대로 판매소를 geocoding, 5개 찾으면 중단
    const results: StoreWithCoords[] = [];

    for (const { region } of regionOrder) {
      if (results.length >= 5) break;
      const regionStores = stores.filter((s) => s.region === region);

      // 해당 지역 판매소를 병렬로 geocoding (최대 5개씩)
      const batch = regionStores.slice(0, 5 - results.length);
      setStatusText(`${region} 판매소 위치 확인 중… (${results.length}/5)`);

      const geocoded = await Promise.all(
        batch.map(async (store) => {
          const coords = await geocodeAddress(store.address);
          if (!coords) return null;
          return {
            ...store,
            lat: coords.lat,
            lng: coords.lng,
            distKm: getDistanceKm(userLat, userLng, coords.lat, coords.lng),
          };
        })
      );

      for (const item of geocoded) {
        if (item) results.push(item);
        if (results.length >= 5) break;
      }
    }

    return results.sort((a, b) => a.distKm - b.distKm).slice(0, 5);
  }

  function handleLocate() {
    if (!isMapLoaded) {
      setErrorMsg('지도 SDK를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      setStatus('error');
      return;
    }
    if (!navigator.geolocation) {
      setErrorMsg('이 브라우저는 위치 정보를 지원하지 않습니다.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setStatusText('현재 위치 확인 중…');
    setErrorMsg('');
    setNearStores([]);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // 지도 초기화
        if (!mapInstance.current && mapRef.current) {
          mapInstance.current = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(userLat, userLng),
            zoom: 14,
          });
        } else if (mapInstance.current) {
          mapInstance.current.setCenter(new window.naver.maps.LatLng(userLat, userLng));
          mapInstance.current.setZoom(14);
        }

        // 내 위치 마커
        if (myMarkerRef.current) myMarkerRef.current.setMap(null);
        myMarkerRef.current = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(userLat, userLng),
          map: mapInstance.current,
          icon: { content: myLocationMarkerHtml(), anchor: new window.naver.maps.Point(9, 9) },
          title: '내 위치',
          zIndex: 10,
        });

        // 기존 판매소 마커 제거
        markersRef.current.forEach((m) => m.setMap(null));
        infoWindowsRef.current.forEach((iw) => iw.close());
        markersRef.current = [];
        infoWindowsRef.current = [];

        const near = await findNearestStores(userLat, userLng);

        if (near.length === 0) {
          setErrorMsg('주변 판매소를 찾을 수 없습니다. 잠시 후 다시 시도해 주세요.');
          setStatus('error');
          return;
        }

        setNearStores(near);
        const map = mapInstance.current;

        const bounds = new window.naver.maps.LatLngBounds(
          new window.naver.maps.LatLng(userLat, userLng),
          new window.naver.maps.LatLng(userLat, userLng),
        );

        near.forEach((store, idx) => {
          const pos = new window.naver.maps.LatLng(store.lat, store.lng);
          bounds.extend(pos);

          const marker = new window.naver.maps.Marker({
            position: pos,
            map,
            icon: { content: storeMarkerHtml(idx), anchor: new window.naver.maps.Point(15, 30) },
            title: store.name,
            zIndex: 5,
          });

          const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(store.name + ' ' + store.address)}`;
          const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(store.name)},${store.lat},${store.lng}`;

          const infoContent = `
            <div style="padding:10px 12px;max-width:230px;font-size:12px;font-family:system-ui,sans-serif;line-height:1.6;">
              <div style="font-weight:700;color:#111;">${idx + 1}위. ${store.name}</div>
              <div style="color:#6b7280;font-size:11px;">${store.address}</div>
              ${store.phone ? `<div style="color:#3b82f6;font-size:11px;">${store.phone}</div>` : ''}
              <div style="color:#059669;font-size:11px;font-weight:600;">📍 ${store.distKm.toFixed(2)}km</div>
              <div style="margin-top:6px;display:flex;gap:6px;">
                <a href="${naverMapUrl}" target="_blank" rel="noopener"
                  style="flex:1;text-align:center;padding:5px 0;background:#00c73c;color:#fff;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;">
                  네이버 지도
                </a>
                <a href="${kakaoMapUrl}" target="_blank" rel="noopener"
                  style="flex:1;text-align:center;padding:5px 0;background:#FAE100;color:#3A1D1D;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;">
                  카카오 길찾기
                </a>
              </div>
            </div>`;

          const infoWindow = new window.naver.maps.InfoWindow({ content: infoContent, borderWidth: 0 });
          window.naver.maps.Event.addListener(marker, 'click', () => {
            infoWindowsRef.current.forEach((iw) => iw.close());
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
          infoWindowsRef.current.push(infoWindow);
        });

        map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
        setStatus('done');
        setStatusText('');
      },
      (err) => {
        setErrorMsg(
          err.code === 1 ? '위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.'
          : err.code === 2 ? '위치 정보를 가져올 수 없습니다.'
          : '위치 요청 시간이 초과되었습니다.',
        );
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleLocate}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {status === 'loading'
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{statusText || '검색 중…'}</>
          : <>{status === 'done' ? '🔄 다시 검색' : '📍 내 위치 기준 가까운 판매소 5곳 보기'}</>
        }
      </button>

      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
      )}

      {/* 지도 */}
      <div
        ref={mapRef}
        className={`w-full rounded-xl border border-gray-200 overflow-hidden bg-gray-100 transition-all duration-300 ${status === 'done' ? 'h-72' : 'h-0'}`}
      />

      {/* 결과 리스트 */}
      {nearStores.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">가까운 판매소 순위</p>
          {nearStores.map((store, idx) => {
            const rankBg = [
              'bg-red-50 border-red-100',
              'bg-orange-50 border-orange-100',
              'bg-yellow-50 border-yellow-100',
              'bg-green-50 border-green-100',
              'bg-blue-50 border-blue-100',
            ];
            const rankColors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-blue-500'];
            const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(store.name + ' ' + store.address)}`;
            const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(store.name)},${store.lat},${store.lng}`;
            return (
              <div key={store.no} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${rankBg[idx] ?? ''}`}>
                <span className={`text-xl font-black w-6 text-center flex-shrink-0 ${rankColors[idx]}`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{store.name}</p>
                  <p className="text-xs text-gray-400 truncate">{store.address}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-600 font-medium">📍 {store.distKm.toFixed(2)}km</span>
                    {store.phone && <span className="text-xs text-gray-400">{store.phone}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <a href={naverMapUrl} target="_blank" rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded-lg transition-colors text-center whitespace-nowrap">
                    네이버
                  </a>
                  <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-[10px] font-bold rounded-lg transition-colors text-center whitespace-nowrap">
                    카카오
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
