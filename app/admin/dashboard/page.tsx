'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { Complaint, ComplaintStatus, ComplaintPriority } from '@/types';
import { STATUS_BG_CLASSES, CATEGORY_COLORS, PRIORITY_BG_CLASSES, PRIORITY_OPTIONS } from '@/types';
import {
  LogOut, ShieldCheck, MapPin, RefreshCw, ChevronDown, ExternalLink,
  AlertCircle, Trash2, ImageIcon, Download, Search, FileText, Bell, BellOff, Clock, Video, Zap,
} from 'lucide-react';
import AdminLocationAddress from '@/components/AdminLocationAddress';
import SiteFooter from '@/components/SiteFooter';

const AdminCctvMap = dynamic(() => import('@/components/AdminCctvMap'), { ssr: false });
const WeeklyPieChart = dynamic(() => import('@/components/WeeklyPieChart'), { ssr: false });

const STATUS_OPTIONS: ComplaintStatus[] = ['접수', '처리중', '완료'];

type DateFilter = 'all' | 'today' | 'week' | 'month';

function getDateRange(filter: DateFilter): Date | null {
  const now = new Date();
  if (filter === 'today') { const d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (filter === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
  if (filter === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
  return null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ComplaintStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [memoValues, setMemoValues] = useState<Record<string, string>>({});
  const [savingMemoId, setSavingMemoId] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [notifSupported, setNotifSupported] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, { severity: string; level: string; autoPriority: ComplaintPriority | null; labels: string[]; rawLabels: { name: string; score: number }[] }>>({});
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'all'>('all');
  const [updatingPriorityId, setUpdatingPriorityId] = useState<string | null>(null);
  type SortBy = 'latest' | 'priority';
  const [sortBy, setSortBy] = useState<SortBy>('latest');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/admin');
      else setUserEmail(session.user.email || '');
    });
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifSupported(true);
      setNotifPermission(Notification.permission);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestNotifPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  }

  function sendNotification(title: string, body: string) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/로고_세로.png' });
    }
  }

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('민원 목록을 불러오지 못했습니다.');
      const data: Complaint[] = await res.json();
      setComplaints(data);
      const memos: Record<string, string> = {};
      data.forEach((c) => { memos[c.id] = c.admin_memo || ''; });
      setMemoValues(memos);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);


  // 실시간 새 민원 알림
  useEffect(() => {
    const { supabase: sb } = { supabase: createSupabaseBrowserClient() };
    const channel = sb
      .channel('admin-new-complaints')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, (payload) => {
        const c = payload.new as Complaint;
        setComplaints((prev) => [c, ...prev]);
        setMemoValues((prev) => ({ ...prev, [c.id]: '' }));
        sendNotification(
          '새 민원이 접수되었습니다',
          `[${c.category}] ${c.description.slice(0, 50)}${c.description.length > 50 ? '…' : ''}`
        );
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('세션이 만료되었습니다. 다시 로그인해 주세요.');
    return session.access_token;
  }

  const handleAddressPersisted = useCallback((id: string, address: string) => {
    setComplaints((prev) => prev.map((row) => (row.id === id ? { ...row, address } : row)));
  }, []);

  async function handlePriorityChange(id: string, newPriority: ComplaintPriority | null) {
    setUpdatingPriorityId(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const updated: Complaint = await res.json();
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      alert(e instanceof Error ? e.message : '우선순위 변경에 실패했습니다.');
    } finally {
      setUpdatingPriorityId(null);
    }
  }

  /**
   * 접수 상태 민원들의 우선순위를 AI severity 기준으로 재계산해 일괄 저장.
   * 호출 시점에 최신 complaints 배열을 받아서 처리.
   */
  async function recalcOpenPriorities(currentComplaints: Complaint[]) {
    const PRIORITY_ORDER: Record<string, number> = { '높음': 0, '보통': 1, '낮음': 2 };
    const LEVEL_PRIORITY_MAP: Record<string, ComplaintPriority> = {
      critical: '높음', high: '높음', medium: '보통', low: '낮음',
    };

    const openComplaints = currentComplaints.filter((c) => c.status === '접수');

    // AI 분석이 된 것들은 severity에서 level 추출, 없으면 순서 기반으로 보통 부여
    const ranked = openComplaints
      .map((c) => {
        const levelMatch = c.ai_severity?.match(/\[심각도: (낮음|보통|높음|매우 높음)\]/);
        const levelKr = levelMatch?.[1];
        const levelEn = levelKr === '매우 높음' || levelKr === '높음' ? 'high'
          : levelKr === '보통' ? 'medium'
          : levelKr === '낮음' ? 'low'
          : null;
        return { c, levelEn, priority: levelEn ? LEVEL_PRIORITY_MAP[levelEn] : null };
      })
      .sort((a, b) => {
        const pa = a.priority ? PRIORITY_ORDER[a.priority] : 99;
        const pb = b.priority ? PRIORITY_ORDER[b.priority] : 99;
        return pa - pb;
      });

    try {
      const token = await getToken();
      await Promise.all(
        ranked.map(({ c, priority }) => {
          if (priority === c.priority) return Promise.resolve();
          return fetch(`/api/complaints/${c.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ priority: priority ?? null }),
          });
        })
      );
      // 로컬 상태도 반영
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.status !== '접수') return c;
          const found = ranked.find((r) => r.c.id === c.id);
          return found ? { ...c, priority: found.priority ?? null } : c;
        })
      );
    } catch {
      // 재계산 실패는 무시 (다음 새로고침 때 반영)
    }
  }

  async function handleAnalyzePhoto(complaint: Complaint) {
    const photoUrl = (complaint.photo_urls && complaint.photo_urls.length > 0)
      ? complaint.photo_urls[0]
      : complaint.photo_url;
    if (!photoUrl) return;

    setAnalyzingId(complaint.id);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photo_url: photoUrl, complaint_id: complaint.id, category: complaint.category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI 분석 실패');
      setAnalysisResults((prev) => ({ ...prev, [complaint.id]: data }));

      // ai_severity + priority 로컬 반영 후 전체 재계산
      const updatedComplaints = complaints.map((c) =>
        c.id === complaint.id
          ? { ...c, ai_severity: data.severity, priority: (data.autoPriority ?? c.priority) as ComplaintPriority | null }
          : c
      );
      setComplaints(updatedComplaints);

      // 접수 상태 민원 전체 우선순위 재계산
      await recalcOpenPriorities(updatedComplaints);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleStatusChange(id: string, newStatus: ComplaintStatus) {
    setUpdatingId(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const updated: Complaint = await res.json();

      // 진행중/완료로 바뀐 경우 해당 민원 priority 클리어 후 전체 재계산
      const isLeavingOpen = newStatus !== '접수';
      const nextComplaints = complaints.map((c) =>
        c.id === id
          ? { ...updated, priority: isLeavingOpen ? null : updated.priority }
          : c
      );
      setComplaints(nextComplaints);

      if (isLeavingOpen) {
        // DB에서도 priority null 처리
        const token2 = await getToken();
        await fetch(`/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
          body: JSON.stringify({ priority: null }),
        });
        // 남은 접수 민원들 우선순위 재계산
        await recalcOpenPriorities(nextComplaints);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '상태 변경에 실패했습니다.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveMemo(id: string) {
    setSavingMemoId(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ admin_memo: memoValues[id] || '' }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const updated: Complaint = await res.json();
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      alert(e instanceof Error ? e.message : '메모 저장에 실패했습니다.');
    } finally {
      setSavingMemoId(null);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleSelectAll(ids: string[]) {
    setSelectedIds((prev) => {
      const prevArr = Array.from(prev);
      return ids.every((id) => prev.has(id))
        ? new Set(prevArr.filter((id) => !ids.includes(id)))
        : new Set([...prevArr, ...ids]);
    });
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 민원 ${selectedIds.size}건을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`)) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      await Promise.all(Array.from(selectedIds).map((id) =>
        fetch(`/api/complaints/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      ));
      setSelectedIds(new Set());
      await fetchComplaints();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }

  function exportCSV() {
    // 모든 필드를 CSV 안전하게 이스케이프 (쉼표, 줄바꿈, 따옴표 모두 처리)
    function esc(val: string | null | undefined): string {
      const str = val == null ? '' : String(val);
      // 쌍따옴표 → "" 로 이스케이프 후 전체를 따옴표로 감쌈
      return `"${str.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    }

    const headers = [
      '접수번호', '유형', '내용', '주소',
      '신고자', '연락처', '상태',
      '처리 메모', '접수일', '최종 업데이트',
      '위도', '경도',
    ];

    const rows = filtered.map((c) => [
      esc(c.complaint_number),
      esc(c.category),
      esc(c.description),
      esc(c.address),
      esc(c.reporter_name),
      esc(c.reporter_phone),
      esc(c.status),
      esc(c.admin_memo),
      esc(new Date(c.created_at).toLocaleString('ko-KR')),
      esc(new Date(c.updated_at).toLocaleString('ko-KR')),
      esc(String(c.latitude)),
      esc(String(c.longitude)),
    ]);

    const headerRow = headers.map(esc).join(',');
    const dataRows = rows.map((r) => r.join(','));
    // BOM + CRLF (Excel 한글 호환)
    const csv = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `공주시민원_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh(); router.replace('/admin');
  }

  function getDaysElapsed(createdAt: string) {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  // 필터링 + 정렬
  const PRIORITY_ORDER: Record<string, number> = { '높음': 0, '보통': 1, '낮음': 2 };
  const dateFrom = getDateRange(dateFilter);
  const filtered = complaints
    .filter((c) => {
      if (activeTab !== 'all' && c.status !== activeTab) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (dateFrom && new Date(c.created_at) < dateFrom) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !c.description.toLowerCase().includes(q) &&
          !c.address?.toLowerCase().includes(q) &&
          !c.reporter_name.toLowerCase().includes(q) &&
          !(c.complaint_number || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const pa = a.priority ? (PRIORITY_ORDER[a.priority] ?? 3) : 3;
        const pb = b.priority ? (PRIORITY_ORDER[b.priority] ?? 3) : 3;
        if (pa !== pb) return pa - pb;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // 우선순위 랭킹 — 접수 상태 중 priority 있는 것만, 높음→보통→낮음→미설정 순
  const priorityRanking = complaints
    .filter((c) => c.status === '접수')
    .sort((a, b) => {
      const pa = a.priority ? (PRIORITY_ORDER[a.priority] ?? 3) : 3;
      const pb = b.priority ? (PRIORITY_ORDER[b.priority] ?? 3) : 3;
      if (pa !== pb) return pa - pb;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const stats = {
    total: complaints.length,
    접수: complaints.filter((c) => c.status === '접수').length,
    처리중: complaints.filter((c) => c.status === '처리중').length,
    완료: complaints.filter((c) => c.status === '완료').length,
  };

  // 월별 통계 (최근 6개월)
  const monthlyStats = (() => {
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${d.getMonth() + 1}월`;
      const count = complaints.filter((c) => {
        const cd = new Date(c.created_at);
        return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    return months;
  })();
  const maxMonthly = Math.max(...monthlyStats.map((m) => m.count), 1);

  // 유형별 통계
  const categoryStats = (() => {
    const map: Record<string, number> = {};
    complaints.forEach((c) => { map[c.category] = (map[c.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/로고_세로.png" alt="공주시 로고" className="h-9 w-auto object-contain flex-shrink-0" />
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">민원 관리 시스템</h1>
            <p className="text-xs text-gray-400">국립공주대학교 지리학과</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" target="_blank" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <ExternalLink className="w-4 h-4" /><span className="hidden sm:inline">지도 보기</span>
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          {/* 알림 버튼 */}
          {notifSupported && (
            <button
              onClick={notifPermission === 'granted' ? undefined : requestNotifPermission}
              title={notifPermission === 'granted' ? '알림 허용됨' : '새 민원 알림 받기'}
              className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                notifPermission === 'granted'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {notifPermission === 'granted'
                ? <Bell className="w-4 h-4" />
                : <BellOff className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">
                {notifPermission === 'granted' ? '알림 ON' : '알림 설정'}
              </span>
            </button>
          )}
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-xs text-gray-500 hidden sm:block">{userEmail}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" />로그아웃
          </button>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: '전체 민원', value: stats.total, color: 'text-gray-700', bg: 'bg-white', border: 'border-gray-200', icon: '📋' },
            { label: '접수', value: stats.접수, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: '📬' },
            { label: '처리중', value: stats.처리중, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '⚙️' },
            { label: '처리 완료', value: stats.완료, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: '✅' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm`}>
              <span className="text-xl sm:text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CCTV 스마트경고판 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-violet-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">CCTV 스마트경고판 위치</h3>
              <p className="text-xs text-gray-400 mt-0.5">관리자 접속 시 자동으로 140개 위치를 지도에 표시합니다. 마커 클릭 시 상세 정보를 확인할 수 있습니다.</p>
            </div>
          </div>
          <AdminCctvMap complaints={complaints} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">월별 민원 현황 (최근 6개월)</h3>
            <div className="flex items-end gap-2 h-28">
              {monthlyStats.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600">{m.count > 0 ? m.count : ''}</span>
                  <div className="w-full rounded-t-md bg-blue-500 transition-all" style={{ height: `${(m.count / maxMonthly) * 80}px`, minHeight: m.count > 0 ? '4px' : '2px', opacity: m.count > 0 ? 1 : 0.2 }} />
                  <span className="text-xs text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 이번 주 민원 유형 원형 차트 */}
          <WeeklyPieChart complaints={complaints} />
        </div>

        {/* Table card + Priority sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Table card */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-3 sm:px-5 py-3 border-b border-gray-100 bg-gray-50 space-y-2">
            {/* 상태 탭 */}
            <div className="flex gap-1 flex-wrap">
              {(['all', '접수', '처리중', '완료'] as const).map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {tab === 'all' ? '전체' : tab}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-blue-500 text-blue-100' : 'bg-gray-200 text-gray-600'}`}>
                    {tab === 'all' ? stats.total : stats[tab as ComplaintStatus]}
                  </span>
                </button>
              ))}
            </div>
            {/* 필터/정렬/액션 툴바 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date filter */}
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
              </select>
              {/* 우선순위 필터 */}
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as ComplaintPriority | 'all')}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">전체 우선순위</option>
                <option value="높음">🔴 높음</option>
                <option value="보통">🟡 보통</option>
                <option value="낮음">⚪ 낮음</option>
              </select>
              {/* 정렬 */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button onClick={() => setSortBy('latest')}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${sortBy === 'latest' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  최신순
                </button>
                <button onClick={() => setSortBy('priority')}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${sortBy === 'priority' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  우선순위순
                </button>
              </div>
              {selectedIds.size > 0 && (
                <button onClick={handleDeleteSelected} disabled={isDeleting}
                  className="flex items-center gap-1.5 text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors px-3 py-1.5 rounded-lg shadow-sm">
                  {isDeleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  삭제 ({selectedIds.size})
                </button>
              )}
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 bg-white hover:bg-gray-50 transition-colors px-3 py-1.5 rounded-lg">
                <Download className="w-3.5 h-3.5" />CSV
              </button>
              <button onClick={fetchComplaints} disabled={isLoading} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />새로고침
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="접수번호, 내용, 주소, 신고자 검색..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-6 text-red-600 bg-red-50">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">민원 목록 불러오는 중...</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-gray-400 font-medium">
                    {activeTab === 'all' ? '등록된 민원이 없습니다.' : `${activeTab} 상태의 민원이 없습니다.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 w-10">
                          <input type="checkbox"
                            checked={filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))}
                            onChange={() => toggleSelectAll(filtered.map((c) => c.id))}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">접수번호</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">유형</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">내용</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">주소</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">신고자</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">신고일</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">우선순위</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => {
                        const days = getDaysElapsed(c.created_at);
                        const isOverdue = days >= 7 && c.status !== '완료';
                        return (
                        <Fragment key={c.id}>
                          <tr onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className={`cursor-pointer transition-colors border-b border-gray-100 ${
                              selectedIds.has(c.id) ? 'bg-blue-50 hover:bg-blue-100' :
                              isOverdue ? 'bg-red-50 hover:bg-red-100' :
                              'hover:bg-gray-50'
                            }`}>
                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3.5 hidden sm:table-cell">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 font-mono">{c.complaint_number || '-'}</span>
                                {isOverdue && (
                                  <span className="flex items-center gap-0.5 text-xs text-red-600 font-semibold bg-red-100 px-1.5 py-0.5 rounded-full whitespace-nowrap" title={`${days}일 경과`}>
                                    <Clock className="w-3 h-3" />{days}일
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c.category] }} />
                                <span className="font-medium text-gray-800 text-xs whitespace-nowrap">{c.category}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5 max-w-[180px]">
                              <div className="flex items-center gap-1.5">
                                <p className="text-gray-600 truncate text-xs flex-1">{c.description}</p>
                                {(c.photo_urls?.length || c.photo_url) && (
                                  <span title="사진 첨부됨"><ImageIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /></span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 hidden md:table-cell max-w-[140px]">
                              <p className="text-gray-500 truncate text-xs">{c.address || '-'}</p>
                            </td>
                            <td className="px-4 py-3.5 hidden lg:table-cell">
                              <span className="text-gray-600 text-xs">{c.reporter_name}</span>
                            </td>
                            <td className="px-4 py-3.5 hidden sm:table-cell whitespace-nowrap">
                              <span className="text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                            </td>
                            <td className="px-4 py-3.5 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                              <div className="relative flex items-center gap-1">
                                {c.priority ? (
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_BG_CLASSES[c.priority]}`}>
                                    {c.priority === '높음' ? '🔴' : c.priority === '보통' ? '🟡' : '⚪'} {c.priority}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-300">-</span>
                                )}
                                <div className="relative">
                                  <button disabled={updatingPriorityId === c.id} className="p-1 rounded hover:bg-gray-100 transition-colors">
                                    {updatingPriorityId === c.id
                                      ? <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                      : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                  </button>
                                  <select value={c.priority || ''} onChange={(e) => handlePriorityChange(c.id, (e.target.value || null) as ComplaintPriority | null)}
                                    disabled={updatingPriorityId === c.id} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                                    <option value="">미설정</option>
                                    {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BG_CLASSES[c.status]}`}>{c.status}</span>
                                <div className="relative">
                                  <button disabled={updatingId === c.id} className="p-1 rounded hover:bg-gray-100 transition-colors">
                                    {updatingId === c.id
                                      ? <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                      : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                  </button>
                                  <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                                    disabled={updatingId === c.id} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded row */}
                          {expandedId === c.id && (
                            <tr className="bg-blue-50 border-b border-blue-100">
                              <td colSpan={10} className="px-5 py-4">
                                <div className="flex flex-wrap gap-6 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">접수번호</p>
                                    <p className="text-gray-700 font-mono">{c.complaint_number || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">민원 내용</p>
                                    <p className="text-gray-700 max-w-lg">{c.description}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">위치</p>
                                    <AdminLocationAddress complaint={c} getToken={getToken} onAddressPersisted={handleAddressPersisted} />
                                    <p className="text-gray-400 text-xs mt-0.5">{c.latitude.toFixed(6)}, {c.longitude.toFixed(6)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">신고자 정보</p>
                                    <p className="text-gray-700">{c.reporter_name}</p>
                                    <p className="text-gray-500 text-xs">{c.reporter_phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">상태 변경</p>
                                    <div className="flex gap-1.5">
                                      {STATUS_OPTIONS.map((s) => (
                                        <button key={s} onClick={() => handleStatusChange(c.id, s)}
                                          disabled={c.status === s || updatingId === c.id}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${c.status === s ? STATUS_BG_CLASSES[s] + ' cursor-default' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}>
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 items-end">
                                    <Link href={`/map?highlight=${c.id}`} target="_blank"
                                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                                      <MapPin className="w-3.5 h-3.5" />지도에서 보기
                                    </Link>
                                  </div>
                                </div>

                                {/* Admin memo */}
                                <div className="mt-4">
                                  <p className="text-xs font-semibold text-gray-500 mb-1.5">처리 메모 (담당자용)</p>
                                  <div className="flex gap-2">
                                    <textarea
                                      value={memoValues[c.id] ?? ''}
                                      onChange={(e) => setMemoValues((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                      placeholder="처리 내용, 특이사항 등을 입력해 주세요."
                                      rows={2}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                    <button onClick={() => handleSaveMemo(c.id)} disabled={savingMemoId === c.id}
                                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors">
                                      {savingMemoId === c.id
                                        ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <FileText className="w-3.5 h-3.5" />}
                                      저장
                                    </button>
                                  </div>
                                  {c.admin_memo && (
                                    <p className="text-xs text-gray-400 mt-1">마지막 저장: {c.admin_memo}</p>
                                  )}
                                </div>

                                {/* Odor Level */}
                                {c.category === '악취' && c.odor_level != null && (
                                  <div className="mt-4 flex items-center gap-3">
                                    <p className="text-xs font-semibold text-gray-500">악취 강도</p>
                                    <div className="flex gap-1">
                                      {[1,2,3,4,5].map((n) => (
                                        <span key={n} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${n <= (c.odor_level ?? 0) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300'}`}>{n}</span>
                                      ))}
                                    </div>
                                    <span className="text-xs text-orange-700 font-medium">
                                      {c.odor_level}단계 — {['미약','약함','보통','강함','매우 심각'][c.odor_level - 1]}
                                    </span>
                                  </div>
                                )}

                                {/* Photos */}
                                {((c.photo_urls && c.photo_urls.length > 0) || c.photo_url) && (
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">첨부 사진</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {(c.photo_urls && c.photo_urls.length > 0 ? c.photo_urls : [c.photo_url!]).map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                          <img src={url} alt={`민원 사진 ${i + 1}`}
                                            className="h-40 w-auto rounded-xl border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm" />
                                        </a>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">클릭하면 원본 크기로 열립니다</p>
                                  </div>
                                )}

                                {/* AI Photo Analysis */}
                                {((c.photo_urls && c.photo_urls.length > 0) || c.photo_url) && (
                                  <div className="mt-4 border border-purple-100 rounded-xl p-4 bg-purple-50 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <Zap className="w-4 h-4 text-purple-600" />
                                        <p className="text-xs font-semibold text-purple-800">AI 사진 분석</p>
                                      </div>
                                      <button
                                        onClick={() => handleAnalyzePhoto(c)}
                                        disabled={analyzingId === c.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                                      >
                                        {analyzingId === c.id
                                          ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />분석 중...</>
                                          : <><Zap className="w-3 h-3" />{c.ai_severity ? '재분석' : '사진 분석하기'}</>
                                        }
                                      </button>
                                    </div>

                                    {/* 이미 저장된 결과 또는 방금 분석한 결과 표시 */}
                                    {(analysisResults[c.id] || c.ai_severity) && (() => {
                                      const result = analysisResults[c.id];
                                      const severity = result?.severity ?? c.ai_severity ?? '';
                                      const levelColorMap: Record<string, string> = {
                                        critical: 'bg-red-100 text-red-800 border-red-200',
                                        high: 'bg-orange-100 text-orange-800 border-orange-200',
                                        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                        low: 'bg-green-100 text-green-800 border-green-200',
                                      };
                                      const levelClass = result?.level ? (levelColorMap[result.level] ?? 'bg-gray-100 text-gray-800') : 'bg-gray-100 text-gray-700';
                                      return (
                                        <div className="space-y-2">
                                          <div className={`rounded-lg p-3 border text-xs leading-relaxed font-medium ${levelClass}`}>
                                            {severity}
                                          </div>
                                          {result?.labels && result.labels.length > 0 && (
                                            <div>
                                              <p className="text-[10px] text-purple-600 font-semibold mb-1">감지 항목</p>
                                              <div className="flex flex-wrap gap-1">
                                                {result.labels.map((label, i) => (
                                                  <span key={i} className="bg-white border border-purple-200 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">{label}</span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {result?.rawLabels && result.rawLabels.length > 0 && (
                                            <details className="text-[10px] text-gray-400">
                                              <summary className="cursor-pointer hover:text-gray-600">원본 Vision AI 라벨 보기</summary>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {result.rawLabels.map((l, i) => (
                                                  <span key={i} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{l.name} {l.score}%</span>
                                                ))}
                                              </div>
                                            </details>
                                          )}
                                        </div>
                                      );
                                    })()}

                                    {/* 우선순위 자동 설정 안내 */}
                                    {analysisResults[c.id]?.autoPriority && c.status === '접수' && (
                                      <div className="flex items-center gap-1.5 bg-white border border-purple-200 rounded-lg px-3 py-2">
                                        <span className="text-xs text-purple-700 font-semibold">
                                          우선순위 자동 설정됨:
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                          analysisResults[c.id].autoPriority === '높음'
                                            ? 'bg-red-100 text-red-800 border-red-200'
                                            : analysisResults[c.id].autoPriority === '보통'
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                          {analysisResults[c.id].autoPriority === '높음' ? '🔴' : analysisResults[c.id].autoPriority === '보통' ? '🟡' : '⚪'} {analysisResults[c.id].autoPriority}
                                        </span>
                                        <span className="text-[10px] text-purple-500 ml-1">접수 민원 전체 재정렬됨</span>
                                      </div>
                                    )}

                                    {!analysisResults[c.id] && !c.ai_severity && (
                                      <p className="text-xs text-purple-500">버튼을 클릭하면 첨부 사진을 Google Vision AI로 분석해 심각도 및 우선순위를 자동 설정합니다.</p>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* 우선순위 랭킹 사이드 패널 */}
        <div className="w-full lg:w-64 lg:flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-20 lg:self-start">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">🏆 처리 우선순위</span>
            <span className="ml-auto text-xs text-gray-400 font-medium">접수 {priorityRanking.length}건</span>
          </div>
          {priorityRanking.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-400">
              접수 상태 민원이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {priorityRanking.map((c, idx) => {
                const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-400'];
                const rankEmoji = ['🥇', '🥈', '🥉'];
                const priorityColor =
                  c.priority === '높음' ? 'bg-red-100 text-red-700 border-red-200'
                  : c.priority === '보통' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : c.priority === '낮음' ? 'bg-gray-100 text-gray-500 border-gray-200'
                  : 'bg-white text-gray-400 border-gray-100';
                return (
                  <li key={c.id}
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className={`px-3 py-2.5 cursor-pointer transition-colors hover:bg-blue-50 ${expandedId === c.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {/* 순위 */}
                      <span className={`text-base w-6 text-center flex-shrink-0 ${rankColors[idx] ?? 'text-gray-300'}`}>
                        {idx < 3 ? rankEmoji[idx] : <span className="text-xs font-bold text-gray-400">{idx + 1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        {/* 접수번호 + 우선순위 배지 */}
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono text-gray-400 truncate">{c.complaint_number || '-'}</span>
                          {c.priority && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${priorityColor}`}>
                              {c.priority}
                            </span>
                          )}
                        </div>
                        {/* 카테고리 + 내용 */}
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c.category] }} />
                          <span className="text-xs text-gray-700 truncate">{c.category}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        </div>{/* end flex wrapper */}

      </main>
      <SiteFooter />
    </div>
  );
}
