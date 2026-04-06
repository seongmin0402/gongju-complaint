/**
 * 새 민원 접수 시 관리자 메일 알림 (Resend API).
 * RESEND_API_KEY 없으면 조용히 건너뜀 (접수는 항상 성공).
 *
 * @see https://resend.com/docs/send-with-nextjs
 */
const DEFAULT_ADMIN_EMAIL = 'tjdals0202@naver.com';

export async function sendNewComplaintAdminEmail(params: {
  complaintNumber: string;
  category: string;
  description: string;
  address: string;
  reporterName: string;
  reporterPhone: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim();
  const from =
    process.env.RESEND_FROM?.trim() || '공주 환경민원 <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('[notify-admin] RESEND_API_KEY 미설정: 관리자 메일을 보내지 않습니다. Vercel 환경 변수를 확인하세요.');
    return;
  }

  const subject = `[공주 환경민원] 새 접수 ${params.complaintNumber}`;
  const text = [
    `접수번호: ${params.complaintNumber}`,
    `분류: ${params.category}`,
    `위치: ${params.address || '(주소 없음)'}`,
    '',
    '내용:',
    params.description,
    '',
    `신고자: ${params.reporterName} / ${params.reporterPhone}`,
  ].join('\n');

  const html = `
    <pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(text)}</pre>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      console.error('[notify-admin] Resend HTTP', res.status, bodyText);
      return;
    }
    try {
      const body = JSON.parse(bodyText) as { id?: string };
      if (body.id) {
        console.log('[notify-admin] Resend 수락 id=', body.id, 'to=', to);
      }
    } catch {
      console.log('[notify-admin] Resend 응답', bodyText.slice(0, 200));
    }
  } catch (e) {
    console.error('[notify-admin] send failed', e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
