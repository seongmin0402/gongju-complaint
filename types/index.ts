export type ComplaintCategory =
  | '쓰레기 무단투기'
  | '악취'
  | '불법 투기'
  | '불법 주정차'
  | '가로등 고장'
  | '도로 파손'
  | '기타';

export type ComplaintStatus = '접수' | '처리중' | '완료';
export type ComplaintPriority = '높음' | '보통' | '낮음';

export interface Complaint {
  id: string;
  complaint_number: string;
  category: ComplaintCategory;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  reporter_name: string;
  reporter_phone: string;
  photo_urls: string[] | null;
  /** @deprecated use photo_urls */
  photo_url: string | null;
  admin_memo: string | null;
  status: ComplaintStatus;
  /** 신고자가 입력한 악취 강도 (1=미약, 5=매우 심각). 악취 카테고리 외에는 null. */
  odor_level: number | null;
  /** Google Vision AI 사진 분석 심각도 코멘트 */
  ai_severity: string | null;
  /** 담당자가 설정한 민원 우선순위 */
  priority: ComplaintPriority | null;
  created_at: string;
  updated_at: string;
}

export type NewComplaint = Omit<Complaint, 'id' | 'complaint_number' | 'status' | 'created_at' | 'updated_at' | 'admin_memo' | 'photo_url'>;

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  '쓰레기 무단투기': '#EF4444',
  '악취': '#F97316',
  '불법 투기': '#8B5CF6',
  '불법 주정차': '#F59E0B',
  '가로등 고장': '#3B82F6',
  '도로 파손': '#6B7280',
  '기타': '#9CA3AF',
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  '접수': '#F97316',
  '처리중': '#10B981',
  '완료': '#3B82F6',
};

export const STATUS_BG_CLASSES: Record<ComplaintStatus, string> = {
  '접수': 'bg-orange-100 text-orange-800',
  '처리중': 'bg-emerald-100 text-emerald-800',
  '완료': 'bg-blue-100 text-blue-800',
};

export const PRIORITY_OPTIONS: ComplaintPriority[] = ['높음', '보통', '낮음'];

export const PRIORITY_BG_CLASSES: Record<ComplaintPriority, string> = {
  '높음': 'bg-red-100 text-red-800 border-red-200',
  '보통': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '낮음': 'bg-gray-100 text-gray-600 border-gray-200',
};

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  '쓰레기 무단투기',
  '악취',
  '불법 투기',
  '불법 주정차',
  '가로등 고장',
  '도로 파손',
  '기타',
];

/** 관리자용 CCTV 스마트경고판 위치 (CSV·지오코딩 적재) */
export type CctvGeocodeStatus = 'pending' | 'ok' | 'failed';

export interface CctvLocation {
  id: string;
  row_no: number;
  jurisdiction: string;
  install_location: string;
  note: string;
  remark: string;
  geocode_query: string;
  latitude: number | null;
  longitude: number | null;
  geocode_status: CctvGeocodeStatus;
  created_at: string;
  updated_at: string;
}
