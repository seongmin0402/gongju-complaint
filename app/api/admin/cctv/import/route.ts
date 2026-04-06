import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verify-admin';
import { createAdminClient } from '@/lib/supabase';
import { buildCctvGeocodeQuery } from '@/lib/cctv-csv';
import { CCTV_RAW_DATA } from '@/lib/cctv-data';

export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });

  const rows = CCTV_RAW_DATA.map((r) => ({
    row_no: r.row_no,
    jurisdiction: r.jurisdiction,
    install_location: r.install_location,
    note: r.note,
    remark: r.remark,
    geocode_query: buildCctvGeocodeQuery(r),
    geocode_status: 'pending' as const,
    latitude: null as number | null,
    longitude: null as number | null,
    updated_at: new Date().toISOString(),
  }));

  const supabase = createAdminClient();
  const { error } = await supabase.from('cctv_locations').upsert(rows, { onConflict: 'row_no' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: rows.length });
}
