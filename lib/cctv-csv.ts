/** CCTV 현황 CSV (연번, 관할, 설치위치, 부연설명, 비고) 파싱 */

export interface CsvCctvRow {
  row_no: number;
  jurisdiction: string;
  install_location: string;
  note: string;
  remark: string;
}

function splitCsvLine(line: string): string[] {
  const parts = line.split(',');
  if (parts.length <= 5) return parts.map((s) => s.trim());
  const [a, b, c, d, ...rest] = parts;
  return [a, b, c, d, rest.join(',').trim()];
}

/**
 * 부연설명: 실제 도로·건물 기준 설치 위치(우선).
 * 짧은 설명(고가 아래 등)은 관할·설치위치와 함께 검색.
 */
export function buildCctvGeocodeQuery(row: Pick<CsvCctvRow, 'jurisdiction' | 'install_location' | 'note'>): string {
  const j = row.jurisdiction.trim();
  const ins = row.install_location.trim();
  const n = row.note.trim();
  const prefix = '충청남도 공주시 ';

  if (!n && !ins) return '';

  const looksLikeRoadAddress = /[로길]\s*\d/.test(n) || n.length >= 22;

  if (n && ins && !looksLikeRoadAddress && n.length < 35) {
    return `${prefix}${j} ${ins} ${n}`;
  }

  const inner = n || ins;
  if (inner.includes('충청남도') || inner.includes('공주시')) {
    return inner.startsWith('충청') ? inner : `${prefix}${inner.replace(/^.*?공주시\s*/, '공주시 ')}`;
  }

  return `${prefix}${j} ${inner}`;
}

export function parseCctvCsv(text: string): CsvCctvRow[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('연번') && lines[i].includes('관할')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) return [];

  const rows: CsvCctvRow[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || /^,+$/.test(line.replace(/,/g, ''))) continue;

    const cols = splitCsvLine(line);
    if (cols.length < 3) continue;

    const rowNo = parseInt(cols[0].replace(/\s/g, ''), 10);
    if (!Number.isFinite(rowNo) || rowNo < 1) continue;

    rows.push({
      row_no: rowNo,
      jurisdiction: (cols[1] || '').trim(),
      install_location: (cols[2] || '').trim(),
      note: (cols[3] || '').trim(),
      remark: (cols[4] || '').trim(),
    });
  }

  return rows.sort((a, b) => a.row_no - b.row_no);
}
