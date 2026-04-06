export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200/40 bg-white/25 backdrop-blur-[2px] text-[10px] sm:text-[11px] text-gray-400/90 px-4 py-2.5 leading-snug">
      <div className="max-w-5xl mx-auto space-y-1">
        <p className="font-medium text-gray-400/95">지도·위치 데이터 출처</p>
        <p className="text-gray-400/85">
          지도·지오코딩:{' '}
          <a
            href="https://www.ncloud.com/product/applicationService/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500/75 hover:text-blue-600/90 hover:underline"
          >
            네이버 클라우드 플랫폼 Maps API
          </a>
          . 행정경계·역지오코딩 보조:{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500/75 hover:text-blue-600/90 hover:underline"
          >
            © OpenStreetMap 기여자
          </a>
          , ODbL.{' '}
          <a
            href="https://nominatim.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500/75 hover:text-blue-600/90 hover:underline"
          >
            Nominatim
          </a>{' '}
          (
          <a
            href="https://operations.osmfoundation.org/policies/nominatim/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500/75 hover:text-blue-600/90 hover:underline"
          >
            OSMF 이용 정책
          </a>
          ).
        </p>
      </div>
    </footer>
  );
}
