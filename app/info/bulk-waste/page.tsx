'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

export default function BulkWastePage() {
  const [query, setQuery] = useState('');
  const feeTable = [
    {
      category: '가전제품류',
      items: [
        { name: '냉장고', spec: '500ℓ 이상', unit: '개', fee: '9,000원' },
        { name: '냉장고', spec: '300ℓ 이상', unit: '개', fee: '7,000원' },
        { name: '냉장고', spec: '300ℓ 미만', unit: '개', fee: '5,000원' },
        { name: '텔레비전', spec: '42인치 이상', unit: '개', fee: '6,000원' },
        { name: '텔레비전', spec: '42인치 미만', unit: '개', fee: '4,000원' },
        { name: '세탁기', spec: '모든 규격', unit: '개', fee: '5,000원' },
        { name: '에어컨', spec: '264㎡형 이상', unit: '개', fee: '9,000원' },
        { name: '에어컨', spec: '66㎡ 이상~264㎡ 미만', unit: '개', fee: '6,000원' },
        { name: '에어컨', spec: '66㎡형 미만', unit: '개', fee: '4,000원' },
        { name: '가스오븐렌지', spec: '높이 1m 이상', unit: '개', fee: '6,000원' },
        { name: '가스오븐렌지', spec: '높이 1m 미만', unit: '개', fee: '3,000원' },
        { name: '공기청정기', spec: '높이 1m 이상', unit: '개', fee: '3,000원' },
        { name: '공기청정기', spec: '높이 1m 미만', unit: '개', fee: '2,000원' },
        { name: '선풍기', spec: '산업용', unit: '개', fee: '6,000원' },
        { name: '선풍기', spec: '가정용', unit: '개', fee: '4,000원' },
        { name: '전자오락기', spec: '70㎝×75㎝ 이상', unit: '개', fee: '11,000원' },
        { name: '전자오락기', spec: '70㎝×65㎝ 이상', unit: '개', fee: '9,000원' },
        { name: '전자오락기', spec: '70㎝×65㎝ 미만', unit: '개', fee: '6,000원' },
        { name: '모니터', spec: '', unit: '개', fee: '6,000원' },
        { name: '본체(데스크탑)', spec: '', unit: '개', fee: '6,000원' },
        { name: '프린터, 팩스', spec: '', unit: '개', fee: '5,000원' },
        { name: '전기장판(옥장판)', spec: '일반 1인용', unit: '개', fee: '2,000원' },
        { name: '전기장판(옥장판)', spec: '일반 2인용', unit: '개', fee: '3,000원' },
        { name: '전기장판(옥장판)', spec: '옥(황토,온수) 1인용', unit: '개', fee: '5,000원' },
        { name: '전기장판(옥장판)', spec: '옥(황토,온수) 2인용', unit: '개', fee: '8,000원' },
        { name: '안마의자', spec: '모든 규격', unit: '개', fee: '10,000원' },
        { name: '오디오', spec: '중·소형', unit: '개', fee: '3,000원' },
        { name: '오디오', spec: '대형(100㎝ 이상)', unit: '개', fee: '5,000원' },
      ],
    },
    {
      category: '가구류',
      items: [
        { name: '장롱', spec: '120㎝장 1쪽', unit: '개', fee: '16,000원' },
        { name: '장롱', spec: '90㎝장 1쪽', unit: '개', fee: '11,000원' },
        { name: '소파', spec: '대형 6인용', unit: '개', fee: '12,000원' },
        { name: '소파', spec: '소형 3인용', unit: '개', fee: '9,000원' },
        { name: '소파', spec: '소형 1인용', unit: '개', fee: '5,000원' },
        { name: '책상', spec: '양수(대형)', unit: '개', fee: '6,000원' },
        { name: '책상', spec: '편수(소형)', unit: '개', fee: '5,000원' },
        { name: '식탁', spec: '6인용 이상', unit: '개', fee: '6,000원' },
        { name: '식탁', spec: '6인용 미만', unit: '개', fee: '5,000원' },
        { name: '대리석 식탁', spec: '6인용 이상', unit: '개', fee: '15,000원' },
        { name: '대리석 식탁', spec: '6인용 미만', unit: '개', fee: '10,000원' },
        { name: '피아노', spec: '그랜드', unit: '개', fee: '16,000원' },
        { name: '피아노', spec: '어프라이트', unit: '개', fee: '11,000원' },
        { name: '침대 매트리스', spec: '3인용', unit: '개', fee: '11,000원' },
        { name: '침대 매트리스', spec: '2인용', unit: '개', fee: '9,000원' },
        { name: '침대 매트리스', spec: '1인용', unit: '개', fee: '6,000원' },
        { name: '침대 목재류(프레임)', spec: '모든 규격', unit: '개', fee: '4,000원' },
        { name: '돌 침대', spec: '모든 규격', unit: '개', fee: '30,000원' },
        { name: '진열·장식장·책장·찬장·신발장', spec: '120㎝×180㎝ 이상', unit: '개', fee: '16,000원' },
        { name: '진열·장식장·책장·찬장·신발장', spec: '60㎝×80㎝ 이상', unit: '개', fee: '11,000원' },
        { name: '진열·장식장·책장·찬장·신발장', spec: '60㎝×80㎝ 미만', unit: '개', fee: '9,000원' },
        { name: '서랍장', spec: '5단 이상', unit: '개', fee: '5,000원' },
        { name: '서랍장', spec: '5단 미만', unit: '개', fee: '3,000원' },
        { name: '화장대 (거울 부착)', spec: '', unit: '개', fee: '6,000원' },
        { name: '화장대 (거울 미부착)', spec: '', unit: '개', fee: '4,000원' },
        { name: '의자 (팔걸이 있는 것)', spec: '', unit: '개', fee: '4,000원' },
        { name: '의자 (팔걸이 없는 것)', spec: '', unit: '개', fee: '3,000원' },
        { name: '간판', spec: '200㎝×100㎝ 이상', unit: '개', fee: '16,000원' },
        { name: '간판', spec: '150㎝×70㎝ 이상', unit: '개', fee: '11,000원' },
        { name: '간판', spec: '100㎝×50㎝ 이상', unit: '개', fee: '9,000원' },
        { name: '간판', spec: '100㎝×50㎝ 미만', unit: '개', fee: '6,000원' },
        { name: '평상', spec: '대(제사상)', unit: '개', fee: '4,000원' },
        { name: '평상', spec: '소(일반상)', unit: '개', fee: '2,000원' },
      ],
    },
    {
      category: '생활용품류',
      items: [
        { name: '수족관(어항)', spec: '120㎝×60㎝ 이상', unit: '개', fee: '6,000원' },
        { name: '수족관(어항)', spec: '120㎝×60㎝ 미만', unit: '개', fee: '4,000원' },
        { name: '거울·액자', spec: '100㎝×150㎝ 이상', unit: '개', fee: '6,000원' },
        { name: '거울·액자', spec: '170㎝×100㎝ 이상', unit: '개', fee: '4,000원' },
        { name: '거울·액자', spec: '70㎝×100㎝ 미만', unit: '개', fee: '3,000원' },
        { name: '이불(담요)', spec: '장당', unit: '개', fee: '2,000원' },
        { name: '러닝머신', spec: '모든 규격', unit: '개', fee: '8,000원' },
        { name: '욕조', spec: '모든 규격', unit: '개', fee: '5,000원' },
        { name: '캐비닛', spec: '850㎜×1,790㎜ 이상', unit: '개', fee: '6,000원' },
        { name: '캐비닛', spec: '850㎜×1,790㎜ 미만', unit: '개', fee: '5,000원' },
        { name: '폐목재', spec: '대(100㎝×130㎝)', unit: '개', fee: '4,000원' },
        { name: '폐목재', spec: '소(60㎝×100㎝)', unit: '개', fee: '3,000원' },
        { name: '변기', spec: '동양식', unit: '개', fee: '5,000원' },
        { name: '변기', spec: '양변기(서양식)', unit: '개', fee: '10,000원' },
        { name: '문짝', spec: '대(현관문)', unit: '개', fee: '5,000원' },
        { name: '문짝', spec: '소(창문 등)', unit: '개', fee: '2,000원' },
        { name: '깨진 유리', spec: '마대 60ℓ~100ℓ 미만', unit: '개', fee: '4,000원' },
        { name: '깨진 유리', spec: '마대 60ℓ 미만', unit: '개', fee: '3,000원' },
        { name: '책상유리', spec: '모든 규격', unit: '개', fee: '2,000원' },
        { name: '자전거', spec: '성인용', unit: '개', fee: '4,000원' },
        { name: '자전거', spec: '유아용', unit: '개', fee: '3,000원' },
        { name: '싱크대', spec: '개수대', unit: '개', fee: '3,000원' },
        { name: '싱크대', spec: '찬장', unit: '개', fee: '3,000원' },
        { name: '싱크대', spec: '가스레인지대', unit: '개', fee: '2,000원' },
        { name: '고무통', spec: '90㎝×100㎝ 이상', unit: '개', fee: '5,000원' },
        { name: '고무통', spec: '90㎝×100㎝ 미만', unit: '개', fee: '4,000원' },
        { name: '고무통', spec: '70㎝×80㎝ 미만', unit: '개', fee: '3,000원' },
        { name: '폐소화기', spec: '약제 3.3㎏ 이하', unit: '개', fee: '2,000원' },
        { name: '폐소화기', spec: '약제 3.4~10㎏ 미만', unit: '개', fee: '3,000원' },
        { name: '폐소화기', spec: '약제 10㎏ 이상', unit: '개', fee: '5,000원' },
      ],
    },
    {
      category: '기타',
      items: [
        { name: '마대', spec: '40㎏', unit: '개', fee: '4,000원' },
        { name: '자동상차용기', spec: '660ℓ 이상', unit: '개', fee: '8,000원' },
        { name: '음식물쓰레기통', spec: '120ℓ', unit: '개', fee: '2,000원' },
        { name: '특수규격봉투(불연성 폐기물마대)', spec: '', unit: '개', fee: '1,500원' },
        { name: '재봉틀·앰프·오디오케이스·카세트·문갑·보일러·세면대·카페트 등', spec: '유사품목', unit: '개', fee: '4,000원' },
        { name: '병풍·블라인드·정수기·항아리·돗자리·쌀통·탈수기 등', spec: '유사품목', unit: '개', fee: '3,000원' },
        { name: '가습기·건조대·소형 변압기·옷걸이·아이스박스·벽시계·여행용 가방·유모차·TV받침·스피커·비디오 플레이어·조명기구·전화기·다리미·인형·장난감류·휠체어·책꽂이·난로 등', spec: '유사품목', unit: '개', fee: '2,000원' },
      ],
    },
  ];

  const allItems = useMemo(
    () => feeTable.flatMap((g) => g.items.map((item) => ({ ...item, category: g.category }))),
    [feeTable],
  );

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.spec.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower),
    );
  }, [query, allItems]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">대형생활폐기물 배출안내</h1>
        <p className="text-sm text-gray-500 mt-1">품목별 수수료 및 배출 방법</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">📌 배출 요령</h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p>지역별 배출장소에 배출 시 순차 수거하며, 빠른 수거를 원하시면 배출 후 <strong>주소와 배출품목을 문자</strong>로 신청하세요.</p>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-blue-50 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-gray-500">시내 지역</p>
              <a href="tel:010-9461-1176" className="font-bold text-blue-700 text-base">010-9461-1176</a>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-gray-500">읍면 지역</p>
              <p className="font-bold text-gray-700 text-sm">해당 주민센터로 연락</p>
            </div>
          </div>
          <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2">⚠️ 납부필증 분실사고가 발생할 수 있습니다. 배출 시 납부필증이 부착된 사진을 찍어 수거 전까지 보관해 주세요.</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🆓 무상수거: 대형 가전제품</h2>
        <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
          <span className="text-3xl">📞</span>
          <div>
            <p className="text-sm text-gray-600">한국전자사업환경협회 (ARS)</p>
            <a href="tel:1599-0903" className="font-bold text-green-700 text-xl">☎ 1599-0903</a>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-800">💰 품목별 처리 수수료</h2>
        <p className="text-xs text-gray-500">표에 없는 품목은 마대에 담고 스티커 부착 배출 또는 특수규격봉투에 담아 배출 가능</p>

        {/* 검색창 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="품목명 검색 (예: 냉장고, 소파…)"
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 검색 결과 */}
        {isSearching ? (
          <div>
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">검색 결과가 없습니다.</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-gray-400 mb-2">검색 결과 {searchResults.length}건</p>
                {searchResults.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="text-sm flex-1 min-w-0">
                      <span className="text-gray-500 text-xs mr-1.5 bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
                      <span className="text-gray-800">{item.name}</span>
                      {item.spec && <span className="text-gray-400 text-xs ml-1">({item.spec})</span>}
                    </div>
                    <span className="font-semibold text-blue-700 text-sm flex-shrink-0">{item.fee}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {feeTable.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-bold text-gray-700 mb-2 bg-gray-100 rounded-lg px-3 py-1.5">{group.category}</h3>
                <div className="space-y-1">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                      <div className="text-sm flex-1 min-w-0">
                        <span className="text-gray-800">{item.name}</span>
                        {item.spec && <span className="text-gray-400 text-xs ml-1">({item.spec})</span>}
                      </div>
                      <span className="font-semibold text-blue-700 text-sm flex-shrink-0">{item.fee}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <a href="https://www.gongju.go.kr/kr/sub06_08_06_05.do" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
        공주시청 공식 페이지 바로가기 →
      </a>
    </div>
  );
}
