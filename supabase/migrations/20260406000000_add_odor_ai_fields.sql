-- Add odor_level and ai_severity columns to complaints table
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS odor_level smallint CHECK (odor_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS ai_severity text;

COMMENT ON COLUMN public.complaints.odor_level IS '신고자가 입력한 악취 강도 (1=미약, 5=매우 심각). 악취 카테고리 외에는 null.';
COMMENT ON COLUMN public.complaints.ai_severity IS 'Google Vision AI가 사진을 분석한 심각도 코멘트. 관리자 요청 시 저장.';
