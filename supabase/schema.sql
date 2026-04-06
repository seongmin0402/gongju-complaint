-- 공주시 환경 민원 신고 시스템 DB 스키마
-- Supabase SQL Editor에서 실행하세요

-- complaints 테이블 생성
CREATE TABLE public.complaints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  description text NOT NULL,
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  address text DEFAULT '',
  reporter_name text NOT NULL,
  reporter_phone text NOT NULL,
  status text DEFAULT '접수' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 카테고리 유효성 제약
ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_category_check
  CHECK (category IN ('쓰레기 무단투기', '악취', '불법 투기', '기타'));

-- 상태 유효성 제약
ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_status_check
  CHECK (status IN ('접수', '처리중', '완료'));

-- Row Level Security 활성화
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 누구나 읽을 수 있음 (공개 지도 표시)
CREATE POLICY "공개 조회 허용" ON public.complaints
  FOR SELECT USING (true);

-- 누구나 신고 가능 (비회원 신고)
CREATE POLICY "공개 신고 허용" ON public.complaints
  FOR INSERT WITH CHECK (true);

-- 인증된 사용자(관리자)만 상태 변경 가능
CREATE POLICY "관리자 업데이트 허용" ON public.complaints
  FOR UPDATE USING (auth.role() = 'authenticated');

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- 인덱스 (성능 최적화)
CREATE INDEX complaints_status_idx ON public.complaints (status);
CREATE INDEX complaints_created_at_idx ON public.complaints (created_at DESC);
CREATE INDEX complaints_category_idx ON public.complaints (category);

-- =============================================
-- 사진 업로드 기능 추가 (이미 테이블이 있다면 아래만 실행)
-- =============================================

-- 사진 URL 컬럼 추가
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS photo_url text DEFAULT NULL;

-- Storage: complaint-photos 버킷 생성 (공개 버킷)
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-photos', 'complaint-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 누구나 업로드 가능
CREATE POLICY "공개 사진 업로드 허용"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'complaint-photos');

-- Storage RLS: 누구나 조회 가능
CREATE POLICY "공개 사진 조회 허용"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'complaint-photos');

-- Storage RLS: 인증된 사용자(관리자)만 삭제 가능
CREATE POLICY "관리자 사진 삭제 허용"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaint-photos');

-- =============================================
-- CCTV 스마트경고판 위치 (관리자 API + service role만 사용)
-- =============================================
CREATE TABLE IF NOT EXISTS public.cctv_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  row_no int NOT NULL UNIQUE,
  jurisdiction text NOT NULL DEFAULT '',
  install_location text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  remark text NOT NULL DEFAULT '',
  geocode_query text NOT NULL DEFAULT '',
  latitude float8,
  longitude float8,
  geocode_status text NOT NULL DEFAULT 'pending'
    CHECK (geocode_status IN ('pending', 'ok', 'failed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS cctv_locations_geocode_status_idx ON public.cctv_locations (geocode_status);
