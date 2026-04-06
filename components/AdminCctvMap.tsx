'use client';

import { useEffect, useRef, useState } from 'react';
import { GONGJU_BOUNDS } from '@/lib/gongju-bounds';
import { drawGongjuBoundaryPolygon } from '@/lib/gongju-boundary-map';
import { CCTV_COORDS } from '@/lib/cctv-coords';
import type { Complaint } from '@/types';
import { CATEGORY_COLORS } from '@/types';

interface Props {
  complaints?: Complaint[];
}

/** 줌 레벨에 따른 마커 크기 계산 (10~19 → 16~36px) */
function cctvSize(zoom: number): number {
  return Math.max(16, Math.min(36, 16 + (zoom - 10) * 2.2));
}

function cctvMarkerHtml(zoom: number) {
  const sz = cctvSize(zoom);
  const radius = Math.round(sz * 0.25);
  const fontSize = Math.round(sz * 0.5);
  return `<div style="width:${sz}px;height:${sz}px;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(145deg,#7c3aed,#5b21b6);border:${sz > 22 ? 2.5 : 1.5}px solid #fff;border-radius:${radius}px;
    box-shadow:0 2px 8px rgba(0,0,0,.35);font-size:${fontSize}px;line-height:1;">📹</div>`;
}

/** 민원 핀 마커 HTML */
function complaintMarkerHtml(color: string) {
  return `<div style="
    width:10px;height:10px;border-radius:50%;
    background:${color};border:1.5px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,.4);
  "></div>`;
}

export default function AdminCctvMap({ complaints = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const cctvMarkersRef = useRef<any[]>([]);
  const complaintMarkersRef = useRef<any[]>([]);
  const boundaryPolygonRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [markerCount, setMarkerCount] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(12);

  // Naver Maps SDK 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.naver?.maps) { setIsLoaded(true); return; }

    const existing = document.getElementById('naver-map-script');
    if (existing) {
      const check = setInterval(() => {
        if (window.naver?.maps) { clearInterval(check); setIsLoaded(true); }
      }, 200);
      return () => clearInterval(check);
    }

    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.onload = () => {
      const check = setInterval(() => {
        if (window.naver?.maps) { clearInterval(check); setIsLoaded(true); }
      }, 200);
    };
    document.head.appendChild(script);
  }, []);

  // 지도 초기화 + CCTV 마커
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current) return;

    const sw = new window.naver.maps.LatLng(GONGJU_BOUNDS.south, GONGJU_BOUNDS.west);
    const ne = new window.naver.maps.LatLng(GONGJU_BOUNDS.north, GONGJU_BOUNDS.east);
    const bounds = new window.naver.maps.LatLngBounds(sw, ne);
    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(36.4468, 127.1191),
      zoom: 12,
      minZoom: 10,
      maxZoom: 19,
      maxBounds: bounds,
    });
    mapInstance.current = map;

    // 행정경계선
    fetch('/api/gongju-boundary')
      .then((r) => r.json())
      .then((data) => {
        const ring = data.ring;
        if (Array.isArray(ring) && ring.length >= 4) {
          const drawn = drawGongjuBoundaryPolygon(map, ring);
          if (drawn?.polygon) boundaryPolygonRef.current = drawn.polygon;
        }
      })
      .catch(() => {});

    // CCTV 마커 초기 렌더
    const validItems = CCTV_COORDS.filter((r) => r.lat !== null && r.lng !== null);
    let count = 0;
    for (const r of validItems) {
      const pos = new window.naver.maps.LatLng(r.lat!, r.lng!);
      const marker = new window.naver.maps.Marker({
        position: pos,
        map,
        icon: {
          content: cctvMarkerHtml(12),
          anchor: new window.naver.maps.Point(cctvSize(12) / 2, cctvSize(12) / 2),
        },
        title: `${r.row_no}. ${r.note || r.install_location}`,
      });
      const info = new window.naver.maps.InfoWindow({
        content: `<div style="padding:10px 12px;max-width:240px;font-size:12px;line-height:1.5;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;margin-bottom:3px;">연번 ${r.row_no} · ${r.jurisdiction}</div>
          <div style="color:#374151;">${(r.note || r.install_location).replace(/</g, '&lt;')}</div>
          <div style="color:#6b7280;font-size:11px;margin-top:3px;">${r.install_location.replace(/</g, '&lt;')}</div>
        </div>`,
      });
      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (info.getMap()) info.close();
        else info.open(map, marker);
      });
      cctvMarkersRef.current.push(marker);
      count++;
    }
    setMarkerCount(count);

    // 줌 변경 이벤트 → 마커 크기 갱신
    window.naver.maps.Event.addListener(map, 'zoom_changed', () => {
      const z = map.getZoom();
      setCurrentZoom(z);
      const sz = cctvSize(z);
      for (const m of cctvMarkersRef.current) {
        m.setIcon({
          content: cctvMarkerHtml(z),
          anchor: new window.naver.maps.Point(sz / 2, sz / 2),
        });
      }
    });
  }, [isLoaded]);

  // 민원 마커 동기화 (complaints prop 변경 시)
  useEffect(() => {
    if (!isLoaded || !mapInstance.current) return;
    const map = mapInstance.current;

    // 기존 민원 마커 제거
    for (const m of complaintMarkersRef.current) m.setMap(null);
    complaintMarkersRef.current = [];

    // 새 민원 마커 추가
    for (const c of complaints) {
      if (!c.latitude || !c.longitude) continue;
      const color = CATEGORY_COLORS[c.category] || '#6B7280';
      const pos = new window.naver.maps.LatLng(c.latitude, c.longitude);
      const marker = new window.naver.maps.Marker({
        position: pos,
        map,
        icon: {
          content: complaintMarkerHtml(color),
          anchor: new window.naver.maps.Point(5, 5),
        },
        title: `[${c.category}] ${c.description.slice(0, 40)}`,
        zIndex: 5,
      });
      const infoContent = `<div style="padding:8px 10px;max-width:220px;font-size:11px;line-height:1.5;font-family:system-ui,sans-serif;">
        <div style="font-weight:700;color:${color};margin-bottom:2px;">${c.category}</div>
        <div style="color:#374151;">${c.description.slice(0, 60).replace(/</g, '&lt;')}${c.description.length > 60 ? '…' : ''}</div>
        <div style="color:#9ca3af;font-size:10px;margin-top:3px;">${c.status} · ${new Date(c.created_at).toLocaleDateString('ko-KR')}</div>
      </div>`;
      const info = new window.naver.maps.InfoWindow({ content: infoContent });
      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (info.getMap()) info.close();
        else info.open(map, marker);
      });
      complaintMarkersRef.current.push(marker);
    }
  }, [isLoaded, complaints]);

  return (
    <div className="relative w-full h-[min(480px,60vh)] min-h-[300px] rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          네이버 지도 SDK 불러오는 중…
        </div>
      )}

      {isLoaded && (
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          <div className="bg-white/95 text-xs text-gray-600 px-2 py-1 rounded-md shadow border border-gray-200">
            📹 CCTV {markerCount}개
          </div>
          {complaints.length > 0 && (
            <div className="bg-white/95 text-xs text-gray-600 px-2 py-1 rounded-md shadow border border-gray-200">
              📍 민원 {complaints.length}건
            </div>
          )}
        </div>
      )}

      {/* 범례 */}
      {isLoaded && complaints.length > 0 && (
        <div className="absolute top-2 right-2 bg-white/95 text-xs text-gray-600 px-2.5 py-2 rounded-md shadow border border-gray-200 space-y-1">
          <div className="font-semibold text-gray-700 mb-1">범례</div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 12, borderRadius: '3px', background: 'linear-gradient(145deg,#7c3aed,#5b21b6)', display: 'inline-block' }} />
            <span>CCTV</span>
          </div>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, border: '1px solid #fff', display: 'inline-block' }} />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
