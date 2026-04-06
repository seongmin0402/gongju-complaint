'use client';

import { useRef, useState } from 'react';
import { Camera, Upload, X, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface WasteRule {
  category: string;
  icon: string;
  title: string;
  instructions: string[];
  caution?: string;
  fee?: string;
  tip?: string;
}

interface AnalysisResult {
  rules: WasteRule[];
  detectedLabels: { name: string; score: number }[];
  matched: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  '재활용': 'border-green-200 bg-green-50',
  '음식물': 'border-yellow-200 bg-yellow-50',
  '대형폐기물': 'border-red-200 bg-red-50',
  '폐건전지': 'border-purple-200 bg-purple-50',
  '폐의약품': 'border-pink-200 bg-pink-50',
  '소형 가전': 'border-blue-200 bg-blue-50',
};

function getCategoryColor(category: string): string {
  for (const [key, cls] of Object.entries(CATEGORY_COLORS)) {
    if (category.includes(key)) return cls;
  }
  return 'border-gray-200 bg-gray-50';
}

function getCategoryBadgeColor(category: string): string {
  if (category.includes('재활용')) return 'bg-green-100 text-green-800';
  if (category.includes('음식물')) return 'bg-yellow-100 text-yellow-800';
  if (category.includes('대형폐기물')) return 'bg-red-100 text-red-800';
  if (category.includes('소형 가전')) return 'bg-blue-100 text-blue-800';
  if (category.includes('폐건전지') || category.includes('형광등')) return 'bg-purple-100 text-purple-800';
  if (category.includes('폐의약품')) return 'bg-pink-100 text-pink-800';
  return 'bg-gray-100 text-gray-700';
}

export default function AiGuidePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      // base64 부분만 추출 (data:image/jpeg;base64, 이후)
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
      setResult(null);
      setStatus('idle');
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!imageBase64) return;
    setStatus('analyzing');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waste-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석에 실패했습니다.');
      setResult(data);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
      setStatus('error');
    }
  }

  function handleReset() {
    setPreview(null);
    setImageBase64(null);
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-500" />
          <h1 className="text-xl font-bold text-gray-900">AI 분리배출 안내</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          쓰레기 사진을 찍으면 AI가 배출 방법을 바로 알려드립니다.
        </p>
      </div>

      {/* 사진 업로드 영역 */}
      {!preview ? (
        <div className="space-y-3">
          {/* 카메라 */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 py-5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-2xl transition-colors shadow-sm"
          >
            <Camera className="w-5 h-5" />
            카메라로 사진 찍기
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* 파일 업로드 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-violet-400 hover:bg-violet-50 text-gray-600 hover:text-violet-700 font-medium text-sm rounded-2xl transition-colors"
          >
            <Upload className="w-5 h-5" />
            갤러리에서 사진 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* 안내 */}
          <div className="bg-violet-50 rounded-xl p-4 text-xs text-violet-800 space-y-1.5">
            <p className="font-semibold text-sm">📸 이런 것들을 찍어보세요!</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {[
                ['🍶', '페트병·플라스틱'],
                ['📦', '택배 상자·스티로폼'],
                ['🥫', '캔·고철류'],
                ['📺', '가전제품·가구'],
                ['👕', '의류·신발·가방'],
                ['🍎', '음식물 쓰레기'],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1.5">
                  <span>{icon}</span>
                  <span className="text-xs text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 미리보기 */}
          <div className="relative">
            <img
              src={preview}
              alt="분석할 사진"
              className="w-full rounded-2xl object-cover max-h-72 border border-gray-200 shadow-sm"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 분석 버튼 */}
          {status !== 'done' && (
            <button
              onClick={handleAnalyze}
              disabled={status === 'analyzing'}
              className="w-full flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-2xl transition-colors shadow-sm"
            >
              {status === 'analyzing' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI 분석 중…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  배출 방법 분석하기
                </>
              )}
            </button>
          )}

          {/* 에러 */}
          {status === 'error' && errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 분석 결과 */}
          {status === 'done' && result && (
            <div className="space-y-4">
              {/* 인식된 항목 */}
              {result.detectedLabels.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">AI가 인식한 항목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedLabels.map((l) => (
                      <span key={l.name} className="bg-white border border-gray-200 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">
                        {l.name} <span className="text-gray-400">{l.score}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 배출 안내 카드 */}
              {result.matched ? (
                <>
                  <p className="text-sm font-bold text-gray-800">
                    ✅ 배출 방법 안내 ({result.rules.length}가지)
                  </p>
                  {result.rules.map((rule, i) => (
                    <div key={i} className={`rounded-2xl border p-4 space-y-3 ${getCategoryColor(rule.category)}`}>
                      {/* 헤더 */}
                      <div className="flex items-start gap-3">
                        <span className="text-3xl flex-shrink-0">{rule.icon}</span>
                        <div className="flex-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeColor(rule.category)}`}>
                            {rule.category}
                          </span>
                          <p className="text-sm font-bold text-gray-900 mt-1">{rule.title}</p>
                        </div>
                      </div>

                      {/* 배출 방법 */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-600">📋 배출 방법</p>
                        <ol className="space-y-1">
                          {rule.instructions.map((inst, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white border border-gray-300 text-[9px] font-bold flex items-center justify-center mt-0.5">
                                {j + 1}
                              </span>
                              {inst}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* 수수료 */}
                      {rule.fee && (
                        <div className="bg-white/70 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-red-700">💰 수수료</p>
                          <p className="text-xs text-red-600 mt-0.5">{rule.fee}</p>
                        </div>
                      )}

                      {/* 주의사항 */}
                      {rule.caution && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-orange-800">⚠️ 주의사항</p>
                          <p className="text-xs text-orange-700 mt-0.5">{rule.caution}</p>
                        </div>
                      )}

                      {/* 꿀팁 */}
                      {rule.tip && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-blue-800">💡 꿀팁</p>
                          <p className="text-xs text-blue-700 mt-0.5">{rule.tip}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center space-y-2">
                  <p className="text-2xl">🤔</p>
                  <p className="text-sm font-semibold text-yellow-800">배출 방법을 특정하기 어렵습니다</p>
                  <p className="text-xs text-yellow-700">
                    사진에서 쓰레기 품목을 명확하게 인식하지 못했습니다.
                    물건이 잘 보이도록 가까이서 다시 찍어보세요.
                  </p>
                  <p className="text-xs text-yellow-600">
                    궁금한 품목은 공주시 청소행정과 ☎ 041-840-8751 로 문의하세요.
                  </p>
                </div>
              )}

              {/* 다시 찍기 */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                다른 사진 분석하기
              </button>

              {/* 상세 정보 링크 */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center space-y-1">
                <p>더 자세한 배출 방법은 공주시청 홈페이지에서 확인하세요.</p>
                <a
                  href="https://www.gongju.go.kr/kr/sub06_08_06_01.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-medium"
                >
                  공주시 분리배출 안내 →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 에러 (이미지 선택 전) */}
      {status === 'error' && !preview && errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 면책 안내 */}
      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        AI 분석 결과는 참고용입니다. 정확한 배출 방법은 공주시청(☎ 041-840-8751)에 문의하세요.
      </p>
    </div>
  );
}
