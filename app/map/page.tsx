'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Plus, RefreshCw, AlertCircle, ChevronUp, ChevronDown, Search, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/types';
import { STATUS_COLORS, STATUS_BG_CLASSES, CATEGORY_COLORS } from '@/types';

const NaverMap = dynamic(() => import('@/components/NaverMap'), { ssr: false });

const STATUS_LABELS: { status: ComplaintStatus; label: string }[] = [
  { status: '접수', label: '접수' },
  { status: '처리중', label: '처리중' },
  { status: '완료', label: '완료' },
];

function MapPageContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ComplaintStatus | 'all'>('all');
  const [newCount, setNewCount] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const [showSheet, setShowSheet] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('민원 목록을 불러오지 못했습니다.');
      const data: Complaint[] = await res.json();
      setComplaints(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    const channel = supabase
      .channel('complaints-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setComplaints((prev) => [payload.new as Complaint, ...prev]);
          setNewCount((n) => n + 1);
        } else if (payload.eventType === 'UPDATE') {
          setComplaints((prev) => prev.map((c) => c.id === (payload.new as Complaint).id ? (payload.new as Complaint) : c));
        } else if (payload.eventType === 'DELETE') {
          setComplaints((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchComplaints]);

  const filteredComplaints = activeFilter === 'all' ? complaints : complaints.filter((c) => c.status === activeFilter);
  const mapComplaints = filteredComplaints.filter((c) => c.status !== '완료');
  const stats = {
    total: complaints.length,
    접수: complaints.filter((c) => c.status === '접수').length,
    처리중: complaints.filter((c) => c.status === '처리중').length,
    완료: complaints.filter((c) => c.status === '완료').length,
  };
  const statItems = [
    { label: '전체', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50' },
    { label: '접수', value: stats.접수, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: '처리중', value: stats.처리중, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: '완료', value: stats.완료, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  const FilterButtons = () => (
    <div className="flex gap-1.5 flex-wrap">
      {(['all', '접수', '처리중', '완료'] as const).map((f) => (
        <button key={f} onClick={() => setActiveFilter(f)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {f === 'all' ? '전체' : f}
        </button>
      ))}
    </div>
  );

  const ComplaintList = () => (
    <>
      {filteredComplaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MapPin className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">{activeFilter === 'all' ? '등록된 민원이 없습니다.' : `${activeFilter} 상태의 민원이 없습니다.`}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filteredComplaints.map((c) => (
            <li key={c.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors ${c.id === highlightId ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: CATEGORY_COLORS[c.category] }} />
                  <span className="text-xs font-semibold text-gray-700 truncate">{c.category}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BG_CLASSES[c.status]}`}>{c.status}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 pl-3.5">{c.description}</p>
              {c.address && <p className="text-xs text-gray-400 mt-1 pl-3.5 truncate">📍 {c.address}</p>}
              <p className="text-xs text-gray-300 mt-1 pl-3.5">{new Date(c.created_at).toLocaleDateString('ko-KR')}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="min-h-0 flex-1 flex flex-col overflow-hidden bg-gray-900">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors mr-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src="/로고_세로.png" alt="공주시 로고" className="h-8 sm:h-10 w-auto object-contain flex-shrink-0" />
          <div>
            <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">민원 현황 지도</h1>
            <p className="text-xs text-gray-400 leading-tight hidden sm:block">실시간 민원 현황</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <button onClick={() => setNewCount(0)} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              신규 {newCount}건
            </button>
          )}
          <Link href="/lookup" className="hidden sm:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2 rounded-lg transition-colors">
            <Search className="w-4 h-4" />민원 조회
          </Link>
          <Link href="/report" className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />민원 신고
          </Link>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-6">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-3">{error}</p>
                <button onClick={fetchComplaints} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mx-auto">
                  <RefreshCw className="w-4 h-4" />다시 시도
                </button>
              </div>
            </div>
          ) : (
            <NaverMap complaints={mapComplaints} highlightId={highlightId} />
          )}
          {isLoading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-full shadow text-sm">
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                불러오는 중...
              </div>
            </div>
          )}
        </div>

        <div className={`hidden md:flex flex-col bg-white border-l border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${showPanel ? 'w-80' : 'w-0 overflow-hidden'}`}>
          <button onClick={() => setShowPanel((p) => !p)}
            className="absolute top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-l-lg px-1.5 py-3 shadow-md hover:bg-gray-50 transition-colors"
            style={{ right: showPanel ? '319px' : '-1px' }}>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showPanel ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {showPanel && (
            <>
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700 mb-3">민원 현황</h2>
                <div className="grid grid-cols-4 gap-2">
                  {statItems.map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-lg p-2 text-center`}>
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 pt-3 pb-2 border-b border-gray-100"><FilterButtons /></div>
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {STATUS_LABELS.map(({ status, label }) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] }} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin"><ComplaintList /></div>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden fixed right-4 z-30 flex flex-col gap-2 items-end" style={{ bottom: showSheet ? 'calc(55vh + 12px)' : '88px' }}>
        <Link href="/lookup" className="w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 hover:bg-gray-50">
          <Search className="w-4 h-4" />
        </Link>
        <Link href="/report" className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95">
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      <div className={`md:hidden fixed left-0 right-0 bottom-0 z-20 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${showSheet ? 'translate-y-0' : 'translate-y-[calc(100%-76px)]'}`} style={{ maxHeight: '55vh' }}>
        <button className="w-full px-4 pt-3 pb-2 flex flex-col items-center" onClick={() => setShowSheet((p) => !p)}>
          <div className="w-10 h-1 bg-gray-200 rounded-full mb-3" />
          <div className="w-full flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-600">민원 현황</span>
            <span className="text-gray-400">{showSheet ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}</span>
          </div>
          <div className="w-full grid grid-cols-4 gap-2">
            {statItems.map((s) => (
              <div key={s.label} className={`${s.bg} rounded-lg py-1.5 text-center`}>
                <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </button>
        {showSheet && (
          <div className="flex flex-col overflow-hidden" style={{ height: 'calc(55vh - 76px)' }}>
            <div className="px-4 py-2 border-t border-gray-100"><FilterButtons /></div>
            <div className="px-4 py-1.5 border-t border-gray-100">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {STATUS_LABELS.map(({ status, label }) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] }} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto border-t border-gray-100"><ComplaintList /></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-0 flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-300 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
