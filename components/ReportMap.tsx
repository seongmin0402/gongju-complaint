'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Crosshair } from 'lucide-react';
import { GONGJU_BOUNDS, isInsideGongju } from '@/lib/gongju-bounds';
import { isGongjuFromNaverReverseResponse } from '@/lib/gongju-validation';
import MapTypeControls from '@/components/MapTypeControls';
import { drawGongjuBoundaryPolygon } from '@/lib/gongju-boundary-map';

interface Position {
  lat: number;
  lng: number;
}

interface ReportMapProps {
  position: Position | null;
  onPositionChange: (pos: Position, address: string) => void;
}

export default function ReportMap({ position, onPositionChange }: ReportMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const boundaryPolygonRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [mapForControls, setMapForControls] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.naver?.maps) {
      setIsLoaded(true);
      return;
    }

    const existing = document.getElementById('naver-map-script');
    if (existing) {
      if (window.naver?.maps) {
        setIsLoaded(true);
      } else {
        existing.addEventListener('load', () => setIsLoaded(true));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('네이버 지도 SDK 로딩 실패');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current) return;

    const sw = new window.naver.maps.LatLng(GONGJU_BOUNDS.south, GONGJU_BOUNDS.west);
    const ne = new window.naver.maps.LatLng(GONGJU_BOUNDS.north, GONGJU_BOUNDS.east);
    const gongjuBounds = new window.naver.maps.LatLngBounds(sw, ne);
    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(36.4468, 127.1191),
      zoom: 14,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: gongjuBounds,
      mapDataControl: false,
    });
    mapInstance.current = map;
    setMapForControls(map);

    // Instruction overlay
    const guide = new window.naver.maps.InfoWindow({
      content: `<div style="
        padding:8px 14px;
        background:#1e40af;color:white;
        font-size:12px;font-weight:600;
        border-radius:6px;
        font-family:-apple-system,BlinkMacSystemFont,'Malgun Gothic',sans-serif;
        white-space:nowrap;
      ">📍 공주시 안에서 클릭하여 위치를 선택하세요</div>`,
      disableAnchor: true,
      borderWidth: 0,
      backgroundColor: 'transparent',
    });
    guide.open(map, map.getCenter());
    setTimeout(() => guide.close(), 3500);

    window.naver.maps.Event.addListener(map, 'click', (e: any) => {
      const lat = e.coord.y ?? e.coord.lat();
      const lng = e.coord.x ?? e.coord.lng();
      placeMarker(lat, lng);
    });
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapForControls) return;
    const map = mapInstance.current;
    if (!map) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/gongju-boundary');
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { ring?: [number, number][] };
        const ring = data.ring;
        if (!Array.isArray(ring) || ring.length < 4 || cancelled) return;
        if (boundaryPolygonRef.current) {
          boundaryPolygonRef.current.setMap(null);
          boundaryPolygonRef.current = null;
        }
        const drawn = drawGongjuBoundaryPolygon(map, ring);
        if (drawn?.polygon) boundaryPolygonRef.current = drawn.polygon;
      } catch {
        /* 경계 표시 실패 시 지도만 사용 */
      }
    })();
    return () => {
      cancelled = true;
      if (boundaryPolygonRef.current) {
        boundaryPolygonRef.current.setMap(null);
        boundaryPolygonRef.current = null;
      }
    };
  }, [isLoaded, mapForControls]);

  function reverseGeocode(lat: number, lng: number, callback: (addr: string, response: unknown) => void) {
    if (!window.naver?.maps?.Service) {
      callback('', null);
      return;
    }
    const Service = window.naver.maps.Service;
    const opts: Record<string, unknown> = {
      coords: new window.naver.maps.LatLng(lat, lng),
    };
    if (Service.OrderType) {
      opts.orders = [Service.OrderType.ADDR, Service.OrderType.ROAD_ADDR].filter(Boolean).join(',');
    }
    Service.reverseGeocode(
      opts,
      (status: string, response: any) => {
        const err = Service.Status?.ERROR;
        if (err != null && status === err) {
          callback('', response);
          return;
        }
        const a = response?.v2?.address;
        let addr =
          (a?.roadAddress as string) ||
          (a?.jibunAddress as string) ||
          (typeof a === 'string' ? a : '') ||
          '';
        if (!addr && response?.v2?.results?.[0]) {
          const r = response.v2.results[0];
          const region = r.region;
          if (region) {
            const parts = [region.area1?.name, region.area2?.name, region.area3?.name, region.area4?.name].filter(Boolean);
            addr = parts.join(' ');
          }
          if (!addr && r.land?.name) addr = r.land.name as string;
        }
        callback(typeof addr === 'string' ? addr.trim() : '', response);
      }
    );
  }

  function placeMarker(lat: number, lng: number) {
    if (!mapInstance.current) return;
    if (!isInsideGongju(lat, lng)) {
      alert('공주시 안에서만 민원 위치를 선택할 수 있습니다.');
      return;
    }

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: mapInstance.current,
      icon: {
        content: `<div style="
          width:36px;height:36px;
          background:#2563eb;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 3px 10px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>`,
        size: new window.naver.maps.Size(36, 36),
        anchor: new window.naver.maps.Point(18, 36),
      },
    });

    reverseGeocode(lat, lng, (addr, naverResponse) => {
      if (!isGongjuFromNaverReverseResponse(naverResponse)) {
        alert('선택한 위치는 공주시 행정구역이 아닙니다. 공주시 안에서 다시 선택해 주세요.');
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        return;
      }
      onPositionChange({ lat, lng }, addr);
    });
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstance.current) {
          mapInstance.current.setCenter(new window.naver.maps.LatLng(lat, lng));
          mapInstance.current.setZoom(16);
        }
        placeMarker(lat, lng);
        setIsGeolocating(false);
      },
      () => {
        alert('위치를 가져올 수 없습니다. 브라우저 위치 권한을 확인해 주세요.');
        setIsGeolocating(false);
      }
    );
  }

  // Sync external position changes (e.g. initial value)
  useEffect(() => {
    if (!isLoaded || !mapInstance.current || !position) return;
    if (markerRef.current) return; // already placed by user click
    placeMarker(position.lat, position.lng);
    mapInstance.current.setCenter(new window.naver.maps.LatLng(position.lat, position.lng));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, position]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">지도 로딩 중...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <MapTypeControls map={mapForControls} isLoaded={isLoaded} />
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isGeolocating || !isLoaded}
          className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-60"
        >
          <Crosshair className={`w-4 h-4 ${isGeolocating ? 'animate-spin' : ''}`} />
          {isGeolocating ? '위치 찾는 중...' : '현재 위치 사용'}
        </button>
      </div>

      {/* No position hint */}
      {!position && isLoaded && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-600 px-3 py-2 rounded-full shadow text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            공주시 내에서 클릭하여 위치를 선택하세요
          </div>
        </div>
      )}
    </div>
  );
}
