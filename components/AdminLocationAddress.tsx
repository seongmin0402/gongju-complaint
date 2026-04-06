'use client';

import { useEffect, useState, useRef } from 'react';
import type { Complaint } from '@/types';

type Props = {
  complaint: Complaint;
  getToken: () => Promise<string>;
  onAddressPersisted?: (id: string, address: string) => void;
};

export default function AdminLocationAddress({ complaint, getToken, onAddressPersisted }: Props) {
  const persistedRef = useRef(false);
  const onSavedRef = useRef(onAddressPersisted);
  onSavedRef.current = onAddressPersisted;
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const [text, setText] = useState(() => complaint.address?.trim() ?? '');
  const [loading, setLoading] = useState(() => !complaint.address?.trim());

  useEffect(() => {
    const addr = complaint.address?.trim() ?? '';
    if (addr) {
      setText(addr);
      setLoading(false);
      persistedRef.current = false;
      return;
    }
    persistedRef.current = false;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/reverse-geocode?lat=${complaint.latitude}&lng=${complaint.longitude}`
        );
        const data = (await res.json()) as { address?: string };
        if (cancelled) return;
        const resolved = (data.address || '').trim();
        setText(resolved);
        if (resolved && !persistedRef.current) {
          persistedRef.current = true;
          try {
            const token = await getTokenRef.current();
            const patch = await fetch(`/api/complaints/${complaint.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ address: resolved }),
            });
            if (patch.ok) onSavedRef.current?.(complaint.id, resolved);
          } catch {
            persistedRef.current = false;
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [complaint.id, complaint.latitude, complaint.longitude, complaint.address]);

  if (loading) {
    return <p className="text-gray-500 text-sm">주소를 불러오는 중...</p>;
  }
  if (text) {
    return <p className="text-gray-700">{text}</p>;
  }
  return <p className="text-gray-500">주소를 찾을 수 없습니다 (좌표만 저장됨)</p>;
}
