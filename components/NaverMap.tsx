'use client';

import { useEffect, useRef, useState } from 'react';
import MapTypeControls from '@/components/MapTypeControls';
import { drawGongjuBoundaryPolygon } from '@/lib/gongju-boundary-map';
import { GONGJU_BOUNDS } from '@/lib/gongju-bounds';
import type { Complaint } from '@/types';
import { CATEGORY_COLORS, STATUS_COLORS, STATUS_BG_CLASSES } from '@/types';

interface NaverMapProps {
  complaints: Complaint[];
  highlightId?: string | null;
}

// --- 클러스터링 유틸 ---
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
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

function getClusterThreshold(zoom: number): number {
  if (zoom >= 15) return 0;
  if (zoom === 14) return 0.12;
  if (zoom === 13) return 0.28;
  if (zoom === 12) return 0.6;
  if (zoom === 11) return 1.2;
  return 2.5;
}

interface ClusterGroup {
  complaints: Complaint[];
  lat: number;
  lng: number;
}

function clusterComplaints(complaints: Complaint[], thresholdKm: number): ClusterGroup[] {
  if (thresholdKm === 0) {
    return complaints.map((c) => ({ complaints: [c], lat: c.latitude, lng: c.longitude }));
  }
  const assigned = new Set<number>();
  const groups: ClusterGroup[] = [];

  for (let i = 0; i < complaints.length; i++) {
    if (assigned.has(i)) continue;
    const group: Complaint[] = [complaints[i]];
    assigned.add(i);
    for (let j = i + 1; j < complaints.length; j++) {
      if (assigned.has(j)) continue;
      if (haversineKm(complaints[i].latitude, complaints[i].longitude, complaints[j].latitude, complaints[j].longitude) <= thresholdKm) {
        group.push(complaints[j]);
        assigned.add(j);
      }
    }
    const lat = group.reduce((s, c) => s + c.latitude, 0) / group.length;
    const lng = group.reduce((s, c) => s + c.longitude, 0) / group.length;
    groups.push({ complaints: group, lat, lng });
  }
  return groups;
}

// --- 마커 HTML ---
function buildMarkerHtml(color: string, isHighlighted = false) {
  const size = isHighlighted ? 32 : 26;
  const shadow = isHighlighted ? '0 4px 12px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.35)';
  return `
    <div style="width:${size + 4}px; height:${size + 8}px; position:relative;">
      <div style="
        width:${size}px; height:${size}px;
        background:${color};
        border:3px solid white;
        border-radius:50%;
        box-shadow:${shadow};
        position:absolute; top:0; left:2px;
      "></div>
      <div style="
        width:0; height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:9px solid ${color};
        position:absolute; bottom:0; left:${size / 2 - 4}px;
      "></div>
    </div>`;
}

function buildClusterHtml(count: number, color: string) {
  const size = count >= 10 ? 48 : 40;
  return `
    <div style="
      width:${size}px; height:${size}px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
      display:flex; align-items:center; justify-content:center;
      position:relative;
    ">
      <span style="color:white;font-weight:800;font-size:${count >= 10 ? 14 : 15}px;font-family:-apple-system,sans-serif;line-height:1;">${count}</span>
      <div style="
        position:absolute;
        width:${size + 10}px; height:${size + 10}px;
        border:2px solid ${color};
        border-radius:50%;
        opacity:0.35;
        top:50%; left:50%; transform:translate(-50%,-50%);
      "></div>
    </div>`;
}

function buildInfoContent(complaint: Complaint) {
  const statusColor = STATUS_COLORS[complaint.status] || '#6B7280';
  const catColor = CATEGORY_COLORS[complaint.category] || '#6B7280';
  const date = new Date(complaint.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  return `
    <div style="
      padding:14px 16px;
      min-width:210px; max-width:260px;
      font-family:-apple-system,BlinkMacSystemFont,'Malgun Gothic',sans-serif;
      font-size:13px; line-height:1.5;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="display:inline-flex;align-items:center;gap:5px;font-weight:700;color:#111827;font-size:14px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${catColor};display:inline-block;flex-shrink:0;"></span>
          ${complaint.category}
        </span>
        <span style="background:${statusColor};color:white;font-size:11px;font-weight:600;padding:2px 9px;border-radius:9999px;white-space:nowrap;">${complaint.status}</span>
      </div>
      <p style="margin:0 0 8px 0;color:#374151;font-size:13px;word-break:break-all;">${complaint.description}</p>
      ${complaint.address ? `<p style="margin:0 0 4px 0;color:#6B7280;font-size:12px;">📍 ${complaint.address}</p>` : ''}
      <p style="margin:0;color:#9CA3AF;font-size:11px;">📅 ${date}</p>
    </div>`;
}

function buildClusterInfoContent(group: ClusterGroup) {
  return `
    <div style="
      padding:12px 16px;
      min-width:180px;
      font-family:-apple-system,BlinkMacSystemFont,'Malgun Gothic',sans-serif;
      font-size:13px; line-height:1.6;
    ">
      <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">📍 ${group.complaints.length}건의 민원</p>
      ${group.complaints.slice(0, 3).map((c) => `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${STATUS_COLORS[c.status]};flex-shrink:0;"></span>
          <span style="color:#374151;font-size:12px;">${c.category} · ${c.status}</span>
        </div>`).join('')}
      ${group.complaints.length > 3 ? `<p style="margin:4px 0 0;color:#9CA3AF;font-size:11px;">외 ${group.complaints.length - 3}건 더보기 (확대하세요)</p>` : ''}
    </div>`;
}

export default function NaverMap({ complaints, highlightId }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const boundaryPolygonRef = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const infoWindow = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapForControls, setMapForControls] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.naver?.maps) { setIsLoaded(true); return; }
    const existing = document.getElementById('naver-map-script');
    if (existing) { existing.addEventListener('load', () => setIsLoaded(true)); return; }
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
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: gongjuBounds,
      mapDataControl: false,
    });
    mapInstance.current = map;
    setMapForControls(map);
    infoWindow.current = new window.naver.maps.InfoWindow({
      content: '',
      disableAnchor: false,
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      anchorSize: new window.naver.maps.Size(10, 10),
      anchorColor: 'white',
    });
    window.naver.maps.Event.addListener(map, 'zoom_changed', () => {
      setMapZoom(mapInstance.current.getZoom());
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
        /* ignore */
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

  useEffect(() => {
    if (!mapInstance.current || !isLoaded) return;

    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    const threshold = getClusterThreshold(mapZoom);
    const groups = clusterComplaints(complaints, threshold);

    groups.forEach((group) => {
      const isSingle = group.complaints.length === 1;
      const complaint = group.complaints[0];

      // 색상: 접수 위주 → 접수색, 처리중 위주 → 처리중색
      const dominantStatus = group.complaints.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topStatus = Object.entries(dominantStatus).sort((a, b) => b[1] - a[1])[0][0];
      const color = STATUS_COLORS[topStatus as keyof typeof STATUS_COLORS] || '#6B7280';

      const isHighlighted = isSingle && complaint.id === highlightId;

      const markerContent = isSingle
        ? buildMarkerHtml(color, isHighlighted)
        : buildClusterHtml(group.complaints.length, color);

      const markerSize = isSingle
        ? (isHighlighted ? 36 : 30)
        : (group.complaints.length >= 10 ? 52 : 44);

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(group.lat, group.lng),
        map: mapInstance.current,
        icon: {
          content: markerContent,
          size: new window.naver.maps.Size(markerSize, isSingle ? markerSize + 8 : markerSize),
          anchor: new window.naver.maps.Point(markerSize / 2, isSingle ? markerSize + 8 : markerSize / 2),
        },
        title: isSingle ? complaint.category : `${group.complaints.length}건`,
        zIndex: isHighlighted ? 10 : (isSingle ? 1 : 5),
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (!isSingle) {
          // 클러스터 클릭: 줌인 또는 정보창
          if (mapZoom < 14) {
            mapInstance.current.setCenter(new window.naver.maps.LatLng(group.lat, group.lng));
            mapInstance.current.setZoom(mapZoom + 2);
          } else {
            infoWindow.current.setContent(buildClusterInfoContent(group));
            infoWindow.current.open(mapInstance.current, marker);
          }
        } else {
          infoWindow.current.setContent(buildInfoContent(complaint));
          infoWindow.current.open(mapInstance.current, marker);
        }
      });

      markers.current.push(marker);
    });

    if (highlightId) {
      const target = complaints.find((c) => c.id === highlightId);
      if (target) {
        mapInstance.current.panTo(new window.naver.maps.LatLng(target.latitude, target.longitude));
      }
    }
  }, [complaints, highlightId, isLoaded, mapZoom]);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 z-10">
        <MapTypeControls map={mapForControls} isLoaded={isLoaded} />
      </div>
    </div>
  );
}
