'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const BagStoreMap = dynamic(() => import('@/components/BagStoreMap'), { ssr: false });

const STORES = [
  { no: 1, region: '계룡면', name: '계룡농협 하나로마트', address: '충청남도 공주시 계룡면 영규대사로 492', phone: '041-857-5035' },
  { no: 2, region: '계룡면', name: '계룡산국립공원갑사야영장', address: '충청남도 공주시 계룡면 갑사로 451', phone: '041-881-3007' },
  { no: 3, region: '계룡면', name: '나들가게 경천마트', address: '충청남도 공주시 계룡면 신원사로 117', phone: '041-853-7663' },
  { no: 4, region: '계룡면', name: '신원상회', address: '충청남도 공주시 계룡면 샛길 1', phone: '041-852-4431' },
  { no: 5, region: '계룡면', name: '오마트', address: '충청남도 공주시 계룡면 갑사로 5', phone: '041-853-6677' },
  { no: 6, region: '계룡면', name: '이마트24 공주계룡점', address: '충청남도 공주시 계룡면 영규대사로486', phone: '' },
  { no: 7, region: '계룡면', name: '이마트24 공주계룡휴게소점', address: '충청남도 공주시 계룡면 차령로 822(계룡관광휴게소)', phone: '041-854-9600' },
  { no: 8, region: '금학동', name: 'GS25 공주교대점', address: '충청남도 공주시 제민천2길 16 (금학동)', phone: '041-854-5660' },
  { no: 9, region: '금학동', name: 'GS25 공주여고점', address: '충청남도 공주시 공주여고길 17 (금학동)', phone: '' },
  { no: 10, region: '금학동', name: '세븐일레븐 공주여고점', address: '충청남도 공주시 공주여고길 13 (금학동)', phone: '041-852-8176' },
  { no: 11, region: '금학동', name: '씨유 공주검상공단점', address: '충청남도 공주시 공단길 6 (검상동)', phone: '041-852-5821' },
  { no: 12, region: '금학동', name: '씨유 공주금학원룸점', address: '충청남도 공주시 하선길 32-1 (금학동)', phone: '041-856-8077' },
  { no: 13, region: '금학동', name: '영우마트', address: '충청남도 공주시 원댕이길 8-8 (금학동)', phone: '041-852-8551' },
  { no: 14, region: '금학동', name: '하나슈퍼', address: '충청남도 공주시 금학동길 40-1 (금학동)', phone: '041-852-3952' },
  { no: 15, region: '금학동', name: '하모니마트 공주금학점', address: '충청남도 공주시 우금티로 513 (금학동)', phone: '041-881-0031' },
  { no: 16, region: '금학동', name: '햇님마트', address: '충청남도 공주시 우금티로 527-1 (금학동)', phone: '041-856-5701' },
  { no: 17, region: '반포면', name: 'GS25 동학사입구점', address: '충청남도 공주시 반포면 동학사1로 144', phone: '' },
  { no: 18, region: '반포면', name: 'GS25 동학사점', address: '충청남도 공주시 반포면 동학사1로 279', phone: '' },
  { no: 19, region: '반포면', name: '계룡산동학사마트', address: '충청남도 공주시 반포면 동학사1로 252(하늘펜션)', phone: '0507-1412-6786' },
  { no: 20, region: '반포면', name: '계룡산편의점', address: '충청남도 공주시 반포면 동학사1로 276', phone: '042-825-7221' },
  { no: 21, region: '반포면', name: '나들가게 S마트', address: '충청남도 공주시 반포면 동학사2로 135', phone: '042-825-3849' },
  { no: 22, region: '반포면', name: '만물슈퍼', address: '충청남도 공주시 반포면 공암장터길 23-1', phone: '041-857-7014' },
  { no: 23, region: '반포면', name: '반포농협 하나로마트', address: '충청남도 공주시 반포면 반포초교길 36-8', phone: '041-856-9400' },
  { no: 24, region: '반포면', name: '세븐일레븐 공주동학사사랑점', address: '충청남도 공주시 반포면 임금봉길 29', phone: '042-825-1505' },
  { no: 25, region: '반포면', name: '세븐일레븐 공주동학사점', address: '충청남도 공주시 반포면 동학사1로 126-2', phone: '042-825-1559' },
  { no: 26, region: '반포면', name: '세븐일레븐 공주동학사주차장점', address: '충청남도 공주시 반포면 동학사1로 263', phone: '042-822-7906' },
  { no: 27, region: '반포면', name: '세븐일레븐 공주동학사학봉점', address: '충청남도 공주시 반포면 계룡대로 1404', phone: '' },
  { no: 28, region: '반포면', name: '씨유 공주동학사점', address: '충청남도 공주시 반포면 동학사1로 131', phone: '042-826-7818' },
  { no: 29, region: '반포면', name: '포시즌마트', address: '충청남도 공주시 반포면 왕흥장악로 938', phone: '041-856-2218' },
  { no: 30, region: '반포면', name: '형제슈퍼', address: '충청남도 공주시 반포면 동학사1로 167-23', phone: '042-825-1766' },
  { no: 31, region: '사곡면', name: '마곡휴게소', address: '충청남도 공주시 사곡면 운암리 569-6', phone: '041-841-8141' },
  { no: 32, region: '사곡면', name: '보람상회', address: '충청남도 공주시 사곡면 마곡사로 95', phone: '041-841-7026' },
  { no: 33, region: '사곡면', name: '사곡농협 하나로마트', address: '충청남도 공주시 사곡면 호계장터1길 1', phone: '041-841-7005' },
  { no: 34, region: '사곡면', name: '사곡농협마곡지점 하나로마트', address: '충청남도 공주시 사곡면 마곡사로 841', phone: '041-841-8075' },
  { no: 35, region: '사곡면', name: '사곡종합할인마트', address: '충청남도 공주시 사곡면 마곡사로 116', phone: '041-841-7766' },
  { no: 36, region: '사곡면', name: '상원골대나무집', address: '충청남도 공주시 사곡면 유구마곡사로 792', phone: '041-841-7214' },
  { no: 37, region: '사곡면', name: '장승마을', address: '충청남도 공주시 사곡면 유구마곡사로 1231', phone: '041-841-5220' },
  { no: 38, region: '사곡면', name: '충남슈퍼', address: '충청남도 공주시 사곡면 마곡사로 112', phone: '041-841-7356' },
  { no: 39, region: '신관동', name: 'GS 더프레시 공주신관점', address: '충청남도 공주시 번영1로 153 (신관동)', phone: '041-852-7737' },
  { no: 40, region: '신관동', name: 'GS25 공주그린점', address: '충청남도 공주시 관골2길 24-13 (신관동)', phone: '041-881-4170' },
  { no: 41, region: '신관동', name: 'GS25 공주금강점', address: '충청남도 공주시 의당로 16 (신관동)', phone: '' },
  { no: 42, region: '신관동', name: 'GS25 공주대타운점', address: '충청남도 공주시 공주대학로 61, 1층 (신관동)', phone: '041-855-2329' },
  { no: 43, region: '신관동', name: 'GS25 공주전막점', address: '충청남도 공주시 금벽로 357-2 (신관동)', phone: '041-855-7395' },
  { no: 44, region: '신관동', name: 'GS25 공주코아루점', address: '충청남도 공주시 관골1길 14 (신관동)', phone: '' },
  { no: 45, region: '신관동', name: 'GS25 공주현대점', address: '충청남도 공주시 신금1길 72, 상가동 103호·104호 (신관동)', phone: '' },
  { no: 46, region: '신관동', name: 'GS25 명성점', address: '충청남도 공주시 신금1길 30-21 (신관동)', phone: '041-881-6271' },
  { no: 47, region: '신관동', name: 'GS25 신공주대학사점', address: '충청남도 공주시 번영3로 52-1 (신관동)', phone: '' },
  { no: 48, region: '신관동', name: 'GS25 신관파크점', address: '충청남도 공주시 전막2길 16-6 (신관동)', phone: '041-854-2888' },
  { no: 49, region: '신관동', name: 'GS25 주공명성점', address: '충청남도 공주시 신금2길 50 (신관동)', phone: '041-854-4000' },
  { no: 50, region: '신관동', name: '공주다살림로컬푸드직매장', address: '충청남도 공주시 관골1길 55-24 (신관동)', phone: '041-856-5282' },
  { no: 51, region: '신관동', name: '노브랜드 공주신관동점', address: '충청남도 공주시 한적2길 29, 1층 (신관동)', phone: '02-380-5111' },
  { no: 52, region: '신관동', name: '대영종합상사', address: '충청남도 공주시 신관로 67 (신관동)', phone: '041-857-2003' },
  { no: 53, region: '신관동', name: '덕성그린마트', address: '충청남도 공주시 관골2길 24-5 (신관동)', phone: '041-858-3311' },
  { no: 54, region: '신관동', name: '동경홈마트', address: '충청남도 공주시 흑수골길 21 (신관동)', phone: '041-852-9500' },
  { no: 55, region: '신관동', name: '명신철물마트', address: '충청남도 공주시 쌍신길 88 (쌍신동)', phone: '041-857-0989' },
  { no: 56, region: '신관동', name: '성황리마트', address: '충청남도 공주시 신금2길 47 (신관동)', phone: '041-881-3404' },
  { no: 57, region: '신관동', name: '세븐일레븐 공주나우빌점', address: '충청남도 공주시 관골1길 29 (신관동)', phone: '' },
  { no: 58, region: '신관동', name: '세븐일레븐 공주대점', address: '충청남도 공주시 번영2로 78-6 (신관동)', phone: '041-858-6602' },
  { no: 59, region: '신관동', name: '세븐일레븐 공주대중문점', address: '충청남도 공주시 흑수골길 42 (신관동)', phone: '' },
  { no: 60, region: '신관동', name: '세븐일레븐 공주신관번영점', address: '충청남도 공주시 번영1로 17 (신관동)', phone: '' },
  { no: 61, region: '신관동', name: '세븐일레븐 공주신관점', address: '충청남도 공주시 번영2로 40-15 (신관동)', phone: '041-852-6462' },
  { no: 62, region: '신관동', name: '세븐일레븐 공주신관중앙점', address: '충청남도 공주시 번영2로 18-4 (신관동)', phone: '' },
  { no: 63, region: '신관동', name: '세븐일레븐 공주신관프라자점', address: '충청남도 공주시 공주대학로 91, 1층(신관동)', phone: '' },
  { no: 64, region: '신관동', name: '세븐일레븐 공주신관하나점', address: '충청남도 공주시 신관로 28 (신관동)', phone: '' },
  { no: 65, region: '신관동', name: '세븐일레븐 공주신관한빛점', address: '충청남도 공주시 번영1로 48-8 (신관동, 1층)', phone: '041-853-8057' },
  { no: 66, region: '신관동', name: '세븐일레븐 공주신관행복점', address: '충청남도 공주시 관골2길 34, 상가동1층 103호 (신관동)', phone: '' },
  { no: 67, region: '신관동', name: '세븐일레븐 공주신월점', address: '충청남도 공주시 번영1로 187, 1층 (신관동)', phone: '' },
  { no: 68, region: '신관동', name: '세종공주축산농협 하나로마트', address: '충청남도 공주시 번영1로 42 (신관동)', phone: '041-850-4700' },
  { no: 69, region: '신관동', name: '수입브랜드 공주점', address: '충청남도 공주시 한적2길 27-15(신관동)', phone: '010-2585-4365' },
  { no: 70, region: '신관동', name: '씨유 공주대아점', address: '충청남도 공주시 신금2길 36 (신관동)', phone: '041-881-3039' },
  { no: 71, region: '신관동', name: '씨유 공주대학로점', address: '충청남도 공주시 메산동길 15 (신관동)', phone: '041-857-3552' },
  { no: 72, region: '신관동', name: '씨유 공주번영점', address: '충청남도 공주시 번영1로 194-5 (신관동)', phone: '' },
  { no: 73, region: '신관동', name: '씨유 공주삼우타운점', address: '충청남도 공주시 신금1길 48 (신관동)', phone: '041-881-8590' },
  { no: 74, region: '신관동', name: '씨유 공주신관현대점', address: '충청남도 공주시 공주대학로 23-23, 1층 (신관동)', phone: '' },
  { no: 75, region: '신관동', name: '씨유 공주일신점', address: '충청남도 공주시 흑수골길 10 (신관동)', phone: '041-858-5898' },
  { no: 76, region: '신관동', name: '씨유 공주터미널점', address: '충청남도 공주시 번영3로 5-1 (신관동)', phone: '041-852-5366' },
  { no: 77, region: '신관동', name: '씨유 공주행운점', address: '충청남도 공주시 흑수골길 49 (신관동)', phone: '' },
  { no: 78, region: '신관동', name: '씨유 신관2호점', address: '충청남도 공주시 전막2길 16-2 (신관동)', phone: '041-858-6700' },
  { no: 79, region: '신관동', name: '우리마트 공주대점', address: '충청남도 공주시 공주대학로 72-14 (신관동)', phone: '041-855-6000' },
  { no: 80, region: '신관동', name: '우신할인마트', address: '충청남도 공주시 매산동길 24-2 (신관동)', phone: '041-858-5550' },
  { no: 81, region: '신관동', name: '이마트24 공주곰나루점', address: '충청남도 공주시 신금2길 47-1, 상가동 1층 101호 (신관동)', phone: '' },
  { no: 82, region: '신관동', name: '이마트24 공주대점', address: '충청남도 공주시 공주대학로 53, B동 1층 102호 (신관동)', phone: '040-4195-9200' },
  { no: 83, region: '신관동', name: '일신슈퍼', address: '충청남도 공주시 번영1로 77-7 (신관동)', phone: '041-855-5248' },
  { no: 84, region: '신관동', name: '케이마트', address: '충청남도 공주시 관골1길 55-5 (신관동)', phone: '041-852-9696' },
  { no: 85, region: '신관동', name: '탑마트', address: '충청남도 공주시 흑수골길 30 (신관동)', phone: '041-854-9000' },
  { no: 86, region: '신관동', name: '판다팜', address: '충청남도 공주시 번영2로 73 (신관동)', phone: '041-881-2230' },
  { no: 87, region: '신관동', name: '한미포장', address: '충청남도 공주시 번영1로 16 (신관동)', phone: '041-852-4441' },
  { no: 88, region: '신풍면', name: '동원슈퍼', address: '충청남도 공주시 신풍면 신풍길 90', phone: '041-841-3091' },
  { no: 89, region: '신풍면', name: '신풍농협 하나로마트', address: '충청남도 공주시 신풍면 안뜸길 5', phone: '041-841-2208' },
  { no: 90, region: '신풍면', name: '신풍슈퍼', address: '충청남도 공주시 신풍면 신풍길 72-1', phone: '041-841-3679' },
  { no: 91, region: '신풍면', name: '신풍장례문화원', address: '충청남도 공주시 신풍면 차동로 1817-34', phone: '041-841-4442' },
  { no: 92, region: '신풍면', name: '신풍할인마트', address: '충청남도 공주시 신풍면 신풍길 58', phone: '041-841-4966' },
  { no: 93, region: '신풍면', name: '이마트24 공주백룡휴게소점', address: '충청남도 공주시 신풍면 차동로 1793', phone: '' },
  { no: 94, region: '옥룡동', name: 'GS 더프레시 공주옥룡점', address: '충청남도 공주시 무령로 310 (옥룡동)', phone: '041-856-6330' },
  { no: 95, region: '옥룡동', name: 'GS25 공주옥룡점', address: '충청남도 공주시 무령로 318 (옥룡동)', phone: '041-854-2524' },
  { no: 96, region: '옥룡동', name: 'GS25 옥룡주공점', address: '충청남도 공주시 우금티로 719 (옥룡동)', phone: '041-858-8997' },
  { no: 97, region: '옥룡동', name: '금성슈퍼', address: '충청남도 공주시 대추골1길 11 (옥룡동)', phone: '041-852-4862' },
  { no: 98, region: '옥룡동', name: '문화슈퍼', address: '충청남도 공주시 우금티로 709-10 (옥룡동)', phone: '041-856-5636' },
  { no: 99, region: '옥룡동', name: '세븐일레븐 공주VIP점', address: '충청남도 공주시 소학동길 179 (소학동)', phone: '' },
  { no: 100, region: '옥룡동', name: '수은슈퍼', address: '충청남도 공주시 우금티로 733-1(옥룡동)', phone: '041-855-6865' },
  { no: 101, region: '옥룡동', name: '씨스페이스 공주버드나무길점', address: '충청남도 공주시 버드나무1길 69, 상가동 1층 1호 (옥룡동)', phone: '' },
  { no: 102, region: '옥룡동', name: '씨유 공주미도점', address: '충청남도 공주시 우금티로 720 (옥룡동)', phone: '041-852-7775' },
  { no: 103, region: '옥룡동', name: '씨유 공주옥룡로드점', address: '충청남도 공주시 무령로 290 (옥룡동)', phone: '' },
  { no: 104, region: '옥룡동', name: '씨유 공주옥룡점', address: '충청남도 공주시 우금티로 777(옥룡동)', phone: '041-857-2057' },
  { no: 105, region: '옥룡동', name: '옥룡농협 하나로마트', address: '충청남도 공주시 무령로 311 (옥룡동)', phone: '041-856-1017' },
  { no: 106, region: '옥룡동', name: '화신슈퍼', address: '충청남도 공주시 우금티로 695-5 (옥룡동)', phone: '041-856-6289' },
  { no: 107, region: '우성면', name: 'GS25 공주우성점', address: '충청남도 공주시 우성면 동대리길 63', phone: '041-854-6667' },
  { no: 108, region: '우성면', name: '대전슈퍼', address: '충청남도 공주시 우성면 동대리길 73', phone: '041-852-6668' },
  { no: 109, region: '우성면', name: '상서구판장', address: '충청남도 공주시 우성면 우성길 163', phone: '041-853-8389' },
  { no: 110, region: '우성면', name: '씨유 공주우성점', address: '충청남도 공주시 우성면 동대리길 66', phone: '' },
  { no: 111, region: '우성면', name: '우성농협 하나로마트', address: '충청남도 공주시 우성면 차동로 473', phone: '041-857-6009' },
  { no: 112, region: '우성면', name: '우성제과', address: '충청남도 공주시 우성면 동대리길 85-1', phone: '041-852-0416' },
  { no: 113, region: '웅진동', name: 'GS25 공주금성점', address: '충청남도 공주시 미나리3길 17(금성동 예다원)', phone: '041-854-2787' },
  { no: 114, region: '웅진동', name: 'GS25 공주백제점', address: '충청남도 공주시 금성길 20 (금성동)', phone: '041-853-7150' },
  { no: 115, region: '웅진동', name: 'GS25 공주웅진점', address: '충청남도 공주시 백제문화로 2139, 101호 (웅진동)', phone: '041-855-4174' },
  { no: 116, region: '웅진동', name: 'GS25 뉴공주의료원점', address: '충청남도 공주시 무령로 77, B1층 (웅진동)', phone: '' },
  { no: 117, region: '웅진동', name: '공주마트', address: '충청남도 공주시 산성시장5길 50 (산성동)', phone: '041-854-7741' },
  { no: 118, region: '웅진동', name: '광복상회', address: '충청남도 공주시 산성시장4길 36-4 (산성동)', phone: '041-855-2236' },
  { no: 119, region: '웅진동', name: '교동문구', address: '충청남도 공주시 용당길 59-4 (교동)', phone: '041-855-4955' },
  { no: 120, region: '웅진동', name: '남해식품', address: '충청남도 공주시 용당길 12-1 (산성동)', phone: '041-852-8331' },
  { no: 121, region: '웅진동', name: '다롱슈퍼', address: '충청남도 공주시 정자방1길 17 (금성동)', phone: '041-853-9821' },
  { no: 122, region: '웅진동', name: '대우할인마트', address: '충청남도 공주시 무령로 169-5 (교동)', phone: '041-881-7622' },
  { no: 123, region: '웅진동', name: '봉지집', address: '충청남도 공주시 산성시장1길 70-9 (산성동)', phone: '041-852-7590' },
  { no: 124, region: '웅진동', name: '세븐일레븐 공주무령점', address: '충청남도 공주시 무령로 215 (산성동)', phone: '' },
  { no: 125, region: '웅진동', name: '세븐일레븐 공주점', address: '충청남도 공주시 무령로 225 (산성동)', phone: '041-857-6770' },
  { no: 126, region: '웅진동', name: '신흥청과상회', address: '충청남도 공주시 산성시장5길 96 (금성동)', phone: '041-855-5523' },
  { no: 127, region: '웅진동', name: '씨유 공주미나리점', address: '충청남도 공주시 미나리2길 18-1 (금성동)', phone: '' },
  { no: 128, region: '웅진동', name: '씨유 공주예미지점', address: '충청남도 공주시 백제문화로 2124, 1층(웅진동)', phone: '' },
  { no: 129, region: '웅진동', name: '원마트', address: '충청남도 공주시 백제문화로 2129 (웅진동)', phone: '041-856-6413' },
  { no: 130, region: '웅진동', name: '이마트24 공주공산성점', address: '충청남도 공주시 왕릉로 142 (금성동)', phone: '' },
  { no: 131, region: '웅진동', name: '이마트24 공주의료원점', address: '충청남도 공주시 왕릉로 12 (웅진동)', phone: '' },
  { no: 132, region: '웅진동', name: '현대그릇프라자', address: '충청남도 공주시 웅진로 193 (산성동)', phone: '041-854-3344' },
  { no: 133, region: '월송동', name: 'GS25 공주새뜸점', address: '충청남도 공주시 신금1길 100 (금흥동) 현대4차 아파트상가 102호', phone: '041-881-4545' },
  { no: 134, region: '월송동', name: 'GS25 공주우남점', address: '충청남도 공주시 한적2길 51-12 (금흥동) 우남퍼스트빌상가106호', phone: '041-852-1109' },
  { no: 135, region: '월송동', name: 'GS25 공주월송파크점', address: '충청남도 공주시 무령로 600-18 (월송동)', phone: '080-999-5425' },
  { no: 136, region: '월송동', name: 'GS25 공주하브점', address: '충청남도 공주시 무령로 599-40, 104호·105호(금흥동)', phone: '' },
  { no: 137, region: '월송동', name: '금강슈퍼', address: '충청남도 공주시 연수원길 26-9 (금흥동)', phone: '' },
  { no: 138, region: '월송동', name: '서우마트', address: '충청남도 공주시 장기로 24 (금흥동)', phone: '041-881-9620' },
  { no: 139, region: '월송동', name: '세븐일레븐 공주금흥중앙점', address: '충청남도 공주시 신금1길 83 (금흥동 퍼스트타워)', phone: '' },
  { no: 140, region: '월송동', name: '세븐일레븐 공주월송2단지점', address: '충청남도 공주시 무령로 600-85, 상가동 102호·103호(월송동)', phone: '' },
  { no: 141, region: '월송동', name: '세종공주원예농협 하나로마트', address: '충청남도 공주시 무령로 592, 1층 101호(월송동)', phone: '041-858-1610' },
  { no: 142, region: '월송동', name: '씨유 공주월송점', address: '충청남도 공주시 무령로 600-25, 102(월송동)', phone: '' },
  { no: 143, region: '월송동', name: '씨유 공주월송패밀리점', address: '충청남도 공주시 무령로 550-39, 104호(월송동)', phone: '' },
  { no: 144, region: '월송동', name: '우리마트[㈜주원]', address: '충청남도 공주시 신금1길 79 (금흥동)', phone: '041-855-0111' },
  { no: 145, region: '월송동', name: '하트할인마트 우남점', address: '충청남도 공주시 한적2길 51-17 (금흥동)', phone: '041-852-6555' },
  { no: 146, region: '월송동', name: '한살림 공주매장', address: '충청남도 공주시 한적2길 37-25 (금흥동)', phone: '041-881-1225' },
  { no: 147, region: '유구읍', name: 'GS25 공주유구점', address: '충청남도 공주시 유구읍 중앙2길 93', phone: '041-841-4006' },
  { no: 148, region: '유구읍', name: '대원슈퍼', address: '충청남도 공주시 유구읍 창말길 44', phone: '041-841-3331' },
  { no: 149, region: '유구읍', name: '사랑할인마트', address: '충청남도 공주시 유구읍 중앙2길 66', phone: '041-841-3007' },
  { no: 150, region: '유구읍', name: '세븐일레븐 공주신영휴게소점', address: '충청남도 공주시 유구읍 금계산로 422', phone: '041-841-5553' },
  { no: 151, region: '유구읍', name: '세븐일레븐 공주유구본점', address: '충청남도 공주시 유구읍 중앙1길 100-1', phone: '041-841-9696' },
  { no: 152, region: '유구읍', name: '씨유 공주유구점', address: '충청남도 공주시 유구읍 중앙2길 76', phone: '041-841-5794' },
  { no: 153, region: '유구읍', name: '아리랑도매마트', address: '충청남도 공주시 유구읍 중앙2길 76', phone: '041-841-8891' },
  { no: 154, region: '유구읍', name: '완균편의점', address: '충청남도 공주시 유구읍 구장터길 29-8', phone: '041-841-5069' },
  { no: 155, region: '유구읍', name: '우리마트', address: '충청남도 공주시 유구읍 중앙1길 120', phone: '041-841-4204' },
  { no: 156, region: '유구읍', name: '유구농협 하나로마트', address: '충청남도 공주시 유구읍 중앙2길 92-1', phone: '041-841-2503' },
  { no: 157, region: '유구읍', name: '이마트24 공주유구삼거리점', address: '충청남도 공주시 유구읍 창말길 6', phone: '041-841-6474' },
  { no: 158, region: '유구읍', name: '이마트24 공주유구점', address: '충청남도 공주시 유구읍 중앙1길 58, 1층', phone: '041-960-3406' },
  { no: 159, region: '유구읍', name: '장터할인마트', address: '충청남도 공주시 유구읍 중앙1길 84', phone: '041-841-8540' },
  { no: 160, region: '유구읍', name: '한남슈퍼', address: '충청남도 공주시 유구읍 중앙1길 25', phone: '041-841-4943' },
  { no: 161, region: '유구읍', name: '한일편의점', address: '충청남도 공주시 유구읍 유구마곡사로 8-13', phone: '041-841-3023' },
  { no: 162, region: '유구읍', name: '해성상회', address: '충청남도 공주시 유구읍 시장길 24', phone: '041-841-2598' },
  { no: 163, region: '의당면', name: 'GS25 공주의당점', address: '충청남도 공주시 의당면 연수원길 115-6', phone: '' },
  { no: 164, region: '의당면', name: 'GS25 공주청룡점', address: '충청남도 공주시 의당면 의당로 323-2', phone: '' },
  { no: 165, region: '의당면', name: '씨유 공주청룡점', address: '충청남도 공주시 의당면 의당로 332', phone: '' },
  { no: 166, region: '의당면', name: '의당농협 하나로마트', address: '충청남도 공주시 의당면 의당로 329', phone: '041-855-0679' },
  { no: 167, region: '의당면', name: '청룡슈퍼', address: '충청남도 공주시 의당면 돌모루1길 1', phone: '041-852-2727' },
  { no: 168, region: '의당면', name: '하모니마트 공주의당점', address: '충청남도 공주시 의당면 연수원길 115-2', phone: '041-881-9037' },
  { no: 169, region: '이인면', name: '수마트', address: '충청남도 공주시 이인면 검바위로 232', phone: '041-855-7001' },
  { no: 170, region: '이인면', name: '이인농협 하나로마트', address: '충청남도 공주시 이인면 검바위로 215', phone: '041-857-6092' },
  { no: 171, region: '이인면', name: '이인정류소', address: '충청남도 공주시 이인면 검바위로 223', phone: '041-857-4149' },
  { no: 172, region: '장군면', name: '의당농협의랑지점 하나로마트', address: '세종특별자치시 장군면 의당전의로 701', phone: '044-852-0064' },
  { no: 173, region: '정안면', name: 'GS25 공주정안점', address: '충청남도 공주시 정안면 정안중앙길 194', phone: '041-858-6149' },
  { no: 174, region: '정안면', name: '광명철물', address: '충청남도 공주시 정안면 정안중앙길 167', phone: '041-858-1404' },
  { no: 175, region: '정안면', name: '세븐일레븐 공주정안점', address: '충청남도 공주시 정안면 정안중앙길 129', phone: '' },
  { no: 176, region: '정안면', name: '씨스페이스 공주정안점', address: '충청남도 공주시 정안면 정안중앙길 186, 1층', phone: '' },
  { no: 177, region: '정안면', name: '씨유 공주정안쉼터점', address: '충청남도 공주시 정안면 차령로 3262, 1층', phone: '' },
  { no: 178, region: '정안면', name: '정안농협 하나로마트', address: '충청남도 공주시 정안면 정안중앙길 172', phone: '041-858-6034' },
  { no: 179, region: '정안면', name: '정안농협모란지점 하나로마트', address: '충청남도 공주시 정안면 모란길 97', phone: '041-853-6399' },
  { no: 180, region: '정안면', name: '정안종합식품', address: '충청남도 공주시 정안면 정안중앙길 195-1', phone: '041-858-9636' },
  { no: 181, region: '정안면', name: '지지(GG)편의점', address: '충청남도 공주시 정안면 정앙중앙길 190', phone: '010-4016-6113' },
  { no: 182, region: '중학동', name: 'GS25 공주고점', address: '충청남도 공주시 웅진로 94 (중학동)', phone: '' },
  { no: 183, region: '중학동', name: 'GS25 공주사랑점', address: '충청남도 공주시 웅진로 122 (중동)', phone: '' },
  { no: 184, region: '중학동', name: 'GS25 공주중앙점', address: '충청남도 공주시 무령로 208 (중동)', phone: '' },
  { no: 185, region: '중학동', name: '농심슈퍼(새마을슈퍼)', address: '충청남도 공주시 중학새마을1길 2 (중학동)', phone: '041-855-5749' },
  { no: 186, region: '중학동', name: '범진슈퍼', address: '충청남도 공주시 먹자1길 2 (중동)', phone: '041-855-5401' },
  { no: 187, region: '중학동', name: '세븐일레븐 공주문화거리점', address: '충청남도 공주시 우체국길 22 (중동)', phone: '041-854-1919' },
  { no: 188, region: '중학동', name: '세븐일레븐 공주반죽점', address: '충청남도 공주시 감영길 1 (반죽동)', phone: '070-4229-5553' },
  { no: 189, region: '중학동', name: '세븐일레븐 공주오거리점', address: '충청남도 공주시 오거리길 14-1 (봉황동)', phone: '' },
  { no: 190, region: '중학동', name: '세븐일레븐 공주중동점', address: '충청남도 공주시 웅진로 131 (중동)', phone: '' },
  { no: 191, region: '중학동', name: '세운슈퍼', address: '충청남도 공주시 봉황로 104 (반죽동)', phone: '041-855-3203' },
  { no: 192, region: '중학동', name: '씨유 공주시청점', address: '충청남도 공주시 제민천 1길 3 (봉황동)', phone: '041-858-5783' },
  { no: 193, region: '중학동', name: '씨유 공주중동점', address: '충청남도 공주시 국고개길 6 (중동)', phone: '041-854-4195' },
  { no: 194, region: '중학동', name: '일번지상회', address: '충청남도 공주시 국고개길 57 (중동)', phone: '041-855-3147' },
  { no: 195, region: '중학동', name: '장원슈퍼', address: '충청남도 공주시 무령로 238-2 (중동)', phone: '041-856-6880' },
  { no: 196, region: '중학동', name: '현대슈퍼', address: '충청남도 공주시 충령탑길 8 (중학동)', phone: '041-856-1753' },
  { no: 197, region: '탄천면', name: '세븐일레븐 공주탄천점', address: '충청남도 공주시 탄천면 통산로 185-1', phone: '' },
  { no: 198, region: '탄천면', name: '씨유 공주탄천산업단지점', address: '충청남도 공주시 탄천면 탄천산업단지길 132', phone: '' },
  { no: 199, region: '탄천면', name: '이마트24 공주탄천산단점', address: '충청남도 공주시 탄천산업단지길 55-32', phone: '041-856-3322' },
  { no: 200, region: '탄천면', name: '탄천농협 하나로마트', address: '충청남도 공주시 탄천면 통산로 197', phone: '041-853-5153' },
];

const REGIONS = [...new Set(STORES.map((s) => s.region))];

export default function BagStorePage() {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    return STORES.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.address.toLowerCase().includes(lower) ||
        s.region.toLowerCase().includes(lower) ||
        s.phone.includes(q),
    );
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">종량제봉투 판매소</h1>
        <p className="text-sm text-gray-500 mt-1">총 200개소 (행정동·면별 정렬)</p>
      </div>

      {/* 내 위치 기반 가까운 판매소 지도 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">📍 가까운 판매소 찾기</h2>
          <p className="text-xs text-gray-400 mt-0.5">현재 위치를 기반으로 가까운 판매소 5곳을 지도에 표시합니다.</p>
        </div>
        <BagStoreMap stores={STORES} />
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold">💰 봉투 가격 안내</p>
        <div className="grid grid-cols-3 gap-1 text-xs mt-1">
          {[['5ℓ','90원'],['10ℓ','170원'],['20ℓ','320원'],['30ℓ','480원'],['50ℓ','790원'],['100ℓ','1,170원']].map(([s,p])=>(
            <div key={s} className="bg-white rounded-lg p-1.5 text-center">
              <p className="text-gray-500">{s}</p>
              <p className="font-bold text-blue-700">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상호명·주소·지역 검색 (예: 반포, GS25…)"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {isSearching ? (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">검색 결과가 없습니다.</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-1">검색 결과 {searchResults.length}개소</p>
              <div className="space-y-2">
                {searchResults.map((store) => (
                  <div key={store.no} className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{store.region}</span>
                        <p className="text-sm font-medium text-gray-800 leading-tight">{store.name}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{store.address}</p>
                    </div>
                    {store.phone ? (
                      <a href={`tel:${store.phone}`} className="text-blue-600 text-xs hover:underline flex-shrink-0 font-medium">{store.phone}</a>
                    ) : (
                      <span className="text-gray-300 text-xs flex-shrink-0">-</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        REGIONS.map((region) => {
          const stores = STORES.filter((s) => s.region === region);
          return (
            <section key={region} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{region}</span>
                <span className="text-gray-400 text-xs font-normal">{stores.length}개소</span>
              </h2>
              <div className="space-y-2">
                {stores.map((store) => (
                  <div key={store.no} className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight">{store.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight truncate">{store.address}</p>
                    </div>
                    {store.phone ? (
                      <a href={`tel:${store.phone}`} className="text-blue-600 text-xs hover:underline flex-shrink-0 font-medium">{store.phone}</a>
                    ) : (
                      <span className="text-gray-300 text-xs flex-shrink-0">-</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}

      <a href="https://www.gongju.go.kr/kr/sub06_08_06_07.do" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
        공주시청 공식 페이지 바로가기 →
      </a>
    </div>
  );
}
