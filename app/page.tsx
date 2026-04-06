import Link from 'next/link';
import { Search } from 'lucide-react';

const REPORT_CATEGORIES = [
  {
    href: '/report?category=쓰레기 무단투기',
    icon: '🗑️',
    label: '쓰레기 무단투기',
    desc: '불법 쓰레기 투기 신고',
    color: 'bg-red-50 border-red-200 hover:bg-red-100',
    iconBg: 'bg-red-100',
    badge: '신고',
    badgeColor: 'bg-red-500',
  },
  {
    href: '/report?category=악취',
    icon: '💨',
    label: '악취',
    desc: '악취 발생 지역 신고',
    color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    iconBg: 'bg-amber-100',
    badge: '신고',
    badgeColor: 'bg-amber-500',
  },
  {
    href: '/report?category=불법 투기',
    icon: '⚠️',
    label: '불법 투기',
    desc: '폐기물 불법 투기 신고',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    iconBg: 'bg-orange-100',
    badge: '신고',
    badgeColor: 'bg-orange-500',
  },
  {
    href: '/report?category=기타',
    icon: '📋',
    label: '기타 민원',
    desc: '기타 환경 민원 신고',
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    iconBg: 'bg-gray-100',
    badge: '신고',
    badgeColor: 'bg-gray-500',
  },
];

const INFO_CATEGORIES = [
  {
    href: '/info/ai-guide',
    icon: '🤖',
    label: 'AI 배출방법 안내',
    desc: '사진 찍으면 AI가 알려드려요',
    color: 'bg-violet-50 border-violet-300 hover:bg-violet-100',
    iconBg: 'bg-violet-100',
    badge: 'NEW',
  },
  {
    href: '/info/recycling',
    icon: '♻️',
    label: '재활용분리배출',
    desc: '올바른 재활용품 분리 방법',
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconBg: 'bg-green-100',
  },
  {
    href: '/info/food-waste',
    icon: '🍜',
    label: '음식물쓰레기',
    desc: '음식물쓰레기 배출 안내',
    color: 'bg-lime-50 border-lime-200 hover:bg-lime-100',
    iconBg: 'bg-lime-100',
  },
  {
    href: '/info/trash',
    icon: '🗑️',
    label: '생활쓰레기',
    desc: '종량제봉투 배출 방법',
    color: 'bg-sky-50 border-sky-200 hover:bg-sky-100',
    iconBg: 'bg-sky-100',
  },
  {
    href: '/info/bulk-waste',
    icon: '🛋️',
    label: '대형생활폐기물',
    desc: '가구·가전 배출 신청',
    color: 'bg-violet-50 border-violet-200 hover:bg-violet-100',
    iconBg: 'bg-violet-100',
  },
  {
    href: '/info/bag-store',
    icon: '🏪',
    label: '종량제봉투판매소',
    desc: '가까운 판매소 안내',
    color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    iconBg: 'bg-pink-100',
  },
  {
    href: '/info/special-bag',
    icon: '🛍️',
    label: '특수규격봉투',
    desc: '음식물·영농 전용봉투',
    color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
    iconBg: 'bg-teal-100',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <img src="/로고_세로.png" alt="공주시 로고" className="h-9 w-auto object-contain" />
          <div>
            <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">공주시 환경 민원 신고</h1>
            <p className="text-xs text-gray-400 leading-tight">쓰레기·악취·불법투기 신고 및 환경정보</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/lookup" className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">민원 조회</span>
          </Link>
          <Link href="/map" className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            🗺️ <span className="hidden sm:inline">현황 지도</span><span className="sm:hidden">지도</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8">

        {/* 민원 신고 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📢</span>
            <h2 className="text-base font-bold text-gray-900">민원 신고</h2>
            <span className="text-xs text-gray-400 font-normal">카테고리를 선택해 신고해 주세요</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {REPORT_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${cat.color}`}
              >
                <span className={`w-10 h-10 ${cat.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                  {cat.icon}
                </span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                </div>
                <span className={`absolute top-3 right-3 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
              </Link>
            ))}
          </div>
          {/* 직접 신고 버튼 */}
          <Link href="/report" className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
            📋 직접 선택해서 신고하기
          </Link>
        </section>

        {/* 환경정보 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌿</span>
            <h2 className="text-base font-bold text-gray-900">환경정보</h2>
            <span className="text-xs text-gray-400 font-normal">공주시 환경 관련 안내</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INFO_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all active:scale-95 relative ${cat.color}`}
              >
                {'badge' in cat && cat.badge && (
                  <span className="absolute top-2 right-2 bg-violet-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {cat.badge as string}
                  </span>
                )}
                <span className={`w-10 h-10 ${cat.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                  {cat.icon}
                </span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 바로가기 */}
        <section className="grid grid-cols-2 gap-3 pb-4">
          <Link href="/map" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">민원 현황 지도</p>
              <p className="text-xs text-gray-400">실시간 지도 보기</p>
            </div>
          </Link>
          <Link href="/lookup" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">민원 조회</p>
              <p className="text-xs text-gray-400">접수번호로 조회</p>
            </div>
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200/40 bg-white/25 text-[10px] sm:text-[11px] text-gray-400/90 px-4 py-2.5 leading-snug text-center">
        지도·지오코딩:{' '}
        <a href="https://www.ncloud.com/product/applicationService/maps" target="_blank" rel="noopener noreferrer" className="text-blue-500/75 hover:underline">
          네이버 클라우드 플랫폼 Maps API
        </a>
        . 행정경계 보조:{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-500/75 hover:underline">
          © OpenStreetMap 기여자
        </a>
        , ODbL.
      </footer>
    </div>
  );
}
