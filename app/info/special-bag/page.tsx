'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

const STORES = [
  { no: 1, region: '유구읍', name: '하나로마트 유구농협', address: '충남 공주시 유구읍 중앙2길 92-1', phone: '041-841-2503' },
  { no: 2, region: '유구읍', name: '아리랑도매마트', address: '충남 공주시 유구읍 중앙2길 76', phone: '041-841-8891' },
  { no: 3, region: '유구읍', name: '장터할인마트', address: '충남 공주시 유구읍 중앙1길 84', phone: '041-841-8540' },
  { no: 4, region: '이인면', name: '하나로마트 이인농협본점', address: '충남 공주시 이인면 검바위로 215', phone: '041-857-6092' },
  { no: 5, region: '탄천면', name: '탄천농협 경제사업장', address: '충남 공주시 탄천면 통산로 197', phone: '041-853-5150' },
  { no: 6, region: '의당면', name: '하모니마트 의당점', address: '충남 공주시 의당면 연수원길 115-2', phone: '041-881-9037' },
  { no: 7, region: '의당면', name: '청룡슈퍼', address: '충남 공주시 의당면 돌모루1길 1', phone: '041-852-2727' },
  { no: 8, region: '정안면', name: '하나로마트 정안농협본점', address: '충남 공주시 정안면 정안중앙길 172', phone: '041-858-6034' },
  { no: 9, region: '우성면', name: '하나로마트 우성농협본점', address: '충남 공주시 우성면 차동로 473', phone: '041-857-6009' },
  { no: 10, region: '사곡면', name: '하나로마트 사곡농협본점', address: '충남 공주시 사곡면 호계장터1길 1', phone: '041-841-0624' },
  { no: 11, region: '사곡면', name: '충남슈퍼', address: '충남 공주시 사곡면 마곡사로 112', phone: '041-841-7356' },
  { no: 12, region: '신풍면', name: '신풍농협 경제사업장', address: '충남 공주시 신풍면 충의로 2670', phone: '041-841-7863' },
  { no: 13, region: '신풍면', name: '신풍할인마트', address: '충남 공주시 신풍면 신풍길 58', phone: '041-841-4966' },
  { no: 14, region: '신풍면', name: '신풍슈퍼', address: '충남 공주시 신풍면 신풍길 72-1', phone: '041-841-3679' },
  { no: 15, region: '웅진동', name: '원마트', address: '충남 공주시 백제문화로 2129', phone: '041-856-6413' },
  { no: 16, region: '웅진동', name: '공주마트', address: '충남 공주시 산성시장5길 50', phone: '041-854-7741' },
  { no: 17, region: '금학동', name: '하모니마트 공주금학점', address: '충남 공주시 우금티로 513', phone: '041-881-0031' },
  { no: 18, region: '옥룡동', name: '문화슈퍼', address: '충남 공주시 우금티로 709-12', phone: '041-856-5636' },
  { no: 19, region: '신관동', name: '대영종합상사', address: '충남 공주시 신관로 67', phone: '041-857-2003' },
  { no: 20, region: '월송동', name: '우리마트', address: '충남 공주시 신금1길 79', phone: '041-855-0111' },
  { no: 21, region: '월송동', name: '하트할인마트 우남점', address: '충남 공주시 한적2길 51-17', phone: '041-852-6555' },
];

const REGIONS = [...new Set(STORES.map((s) => s.region))];

export default function SpecialBagPage() {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    return STORES.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.address.toLowerCase().includes(lower) ||
        s.region.toLowerCase().includes(lower) ||
        s.phone.includes(q),
    );
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">특수규격봉투 판매소</h1>
        <p className="text-sm text-gray-500 mt-1">총 21개소 (2025. 04. 03. 기준)</p>
      </div>

      <section className="bg-teal-50 rounded-2xl p-4 text-sm text-teal-800 space-y-2">
        <p className="font-semibold">🛍️ 특수규격봉투란?</p>
        <ul className="space-y-1 text-xs">
          <li className="flex gap-2"><span>•</span>음식물 전용봉투 (납부필증 방식)</li>
          <li className="flex gap-2"><span>•</span>영농 폐기물 봉투 등 일반 종량제 봉투로 처리되지 않는 품목 전용</li>
          <li className="flex gap-2"><span>•</span>불연성 폐기물 마대 (대형폐기물 처리 시 1,500원)</li>
        </ul>
      </section>

      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상호명·주소·지역 검색 (예: 신풍, 하나로…)"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {isSearching ? (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">검색 결과가 없습니다.</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-1">검색 결과 {searchResults.length}개소</p>
              <div className="space-y-2">
                {searchResults.map((store) => (
                  <div key={store.no} className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{store.region}</span>
                        <p className="text-sm font-medium text-gray-800 leading-tight">{store.name}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{store.address}</p>
                    </div>
                    <a href={`tel:${store.phone}`} className="text-blue-600 text-xs hover:underline flex-shrink-0 font-medium">{store.phone}</a>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        REGIONS.map((region) => {
          const stores = STORES.filter((s) => s.region === region);
          return (
            <section key={region} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">{region}</span>
                <span className="text-gray-400 text-xs font-normal">{stores.length}개소</span>
              </h2>
              <div className="space-y-2">
                {stores.map((store) => (
                  <div key={store.no} className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-300 font-mono">{String(store.no).padStart(2,'0')}</span>
                        <p className="text-sm font-medium text-gray-800 leading-tight">{store.name}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{store.address}</p>
                    </div>
                    <a href={`tel:${store.phone}`} className="text-blue-600 text-xs hover:underline flex-shrink-0 font-medium">{store.phone}</a>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}

      <a href="https://www.gongju.go.kr/kr/sub06_08_06_08.do" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
        공주시청 공식 페이지 바로가기 →
      </a>
    </div>
  );
}
