import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InfoTabNav from '@/components/InfoTabNav';

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">지도로 돌아가기</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <img src="/로고_세로.png" alt="공주시 로고" className="h-8 w-auto object-contain" />
          <span className="font-bold text-gray-900 text-base">환경정보</span>
        </div>
      </header>

      {/* 탭 네비게이션 (클라이언트 컴포넌트) */}
      <InfoTabNav />

      {/* 콘텐츠 */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* 출처 */}
      <footer className="border-t border-gray-200/40 bg-white/25 text-[10px] sm:text-[11px] text-gray-400/90 px-4 py-2.5 leading-snug text-center">
        본 정보는{' '}
        <a href="https://www.gongju.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-500/75 hover:underline">
          공주시청 공식 홈페이지
        </a>
        의 내용을 기반으로 제공됩니다. 최신 정보는 공주시청 홈페이지를 확인해 주세요.
      </footer>
    </div>
  );
}
