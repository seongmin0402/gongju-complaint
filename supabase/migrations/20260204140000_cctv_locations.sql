-- CCTV 스마트경고판 위치 (관리자 지도 전용)
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
CREATE INDEX IF NOT EXISTS cctv_locations_row_no_idx ON public.cctv_locations (row_no);
