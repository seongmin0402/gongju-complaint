'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Send, CheckCircle, Camera, X, ImageIcon, Copy, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { COMPLAINT_CATEGORIES, type ComplaintCategory } from '@/types';
import SiteFooter from '@/components/SiteFooter';

const ReportMap = dynamic(() => import('@/components/ReportMap'), { ssr: false });

const MAX_PHOTOS = 3;

interface Position { lat: number; lng: number; }
interface FormData {
  category: ComplaintCategory | '';
  description: string;
  reporter_name: string;
  reporter_phone: string;
  odor_level: number | null;
}

function ReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as ComplaintCategory) || '';
  const [position, setPosition] = useState<Position | null>(null);
  const [address, setAddress] = useState('');
  const [form, setForm] = useState<FormData>({ category: initialCategory, description: '', reporter_name: '', reporter_phone: '', odor_level: null });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'position' | 'privacy', string>>>({});
  const [nearbyComplaints, setNearbyComplaints] = useState<{ count: number; complaints: { category: string; status: string; address: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photoFiles.length;
    const toAdd = files.slice(0, remaining);
    for (const file of toAdd) {
      if (file.size > 10 * 1024 * 1024) { alert('사진 파일 크기는 10MB 이하여야 합니다.'); return; }
    }
    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || '사진 업로드 실패'); }
    return (await res.json()).url as string;
  }

  async function handlePositionChange(pos: Position, addr: string) {
    setPosition(pos); setAddress(addr);
    setErrors((prev) => ({ ...prev, position: undefined }));
    setNearbyComplaints(null);
    try {
      const res = await fetch(`/api/complaints/nearby?lat=${pos.lat}&lng=${pos.lng}&radius=150`);
      if (res.ok) {
        const data = await res.json();
        if (data.count > 0) setNearbyComplaints(data);
      }
    } catch { /* 네트워크 오류 무시 */ }
  }

  function validate() {
    const e: typeof errors = {};
    if (!position) e.position = '지도에서 민원 위치를 선택해 주세요.';
    if (!form.category) e.category = '카테고리를 선택해 주세요.';
    if (!form.description.trim()) e.description = '민원 내용을 입력해 주세요.';
    if (form.description.trim().length < 10) e.description = '민원 내용을 10자 이상 입력해 주세요.';
    if (!form.reporter_name.trim()) e.reporter_name = '이름을 입력해 주세요.';
    if (!form.reporter_phone.trim()) e.reporter_phone = '연락처를 입력해 주세요.';
    if (!/^[0-9\-+]{7,15}$/.test(form.reporter_phone.replace(/\s/g, '')))
      e.reporter_phone = '올바른 연락처를 입력해 주세요. (예: 010-1234-5678)';
    if (!privacyAgreed) e.privacy = '개인정보 수집·이용에 동의해 주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !position) return;
    setIsSubmitting(true);
    try {
      const photo_urls: string[] = [];
      for (const file of photoFiles) {
        photo_urls.push(await uploadPhoto(file));
      }
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          description: form.description.trim(),
          latitude: position.lat,
          longitude: position.lng,
          address,
          reporter_name: form.reporter_name.trim(),
          reporter_phone: form.reporter_phone.trim(),
          photo_urls,
          photo_url: photo_urls[0] || null,
          odor_level: form.category === '악취' ? form.odor_level : null,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || '신고 제출에 실패했습니다.'); }
      const data = await res.json();
      setSubmittedNumber(data.complaint_number);
      setSubmittedId(data.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '신고 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyNumber() {
    if (!submittedNumber) return;
    navigator.clipboard.writeText(submittedNumber).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (submittedNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">민원이 접수되었습니다</h2>
            <p className="text-gray-500 text-sm">접수번호를 저장해 두시면 나중에 처리 현황을 조회할 수 있습니다.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">접수번호</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-blue-800 tracking-wider">{submittedNumber}</span>
              <button onClick={copyNumber} className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/lookup"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              민원 현황 조회하기
            </Link>
            <Link
              href={`/map?highlight=${submittedId}`}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
            >
              <MapPin className="w-4 h-4" />
              지도에서 확인하기
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs sm:text-sm">지도로 돌아가기</span>
        </Link>
        <div className="flex-1" />
        <Link href="/info" className="text-[11px] sm:text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          환경정보
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <img src="/로고_세로.png" alt="공주시 로고" className="h-7 sm:h-8 w-auto object-contain flex-shrink-0" />
          <span className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">민원 신고</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="h-[38vh] min-h-[250px] sm:h-[44vh] lg:h-auto lg:flex-1 relative">
          <ReportMap position={position} onPositionChange={handlePositionChange} />
        </div>

        <div className="flex-1 lg:flex-none lg:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">환경 민원 신고</h1>
              <p className="text-gray-500 text-sm mt-1">쓰레기 무단투기, 악취 등의 민원을 신고해 주세요.</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                신고 위치 <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${position ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-all">{position ? address || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : '좌측 지도에서 위치를 선택해 주세요'}</span>
              </div>
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
              {nearbyComplaints && nearbyComplaints.count > 0 && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 text-xs font-semibold">
                        근처 150m 내에 처리 중인 민원 {nearbyComplaints.count}건이 있습니다
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {nearbyComplaints.complaints.slice(0, 2).map((c, i) => (
                          <li key={i} className="text-amber-700 text-xs">
                            · {c.category} ({c.status}){c.address ? ` — ${c.address}` : ''}
                          </li>
                        ))}
                      </ul>
                      <p className="text-amber-600 text-xs mt-1">중복 신고가 아닌지 확인 후 제출해 주세요.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                민원 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => { setForm((f) => ({ ...f, category: cat, odor_level: cat === '악취' ? f.odor_level : null })); setErrors((e) => ({ ...e, category: undefined })); }}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.category === cat ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}
                  >{cat}</button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Odor Level — 악취 카테고리일 때만 표시 */}
            {form.category === '악취' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
                <label className="block text-sm font-semibold text-orange-800">
                  악취 강도 <span className="text-gray-400 font-normal text-xs">(선택)</span>
                </label>
                <p className="text-xs text-orange-600">현재 느끼시는 악취의 강도를 선택해 주세요.</p>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => {
                    const labels = ['미약', '약함', '보통', '강함', '매우 심각'];
                    const isSelected = form.odor_level === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, odor_level: f.odor_level === n ? null : n }))}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                            : 'bg-white border-orange-200 text-orange-700 hover:border-orange-400'
                        }`}
                      >
                        <span className="text-base">{['🟡','🟠','🔴','🔴','☠️'][n - 1]}</span>
                        <span className="font-bold">{n}</span>
                        <span className="text-[10px] leading-tight">{labels[n - 1]}</span>
                      </button>
                    );
                  })}
                </div>
                {form.odor_level && (
                  <p className="text-xs text-orange-700 text-center font-medium">
                    선택됨: {form.odor_level}단계 — {['미약', '약함', '보통', '강함', '매우 심각'][form.odor_level - 1]}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                민원 내용 <span className="text-red-500">*</span>
              </label>
              <textarea value={form.description}
                onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setErrors((er) => ({ ...er, description: undefined })); }}
                placeholder="민원 내용을 상세히 입력해 주세요. (예: 아파트 앞 대형 쓰레기가 일주일째 방치되어 있습니다.)"
                rows={4}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
                <span className="text-xs text-gray-400">{form.description.length}자</span>
              </div>
            </div>

            {/* Reporter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름 <span className="text-red-500">*</span></label>
                <input type="text" value={form.reporter_name}
                  onChange={(e) => { setForm((f) => ({ ...f, reporter_name: e.target.value })); setErrors((er) => ({ ...er, reporter_name: undefined })); }}
                  placeholder="홍길동"
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.reporter_name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.reporter_name && <p className="text-red-500 text-xs mt-1">{errors.reporter_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">연락처 <span className="text-red-500">*</span></label>
                <input type="tel" value={form.reporter_phone}
                  onChange={(e) => { setForm((f) => ({ ...f, reporter_phone: e.target.value })); setErrors((er) => ({ ...er, reporter_phone: undefined })); }}
                  placeholder="010-0000-0000"
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.reporter_phone ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.reporter_phone && <p className="text-red-500 text-xs mt-1">{errors.reporter_phone}</p>}
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                현장 사진 <span className="text-gray-400 font-normal text-xs">(선택, 최대 {MAX_PHOTOS}장 · 장당 10MB)</span>
              </label>
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={src} alt={`첨부 사진 ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photoFiles.length < MAX_PHOTOS && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl py-5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {photoFiles.length === 0 ? '사진 추가' : `사진 추가 (${photoFiles.length}/${MAX_PHOTOS})`}
                  </span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoChange} className="hidden" />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-800">개인정보 수집·이용 안내</p>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                <li>
                  <span className="font-medium text-gray-700">수집 항목:</span> 이름, 연락처, 신고 위치·주소, 민원 내용, 첨부 사진(선택)
                </li>
                <li>
                  <span className="font-medium text-gray-700">이용 목적:</span> 민원 접수·처리, 사실 확인 및 회신, 통계·서비스 개선
                </li>
                <li>
                  <span className="font-medium text-gray-700">보유·이용 기간:</span> 관련 법령 및 내부 방침에 따른 기간 동안 보관 후 파기
                </li>
                <li>동의를 거부할 수 있으나, 필수 항목 미동의 시 민원 접수가 제한될 수 있습니다.</li>
              </ul>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(ev) => {
                    setPrivacyAgreed(ev.target.checked);
                    setErrors((er) => ({ ...er, privacy: undefined }));
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800">
                  위 개인정보 수집·이용에 동의합니다. <span className="text-red-500">(필수)</span>
                </span>
              </label>
              {errors.privacy && <p className="text-red-500 text-xs">{errors.privacy}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm">
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />제출 중...</>
              ) : (
                <><Send className="w-4 h-4" />민원 신고하기</>
              )}
            </button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 text-sm">불러오는 중...</div>}>
      <ReportPageContent />
    </Suspense>
  );
}
