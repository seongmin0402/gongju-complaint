'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  type ChartData,
} from 'chart.js';
import type { Complaint } from '@/types';
import { CATEGORY_COLORS } from '@/types';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

interface Props {
  complaints: Complaint[];
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=일, 1=월
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 월요일 기준
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function WeeklyPieChart({ complaints }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const weekStart = getStartOfWeek();
  const thisWeek = complaints.filter((c) => new Date(c.created_at) >= weekStart);

  // 유형별 집계
  const categoryMap: Record<string, number> = {};
  for (const c of thisWeek) {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  }
  const entries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const total = thisWeek.length;

  useEffect(() => {
    if (!canvasRef.current || entries.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = entries.map(([cat]) => cat);
    const data = entries.map(([, count]) => count);
    const backgroundColors = entries.map(
      ([cat]) => CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#9CA3AF',
    );

    const chartData: ChartData<'doughnut'> = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: chartData,
      options: {
        ...chartOptions,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { size: 11, family: 'system-ui' },
              color: '#374151',
              padding: 10,
              boxWidth: 12,
              boxHeight: 12,
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                return (chart.data.labels as string[]).map((label, i) => ({
                  text: `${label} (${dataset.data[i]}건)`,
                  fillStyle: (dataset.backgroundColor as string[])[i],
                  strokeStyle: '#fff',
                  lineWidth: 1,
                  hidden: false,
                  index: i,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${val}건 (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(entries)]);

  const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ 이번 주`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">이번 주 민원 유형 비율</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{weekLabel}</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            총 {total}건
          </span>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
          <span className="text-2xl mb-2">📭</span>
          이번 주 접수된 민원이 없습니다.
        </div>
      ) : (
        <>
          <div className="relative h-44">
            <canvas ref={canvasRef} />
            {/* 중앙 텍스트 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center" style={{ marginRight: '30%' }}>
                <p className="text-2xl font-black text-gray-800">{total}</p>
                <p className="text-[10px] text-gray-400 font-medium">건</p>
              </div>
            </div>
          </div>

          {/* 순위 텍스트 */}
          <div className="mt-3 space-y-1">
            {entries.slice(0, 3).map(([cat, count], i) => (
              <div key={cat} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-4">{i + 1}위</span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#9CA3AF' }}
                />
                <span className="text-gray-700 flex-1">{cat}</span>
                <span className="font-semibold text-gray-800">{count}건</span>
                <span className="text-gray-400">({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
