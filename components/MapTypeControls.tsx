'use client';

import { useCallback, useState } from 'react';

const MAP_TYPES = [
  { id: 'NORMAL' as const, label: '일반' },
  { id: 'TERRAIN' as const, label: '지형' },
  { id: 'SATELLITE' as const, label: '위성' },
  { id: 'HYBRID' as const, label: '위성(명칭)' },
];

type MapTypeKey = (typeof MAP_TYPES)[number]['id'];

interface MapTypeControlsProps {
  map: any | null;
  isLoaded: boolean;
}

export default function MapTypeControls({ map, isLoaded }: MapTypeControlsProps) {
  const [active, setActive] = useState<MapTypeKey>('NORMAL');

  const applyType = useCallback(
    (id: MapTypeKey) => {
      if (!map || typeof window === 'undefined' || !window.naver?.maps?.MapTypeId) return;
      const MapTypeId = window.naver.maps.MapTypeId;
      const typeId = MapTypeId[id as keyof typeof MapTypeId];
      if (typeId === undefined) return;
      if (map.getMapTypeId() === typeId) return;
      map.setMapTypeId(typeId);
      setActive(id);
    },
    [map],
  );

  if (!isLoaded || !map) return null;

  return (
    <div
      className="flex flex-col gap-0.5 rounded-lg border border-gray-200 bg-white/95 p-1 shadow-lg backdrop-blur-sm"
      role="group"
      aria-label="지도 유형"
    >
      {MAP_TYPES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => applyType(id)}
          className={`min-w-[4.5rem] rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
            active === id
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
