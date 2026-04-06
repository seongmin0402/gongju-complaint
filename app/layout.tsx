import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '공주시 환경 민원 신고',
  description: '공주시 쓰레기 무단투기, 악취 등 환경 민원을 실시간으로 신고하고 지도에서 확인하세요.',
  keywords: ['공주시', '민원', '쓰레기', '환경', '무단투기'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
