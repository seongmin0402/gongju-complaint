import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verify-admin';
import { createAdminClient } from '@/lib/supabase';
import { geocodeAddressToLatLng, sleep } from '@/lib/geocode-forward';

const BATCH = 5;
const DELAY_MS = 1100;

export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });

  let limit = BATCH;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.limit === 'number' && body.limit > 0 && body.limit <= 20) limit = Math.floor(body.limit);
  } catch {
    /* default */
  }

  const supabase = createAdminClient();
  const { data: pending, error: selErr } = await supabase
    .from('cctv_locations')
    .select('id, row_no, geocode_query')
    .eq('geocode_status', 'pending')
    .not('geocode_query', 'eq', '')
    .order('row_no', { ascending: true })
    .limit(limit);

  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  if (!pending?.length) {
    const { count } = await supabase
      .from('cctv_locations')
      .select('*', { count: 'exact', head: true })
      .eq('geocode_status', 'pending');
    return NextResponse.json({ processed: 0, ok: 0, failed: 0, remaining: count ?? 0, details: [] });
  }

  const details: { row_no: number; status: 'ok' | 'failed' }[] = [];
  let ok = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const row = pending[i];
    if (i > 0) await sleep(DELAY_MS);

    const q = (row.geocode_query || '').trim();
    if (!q) {
      await supabase
        .from('cctv_locations')
        .update({ geocode_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', row.id);
      failed++;
      details.push({ row_no: row.row_no, status: 'failed' });
      continue;
    }

    const coords = await geocodeAddressToLatLng(q);
    if (coords) {
      await supabase
        .from('cctv_locations')
        .update({
          latitude: coords.lat,
          longitude: coords.lng,
          geocode_status: 'ok',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      ok++;
      details.push({ row_no: row.row_no, status: 'ok' });
    } else {
      await supabase
        .from('cctv_locations')
        .update({ geocode_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', row.id);
      failed++;
      details.push({ row_no: row.row_no, status: 'failed' });
    }
  }

  const { count: remaining } = await supabase
    .from('cctv_locations')
    .select('*', { count: 'exact', head: true })
    .eq('geocode_status', 'pending');

  return NextResponse.json({
    processed: pending.length,
    ok,
    failed,
    remaining: remaining ?? 0,
    details,
  });
}
