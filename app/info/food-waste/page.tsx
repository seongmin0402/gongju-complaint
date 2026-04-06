export default function FoodWastePage() {
  const priceTable = [
    { type: '전용봉투 3리터', price: '70원' },
    { type: '전용봉투 5리터', price: '110원' },
    { type: '납부필증 25리터', price: '850원' },
    { type: '납부필증 120리터', price: '4,070원' },
  ];

  const scheduleTable = [
    { category: '단독주택', region: '강남지역', time: '월·수·금요일 19:00~23:00' },
    { category: '단독주택', region: '강북지역', time: '화·목·일요일 19:00~23:00' },
    { category: '일반음식점 (영업장 200㎡ 미만)', region: '전지역', time: '월~금, 일요일 19:00~23:00 (토요일 제외)' },
  ];

  const outerAreas = [
    '신기동', '소학동', '월송동', '금흥동', '쌍신동', '봉정동', '검상동 일부',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">음식물쓰레기 배출안내</h1>
        <p className="text-sm text-gray-500 mt-1">전 지역 토요일 배출 금지</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">📌 배출 방법</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>
            <div>
              <p className="font-medium">동 지역</p>
              <p className="text-gray-600 mt-0.5">전용봉투에 담아 전용수거용기에 넣어 배출 (훼손 방지를 위해 이중처리)</p>
              <p className="text-gray-500 text-xs mt-0.5">※ 전용수거용기: 자원순환과 사무실 또는 환경쉼터(공주시 창벽로7) 무상 배부</p>
            </div>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>
            <div>
              <p className="font-medium">읍·면 지역 및 일부 외곽</p>
              <p className="text-gray-600 mt-0.5">쓰레기 종량제 봉투에 배출</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {outerAreas.map((a) => (
                  <span key={a} className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">{a}</span>
                ))}
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">✅ 배출 준수 사항</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>음식물류폐기물의 <strong>물기를 최대한 제거</strong></li>
          <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span><strong>배출 시간 준수</strong> (낮 시간 배출 금지)</li>
          <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>집 앞 또는 건물 입구의 <strong>잘 보이는 곳에 놓기</strong></li>
          <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>빈 용기는 꼭 집안으로 가져가서 <strong>깨끗이 관리</strong></li>
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">⏰ 배출 시간</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left p-2 rounded-tl-lg font-medium">구분</th>
                <th className="text-left p-2 font-medium">지역</th>
                <th className="text-left p-2 rounded-tr-lg font-medium">배출일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scheduleTable.map((row, i) => (
                <tr key={i} className="text-gray-700">
                  <td className="p-2 text-xs">{row.category}</td>
                  <td className="p-2 text-xs">{row.region}</td>
                  <td className="p-2 text-xs">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-red-500 font-medium">⚠️ 전 지역 토요일 배출 금지</p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">💰 납부필증 가격</h2>
        <div className="grid grid-cols-2 gap-2">
          {priceTable.map((p) => (
            <div key={p.type} className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-600">{p.type}</p>
              <p className="font-bold text-green-700 text-base mt-0.5">{p.price}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">※ 음식물류폐기물 납부필증은 종량제봉투 판매소에서 판매</p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">📞 문의</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">수거문의</span>
            <a href="tel:041-840-8584" className="text-blue-600 hover:underline font-medium">041-840-8584</a>
            <span className="text-gray-300">/</span>
            <a href="tel:010-5353-4399" className="text-blue-600 hover:underline font-medium">010-5353-4399</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">자원순환과</span>
            <a href="tel:041-840-8605" className="text-blue-600 hover:underline font-medium">041-840-8605</a>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🏢 음식물류폐기물 다량배출사업장</h2>
        <div className="text-sm text-gray-700 space-y-3">
          <div>
            <p className="font-medium text-gray-800 mb-1">대상</p>
            <ul className="space-y-1">
              <li className="flex gap-2"><span className="text-gray-400">•</span>집단급식소 (1일 평균 연 급식인원 100인 이상)</li>
              <li className="flex gap-2"><span className="text-gray-400">•</span>휴게음식점 및 일반음식점 (영업장 면적 200㎡ 이상)</li>
              <li className="flex gap-2"><span className="text-gray-400">•</span>대규모 점포, 관광숙박업, 농수산물 도매시장, 공판장</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">처리 방법</p>
            <ul className="space-y-1">
              <li className="flex gap-2"><span className="text-gray-400">•</span>감량처리: 가열, 건조, 발효하여 수분함량 감소</li>
              <li className="flex gap-2"><span className="text-gray-400">•</span>처리업체에 위탁 처리</li>
            </ul>
          </div>
        </div>
      </section>

      <a href="https://www.gongju.go.kr/kr/sub06_08_06_02.do" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
        공주시청 공식 페이지 바로가기 →
      </a>
    </div>
  );
}
