export default function TrashPage() {
  const prices = [
    { size: '5리터', price: '90원' },
    { size: '10리터', price: '170원' },
    { size: '20리터', price: '320원' },
    { size: '30리터', price: '480원' },
    { size: '50리터', price: '790원' },
    { size: '100리터', price: '1,170원' },
  ];

  const processors = [
    { category: '나무 처리업체', name: '지씨테크', phone: '041-881-3111' },
    { category: '건설폐기물 처리업체', name: 'WIK환경', phone: '041-856-3001' },
    { category: '건설폐기물 처리업체', name: '신화환경개발', phone: '041-853-6969' },
    { category: '건설폐기물 처리업체', name: '현일산업개발', phone: '041-841-5300' },
    { category: '석면 처리업체', name: '정인이앤씨', phone: '041-960-8383' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">생활쓰레기 배출안내</h1>
        <div className="mt-2 bg-blue-50 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
          <p className="font-semibold">📢 환경미화원 주간근무 전환 안내</p>
          <p className="mt-0.5">환경미화원의 안전 확보 및 삶의 질 향상을 위해 동 지역의 야간근무를 주간근무로 전환하였습니다. (2020. 9. 1.부터 시행)</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">📌 배출 준수 사항</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="text-green-500 flex-shrink-0 mt-0.5">•</span>내 집 앞·내 건물 앞 또는 거점 장소에 배출</li>
          <li className="flex gap-2"><span className="text-orange-500 flex-shrink-0 mt-0.5">•</span><strong>배출 시간: 19:00~23:00</strong> (낮 시간 배출 금지)</li>
          <li className="flex gap-2"><span className="text-orange-500 flex-shrink-0 mt-0.5">•</span><strong>배출 요일: 일요일~금요일</strong> (토요일 배출 금지)</li>
          <li className="flex gap-2"><span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>읍면 지역은 요일별로 폐기물 수거 성상이 다르니 읍면별 문의</li>
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🗑️ 종류별 배출 방법</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="font-medium">🔥 가연성 쓰레기 (소각용)</p>
            <p className="text-gray-600">일반 쓰레기 <strong>종량제봉투</strong>에 담아 배출</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="font-medium">⛏️ 불연성 쓰레기 (매립용)</p>
            <ul className="space-y-0.5 text-gray-600">
              <li>① 일반 마대에 담아 <strong>대형폐기물 납부필증(스티커) 부착</strong></li>
              <li>② 불연성 폐기물 전용 마대(마트 구입)에 담아 배출</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="font-medium">♻️ 재활용 가능 폐기물</p>
            <p className="text-gray-600">재활용품 전용봉투(읍·면·동 주민센터 수령) 또는 투명한 비닐봉투에 배출</p>
            <p className="text-gray-500 text-xs">(교동) 재활용센터에서 세제, 상품권 등으로 교환 가능</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="font-medium">🛋️ 대형폐기물 (가구·폐가전 등)</p>
            <ul className="space-y-0.5 text-gray-600">
              <li>• 가전제품: <strong>무상수거 서비스 ☎ 1599-0903</strong> 이용 또는 스티커 부착 배출</li>
              <li>• 소형 가전제품: 대형폐기물 스티커 부착 후 배출</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="font-medium">🏗️ 건설폐기물</p>
            <p className="text-gray-600">공사업체 또는 처리업체에서 위탁 처리</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="font-medium">⚠️ 지정폐기물 (석면·폐슬레이트 등)</p>
            <p className="text-gray-600">처리업체 위탁</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">💰 종량제봉투 판매가격</h2>
        <div className="grid grid-cols-3 gap-2">
          {prices.map((p) => (
            <div key={p.size} className="bg-sky-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-gray-500">{p.size}</p>
              <p className="font-bold text-sky-700 text-sm mt-0.5">{p.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🏭 처리업체 연락처</h2>
        <div className="space-y-2">
          {processors.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0 text-sm">
              <div>
                <p className="text-xs text-gray-400">{p.category}</p>
                <p className="font-medium text-gray-800">{p.name}</p>
              </div>
              <a href={`tel:${p.phone}`} className="text-blue-600 hover:underline font-medium text-sm flex-shrink-0">{p.phone}</a>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">📞 수거 요청</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">동 지역</span>
            <a href="tel:041-840-8604" className="text-blue-600 hover:underline font-medium">041-840-8604</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">읍·면 지역</span>
            <span className="text-gray-600">읍·면 행정복지센터로 연락</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">자원순환과</span>
            <a href="tel:041-840-8604" className="text-blue-600 hover:underline font-medium">041-840-8604</a>
          </div>
        </div>
      </section>

      <a href="https://www.gongju.go.kr/kr/sub06_08_06_03.do" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
        공주시청 공식 페이지 바로가기 →
      </a>
    </div>
  );
}
