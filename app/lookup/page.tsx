'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle, Clock, Inbox, AlertCircle, FileText } from 'lucide-react';
import { STATUS_BG_CLASSES, type ComplaintStatus } from '@/types';

interface LookupResult {
  id: string;
  complaint_number: string;
  category: string;
  description: string;
  address: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  admin_memo: string | null;
}

const STATUS_ICONS: Record<ComplaintStatus, React.ReactNode> = {
  '접수': <Inbox className="w-5 h-5 text-orange-500" />,
  '처리중': <Clock className="w-5 h-5 text-emerald-500" />,
  '완료': <CheckCircle className="w-5 h-5 text-blue-500" />,
};

const STATUS_STEPS: ComplaintStatus[] = ['접수', '처리중', '완료'];

export default function LookupPage() {
  const [inputNumber, setInputNumber] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const num = inputNumber.trim().toUpperCase();
    if (!num) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/complaints/lookup?number=${encodeURIComponent(num)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '조회에 실패했습니다.');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">돌아가기</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <img src="/로고_세로.png" alt="공주시 로고" className="h-8 w-auto object-contain" />
          <span className="font-bold text-gray-900 text-base">민원 조회</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">민원 진행 상태 조회</h1>
          <p className="text-gray-500 text-sm mt-1">접수번호를 입력하면 처리 현황을 확인할 수 있습니다.</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-700">접수번호</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder="예: GJ-20240402-001"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading || !inputNumber.trim()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              조회
            </button>
          </div>
          <p className="text-xs text-gray-400">민원 접수 완료 시 화면에 표시된 접수번호를 입력해 주세요.</p>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Status header */}
            <div className={`px-5 py-4 flex items-center gap-3 ${
              result.status === '완료' ? 'bg-blue-50' :
              result.status === '처리중' ? 'bg-emerald-50' : 'bg-orange-50'
            }`}>
              {STATUS_ICONS[result.status]}
              <div>
                <p className="font-bold text-gray-900">{result.complaint_number}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BG_CLASSES[result.status]}`}>
                  {result.status}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 pt-5">
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        i <= stepIndex
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {i < stepIndex ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${i <= stepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="px-5 py-4 space-y-3 border-t border-gray-100 mt-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">유형</p>
                <p className="text-sm text-gray-800">{result.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">민원 내용</p>
                <p className="text-sm text-gray-800">{result.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">위치</p>
                <p className="text-sm text-gray-800">{result.address || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">접수일</p>
                  <p className="text-sm text-gray-800">{new Date(result.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">최종 업데이트</p>
                  <p className="text-sm text-gray-800">{new Date(result.updated_at).toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
              {result.admin_memo && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">담당자 메모</p>
                  <p className="text-sm text-blue-900">{result.admin_memo}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
