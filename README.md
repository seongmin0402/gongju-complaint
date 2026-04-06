# 공주시 환경 민원 신고 시스템

쓰레기 무단투기, 악취 등의 환경 민원을 실시간으로 신고하고 네이버 지도에서 확인할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Realtime + Auth)
- **Naver Maps JavaScript API v3**
- **Tailwind CSS**

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. `supabase/schema.sql` 파일 내용을 **SQL Editor**에서 실행
3. **Project Settings > API** 에서 URL과 키 복사

### 3. 네이버 지도 API 설정

1. [NCP Console](https://console.ncloud.com/) 접속
2. **AI·NAVER API > Maps > Web Dynamic Map** 서비스 신청
3. 애플리케이션 등록 후 **Client ID** 복사
4. 허용 도메인에 `localhost` 및 배포 도메인 추가

### 4. 환경 변수 설정

`.env.local` 파일을 수정하세요:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_클라이언트_ID
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 5. 관리자 계정 생성

Supabase Dashboard > **Authentication > Users > Invite user** 로 관리자 이메일 등록

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 메인 지도 (실시간 민원 마커 표시) |
| `/report` | 민원 신고 (위치 선택 + 폼 입력) |
| `/admin` | 관리자 로그인 |
| `/admin/dashboard` | 민원 관리 대시보드 |

---

## 민원 카테고리 & 색상

| 카테고리 | 마커 색상 |
|---------|---------|
| 쓰레기 무단투기 | 🔴 빨강 |
| 악취 | 🟠 주황 |
| 불법 투기 | 🟣 보라 |
| 기타 | ⚫ 회색 |

## 민원 상태

| 상태 | 색상 |
|------|------|
| 접수 | 🔵 파랑 |
| 처리중 | 🟡 노랑 |
| 완료 | 🟢 초록 |
