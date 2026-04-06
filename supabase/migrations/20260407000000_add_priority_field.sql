-- Add priority column to complaints table
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('높음', '보통', '낮음'));

COMMENT ON COLUMN public.complaints.priority IS '담당자가 설정한 민원 우선순위 (높음/보통/낮음). 기본값 null.';
