export default function RecyclingPage() {
  const resaleShops = [
    { name: '알뜰매장', address: '충청남도 공주시 우체국길 11', items: '의류, 신발, 도서, 가방 등', phone: '041-854-3325' },
    { name: '교차로 알뜰매장', address: '충청남도 공주시 번영1로 11 (신관동)', items: '가전, 가구, 사무용품', phone: '041-856-7043' },
    { name: '가가중고 알뜰매장', address: '충청남도 공주시 웅진로 156', items: '가전', phone: '041-857-3801' },
    { name: '금성중고가전센터', address: '충청남도 공주시 제민천2길 44-1 (중학동)', items: '가전', phone: '041-855-2789' },
    { name: '만수전자중고할인매장', address: '충청남도 공주시 교동 10-16', items: '가전', phone: '041-857-3368' },
    { name: '에어컨중고센터', address: '충청남도 공주시 번영3로 46', items: '에어컨', phone: '041-856-3542' },
    { name: '중고매매상사', address: '충청남도 공주시 산성시장5길 78-26 (금성동)', items: '가전', phone: '041-853-4600' },
    { name: '요셉이네중고', address: '충청남도 공주시 전막1길 16-7 (신관동)', items: '가전, 가구', phone: '041-854-7117' },
  ];

  const items = [
    { icon: '📰', name: '종이류·1회용컵·고철·캔류', details: [
      '품목: 신문지, 책자, 노트, 종이쇼핑백, 달력, 포장지, 종이컵, 팩, 상자류 (비닐포장지 제외)',
      '이물질 제거 후 마대나 끈으로 묶어서 배출',
      '1회용컵은 찌꺼기 없이 말려서 마대 등에 담아 배출',
    ]},
    { icon: '🍾', name: '병류', details: [
      '담배꽁초 등 이물질을 넣지 말고 내용물을 비우고 배출',
      '빈병보증금 대상품목(맥주, 소주병, 사이다, 콜라병 등)은 일반 소매점에서 환수',
    ]},
    { icon: '♻️', name: '플라스틱류', details: [
      '내용물을 깨끗이 비우고 다른 재질로 된 은박지나 상표 제거',
      'PET, 과자·라면봉지 등 비닐포장재(other), 기타 플라스틱류(HDPE, LDPE, PP, PS, PVC) 분리배출',
    ]},
    { icon: '📦', name: '폐스티로폼', details: [
      '상표나 이물질 제거 후 배출 (코팅된 것 등은 쓰레기봉투 처리)',
      'TV, 냉장고, 세탁기 등 폐전자제품과 스티로폼 완충재는 판매업체의 회수 의무사항',
    ]},
    { icon: '👕', name: '의류', details: [
      '품목: 면섬유류, 기타의류',
      '물기에 젖지 않도록 마대 등에 담아서 묶어서 배출',
    ]},
    { icon: '🌾', name: '영농폐기물류', details: [
      '대상품목: 농약빈병, 농업용비닐',
      '농약을 완전히 사용 후 플라스틱, 유리병을 구분 배출',
      '흙을 털어낸 후 묶어서 마을 공동집하장에 보관',
    ]},
    { icon: '💡', name: '폐형광등·폐건전지', details: [
      '깨지지 않도록 막대형·컴팩트형·원형으로 분리 배출하여 읍면동 주민센터 등에 설치된 수거함에 수집',
      '깨진 형광등, 포장지가 벗겨진 폐건전지는 쓰레기 종량제봉투에 담아 배출',
    ]},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">재활용품 분리배출</h1>
        <p className="text-sm text-gray-500 mt-1">공주시청 공식 안내 기준</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">📌 배출 방법</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="text-green-500 flex-shrink-0 mt-0.5">•</span>읍·면·동 주민센터에서 수령한 <strong>재활용품 전용봉투</strong> 또는 <strong>투명한 비닐봉투</strong>에 배출 (혼합 가능, 분리 권장)</li>
          <li className="flex gap-2"><span className="text-red-500 flex-shrink-0 mt-0.5">•</span>전용봉투·투명봉투에 담지 않으면 <strong>수거하지 않습니다.</strong></li>
          <li className="flex gap-2"><span className="text-red-500 flex-shrink-0 mt-0.5">•</span>재활용이 안 되는 쓰레기 혼합 배출 시 <strong>과태료 부과</strong></li>
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🚛 수거 노선</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span><strong>대도로변:</strong> 주간 09:00~18:00</li>
          <li className="flex gap-2">
            <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
            <div>
              <p className="font-medium">시 외곽지역</p>
              <p className="text-gray-600 mt-0.5">화요일: 월송동 → 송선동 → 무릉동 → 쌍신동 → 월미동</p>
              <p className="text-gray-600">목요일: 소학동 → 신기동 → 상왕동 → 주미동 → 태봉동 → 봉정동 → 검상동</p>
            </div>
          </li>
          <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span><strong>시내/신관 골목·도로변:</strong> 일~금 21:00~01:00</li>
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🔄 재활용품 교환센터</h2>
        <div className="text-sm text-gray-700 space-y-1.5">
          <p><span className="font-medium">장소:</span> 공주시 교동 120번지 (구별관) <a href="tel:041-852-1006" className="text-blue-600 hover:underline">☎ 852-1006</a></p>
          <p><span className="font-medium">운영:</span> 월~금 13:00~18:00</p>
          <p><span className="font-medium">교환품목:</span> 파지, 신문지, 우유팩, 고철, 공병, 의류, 교복 등 → 재생화장지·세제류·종량제봉투</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🏪 재활용품 상설교환 판매장</h2>
        <div className="space-y-2">
          {resaleShops.map((s) => (
            <div key={s.name} className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-800">{s.name}</p>
                <a href={`tel:${s.phone}`} className="text-blue-600 text-xs hover:underline flex-shrink-0">{s.phone}</a>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{s.address}</p>
              <p className="text-gray-600 text-xs mt-0.5">취급: {s.items}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-800">🖥️ 가전제품 무상회수 (신제품 구매 시)</h2>
        <div className="text-sm text-gray-700 space-y-1.5">
          <p className="bg-green-50 rounded-lg p-3 text-green-800">신제품 구매 시 판매업자는 구제품(타업체 포함)을 <strong>무상회수</strong>할 의무가 있습니다.</p>
          <ul className="space-y-1">
            <li className="flex gap-2"><span className="text-gray-400">•</span>대상: TV, 세탁기, 냉장고, 에어컨, 컴퓨터, 오디오 등 + 신제품 포장재</li>
            <li className="flex gap-2"><span className="text-red-400">•</span>무상회수 의무 위반 시 <strong>과태료 300만원</strong></li>
            <li className="flex gap-2"><span className="text-gray-400">•</span>신제품 구입 없이 처분 시: 대형폐기물 스티커 부착 배출 (시내 <a href="tel:010-9461-1176" className="text-blue-600">010-9461-1176</a>, 읍면 사무소 연락)</li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-800">📋 품목별 분리배출 요령</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.name} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                <ul className="mt-1 space-y-0.5">
                  {item.details.map((d, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="flex-shrink-0 text-gray-400">-</span>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <a href="https://www.gongju.go.kr/kr/sub06_08_06_01.do" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
        공주시청 공식 페이지 바로가기 →
      </a>
    </div>
  );
}
