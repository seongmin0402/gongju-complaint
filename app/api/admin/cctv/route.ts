import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verify-admin';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('cctv_locations')
    .select('*')
    .order('row_no', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
