import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verify-admin';
import { createAdminClient } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });

  const body = await request.json();
  const { status, admin_memo, address, priority } = body;

  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (address !== undefined) {
    if (typeof address !== 'string') {
      return NextResponse.json({ error: 'address는 문자열이어야 합니다.' }, { status: 400 });
    }
    updateFields.address = address;
  }

  if (status !== undefined) {
    const allowed = ['접수', '처리중', '완료'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: '올바르지 않은 상태값입니다.' }, { status: 400 });
    }
    updateFields.status = status;
  }

  if (admin_memo !== undefined) {
    updateFields.admin_memo = admin_memo;
  }

  if (priority !== undefined) {
    const allowed = ['높음', '보통', '낮음', null];
    if (!allowed.includes(priority)) {
      return NextResponse.json({ error: '올바르지 않은 우선순위값입니다.' }, { status: 400 });
    }
    updateFields.priority = priority;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('complaints')
    .update(updateFields)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
