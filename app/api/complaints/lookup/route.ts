import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number');

  if (!number) {
    return NextResponse.json({ error: '접수번호를 입력해 주세요.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('id, complaint_number, category, description, address, status, created_at, updated_at, admin_memo')
    .eq('complaint_number', number.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: '해당 접수번호의 민원을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json(data);
}
