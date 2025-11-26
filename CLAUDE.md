# CLAUDE.md - 로스트아크 시세 정보 프로젝트

AI 어시스턴트를 위한 코드베이스 가이드

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [아키텍처](#아키텍처)
4. [디렉토리 구조](#디렉토리-구조)
5. [핵심 기능](#핵심-기능)
6. [데이터베이스 스키마](#데이터베이스-스키마)
7. [코딩 규칙 및 패턴](#코딩-규칙-및-패턴)
8. [개발 워크플로우](#개발-워크플로우)
9. [주요 파일 가이드](#주요-파일-가이드)
10. [최적화 작업](#최적화-작업)
11. [보안 고려사항](#보안-고려사항)
12. [일반적인 작업](#일반적인-작업)

---

## 프로젝트 개요

로스트아크 게임 내 주요 아이템들의 시세를 확인하고, 경매 분배금을 계산하며, 아크그리드 젬 최적화를 제공하는 웹 애플리케이션입니다.

### 주요 특징
- **프레임워크 없는 바닐라 JavaScript**: 빠르고 가벼운 성능
- **PWA 지원**: 모바일 홈 화면 추가 가능
- **실시간 시세**: Lost Ark 공식 API를 통한 데이터 수집
- **복잡한 최적화 알고리즘**: Web Worker를 활용한 아크그리드 계산

### 사용자 대상
- 로스트아크 게임 플레이어
- 시세 정보가 필요한 유저
- 아크그리드 젬 조합 최적화가 필요한 유저

---

## 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox 기반 반응형 디자인, 다크 테마
- **JavaScript (ES Modules)**: 모던 JavaScript, 프레임워크 없음
- **Chart.js**: 가격 변동 그래프 시각화
- **Web Workers**: CPU 집약적 계산 오프로딩

### 백엔드 & 데이터베이스
- **Supabase**: BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - Edge Functions (Deno + TypeScript)
  - RPC (Remote Procedure Call)
- **Deno Runtime**: Edge Functions 실행 환경

### 외부 API
- **Lost Ark Developer API**: 공식 게임 데이터
  - 마켓 시세 조회
  - 경매장 정보
  - 캐릭터 정보

### 호스팅
- 정적 호스팅 (Netlify, Vercel, GitHub Pages 등)

### 분석 & 광고
- **Google Analytics**: gtag.js (ID: G-KPWFFY99LQ)
- **Kakao Ads**: 광고 수익화

---

## 아키텍처

### 전체 구조

```
┌─────────────┐
│   사용자     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  정적 웹 페이지 (HTML/CSS/JS)   │
│  - index.html (메인 네비게이션)  │
│  - pages/* (각 기능별 페이지)    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Supabase Client (supabase-js)  │
│  - RPC 함수 호출                 │
│  - 테이블 CRUD 작업              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│       Supabase Backend          │
│  ┌───────────────────────────┐  │
│  │  PostgreSQL Database      │  │
│  │  - items                  │  │
│  │  - price_history          │  │
│  │  - market_history         │  │
│  │  - arkgrid_data           │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Database Functions       │  │
│  │  (PostgreSQL Stored Proc) │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Edge Functions (Deno)    │  │
│  │  - fetch-market-stats     │  │
│  │  - fetch-gem-auction      │  │
│  │  - fetch-siblings         │  │
│  └───────────────────────────┘  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Lost Ark Official API          │
│  - /markets/items               │
│  - /auctions/items              │
│  - /characters/:name/siblings   │
└─────────────────────────────────┘
```

### 데이터 흐름

1. **정기 데이터 수집 (Supabase Edge Functions)**
   ```
   Cron Job 트리거
   → Edge Function 실행
   → Lost Ark API 호출 (페이지네이션)
   → 데이터 정규화
   → Supabase DB에 Upsert
   ```

2. **사용자 시세 조회**
   ```
   사용자가 카테고리 선택
   → script.js의 initialLoad() 실행
   → 카테고리에 따라 적절한 RPC 함수 호출
     - get_latest_market_prices_by_category() (신규)
     - get_latest_prices_by_category() (레거시)
   → 데이터 렌더링 (renderItems)
   → 가격순 정렬 지원
   ```

3. **아크그리드 최적화**
   ```
   사용자가 코어/젬 설정
   → arkgrid.js에서 Web Worker 생성
   → arkgrid-worker.js에서 백트래킹 알고리즘 실행
   → 최적 조합 반환
   → UI에 결과 표시
   → Supabase에 저장 옵션 제공
   ```

---

## 디렉토리 구조

```
/home/user/lostark_auction/
├── index.html              # 메인 랜딩 페이지 (카테고리 네비게이션)
├── Ads.txt                 # 광고 설정
├── README.md               # 프로젝트 README
├── .gitignore              # Git 무시 파일
│
├── css/
│   └── style.css           # 전역 스타일 (8,800+ 라인, 다크 테마)
│
├── js/
│   └── script.js           # Supabase 클라이언트 & 그리드 렌더링 로직 (171 라인)
│
├── image/                  # UI 이미지 및 아이콘
│   ├── arkgrid_ui.png
│   ├── gem_ui.png
│   └── *.png               # 코어 아이콘 (질서/혼돈 - 해/달/별)
│
├── data/
│   └── level_dungeons.json # 레벨별 던전 골드 보상 데이터 (10개 구간)
│
├── pages/                  # 기능별 페이지 디렉토리
│   ├── engraving/          # 각인서 시세 (카테고리 40000)
│   │   └── index.html
│   ├── honing/             # 재련 재료 시세 (50010, 50020)
│   │   └── index.html
│   ├── jewels/             # 보석 시세 (210000)
│   │   └── index.html
│   ├── gems/               # 젬 시세 (230000)
│   │   └── index.html
│   ├── arkgrid/            # 아크그리드 최적화 v1
│   │   ├── index.html
│   │   ├── arkgrid.js      # 메인 로직 (1,057 라인)
│   │   ├── arkgrid-worker.js # 최적화 알고리즘 (135 라인)
│   │   └── arkgrid.css     # 스타일
│   ├── arkgrid_v2/         # 아크그리드 최적화 v2 (개선 버전)
│   │   ├── index.html
│   │   ├── arkgrid_v2.js   # 메인 로직 (1,369 라인)
│   │   ├── arkgrid-worker_v2.js
│   │   └── arkgrid_v2.css
│   ├── gem-simulator/      # 젬 가공 시뮬레이터
│   │   ├── index.html
│   │   ├── simulator.js    # 확률 기반 시뮬레이션 (351 라인)
│   │   └── style.css
│   ├── auction/            # 경매 분배금 계산기
│   │   ├── index.html
│   │   └── auction.js      # 손익분기점 계산 (91 라인)
│   ├── siblings/           # 원정대 클골 조회
│   │   ├── index.html
│   │   └── siblings.js     # 캐릭터 정보 조회 (80+ 라인)
│   └── detail/             # 아이템 상세 페이지
│       ├── index.html
│       └── detail.js       # 가격 히스토리 차트 (100+ 라인)
│
└── supabase/               # Supabase 관련 파일
    ├── sql/
    │   └── schema.sql      # 데이터베이스 스키마 정의
    ├── database_function/  # PostgreSQL Stored Procedures
    │   ├── get_latest_prices_by_category.sql
    │   ├── get_latest_market_prices_by_category.sql
    │   ├── get_market_history_by_item_id.sql
    │   └── get_item_details_by_id.sql
    └── edge_functions/     # Deno Edge Functions (TypeScript)
        ├── fetch-market-stats/
        │   ├── index_40000.ts    # 각인서 데이터 수집
        │   ├── index_230000.ts   # 젬 데이터 수집
        │   └── index_500X0.ts    # 재련 재료 데이터 수집
        ├── fetch-gem-auction-price/
        │   └── index.ts          # 보석 경매 데이터 수집
        └── fetch-siblings/
            └── index.ts          # 캐릭터 정보 조회
```

---

## 핵심 기능

### 1. 시세 정보 조회

**위치**: `pages/engraving/`, `pages/honing/`, `pages/jewels/`, `pages/gems/`

**동작 방식**:
- `js/script.js`가 각 페이지에서 공통으로 사용됨
- HTML의 `data-page-category` 속성으로 카테고리 구분
- 카테고리에 따라 적절한 데이터베이스 함수 호출:
  - **신규 (market_history)**: 40000, 230000, 50010, 50020
  - **레거시 (price_history)**: 기타

**주요 기능**:
- 가격순 정렬 (오름차순/내림차순)
- 가격 변동 표시 (상승/하락/동일) with 화살표 아이콘
- 등급별 색상 코딩 (일반~에스더)
- 아이템 클릭 시 상세 페이지 이동

### 2. 아크그리드 젬 최적화 ⭐

**위치**: `pages/arkgrid/` (v1), `pages/arkgrid_v2/` (v2)

**문제 정의**:
- 6개의 코어 슬롯 (질서 3개 + 혼돈 3개)
- 각 코어는 의지력 예산 내에서 최대 4개의 젬 장착 가능
- 목표: 특정 활성 포인트를 달성하거나 최대 포인트 달성

**알고리즘** (`arkgrid-worker.js`):

```javascript
// 1단계: 조합 생성
findAllPossibleCombinations(core, availableGems)
- 백트래킹으로 모든 유효한 젬 조합 생성
- 제약: gem.willpower ≤ core.willpower
- 최대 4개 젬까지 조합
- 반환: [{ gems: [...], points: 총점, willpower: 사용량 }]

// 2단계: 최적화
solve(coreIndex, currentAssignment, currentScore, usedGemIds, maxPossibleFutureScore)
- 백트래킹 탐색: 각 코어에 조합 할당 OR 스킵
- 가지치기: currentScore + remainingMax ≤ bestScore이면 중단
- 충돌 감지: 동일 젬은 여러 코어에 사용 불가
- 타임아웃: 5초 제한으로 점진적 결과 반환
```

**최적화 기법**:
1. **휴리스틱 정렬**: 조합을 포인트 내림차순으로 정렬 → 더 나은 분기 우선 탐색
2. **미래 예측 가지치기**: 각 코어별 최대 가능 포인트 사전 계산
3. **Web Worker 오프로딩**: 메인 스레드 블로킹 방지
4. **젬 중복 제거**: Set 기반 사용 젬 ID 추적

**UI 기능**:
- 탭 기반 코어 선택 (질서/혼돈)
- 등급 선택 → 의지력 및 활성 포인트 옵션 자동 표시
- 목표 포인트 설정
- 젬 목록 관리 (추가/수정/삭제)
- 저장/불러오기 (Supabase, 비밀번호 보호)
- 결과 색상 코딩 (목표 미달성 시 경고)

**v2 개선 사항**:
- 직업 선택 기능 추가 (추정)
- 확장된 UI (1,369 라인 vs 1,057 라인)

### 3. 젬 가공 시뮬레이터

**위치**: `pages/gem-simulator/`

**기능**:
- 젬 가공 확률 시뮬레이션
- 28가지 처리 옵션 (의지력/포인트/효과 변경)
- 등급별 차이:
  - 고급: 5회 시도, 0회 재선택
  - 희귀: 7회 시도, 1회 재선택
  - 영웅: 9회 시도, 2회 재선택

**확률 모델**:
```javascript
PROCESSING_OPTIONS: [
  { willpower: 1, probability: 0.15 },    // 의지력 +1 (15%)
  { willpower: -1, probability: 0.10 },   // 의지력 -1 (10%)
  { points: 2, probability: 0.05 },       // 포인트 +2 (5%)
  // ... 총 28가지
]
```

### 4. 경매 분배금 계산기

**위치**: `pages/auction/`

**공식**:
```javascript
최적 입찰가 = (시세 / 인원 수) × (인원 수 - 1)
손익분기점 = 최적 입찰가 × 0.95
리스크 계층 = 손익분기점 / (1 + 마진%)
// 마진: 2.5%, 5%, 7.5%, 10%
```

**UX**:
- 클릭 시 클립보드 복사
- 토스트 알림 (2초 자동 사라짐)

### 5. 아이템 상세 페이지

**위치**: `pages/detail/`

**표시 정보**:
- 아이템 메타데이터 (등급, 아이콘, 카테고리)
- 가격 히스토리 차트 (Chart.js)
- 최근 업데이트 시간 (KST)
- 거래량 (market_history의 경우)

**데이터 소스 분기**:
- market_history 카테고리 → 일일 스냅샷 with trade_count
- 레거시 카테고리 → 시간별 price_history

### 6. 원정대 클골 조회

**위치**: `pages/siblings/`

**동작**:
1. Lost Ark API로 캐릭터명 검색
2. 원정대 캐릭터 목록 반환
3. `level_dungeons.json`과 교차 참조
4. 레벨별 골드 보상 계산
5. 아이템 레벨 내림차순 → 이름 순 정렬

---

## 데이터베이스 스키마

### 테이블 구조

#### 1. `items` - 아이템 마스터

```sql
CREATE TABLE items (
    id            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_code     TEXT UNIQUE NOT NULL,  -- Lost Ark API 고유 코드
    item_name     TEXT NOT NULL,
    category_code INTEGER NOT NULL,      -- 카테고리 코드
    icon_path     TEXT,                  -- CDN URL
    grade         TEXT                   -- 등급 (일반~에스더)
);
```

**카테고리 코드**:
- `40000`: 각인서
- `50010`, `50020`: 재련 재료
- `210000`: 보석 (4티어)
- `230000`: 젬

**등급**:
일반, 고급, 희귀, 영웅, 전설, 유물, 고대, 에스더

#### 2. `price_history` - 실시간 가격 기록

```sql
CREATE TABLE price_history (
    id        BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id   BIGINT REFERENCES items(id) ON DELETE CASCADE,
    price     INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_price_history_item_id_timestamp
    ON price_history (item_id, timestamp DESC);
```

**용도**: 레거시 시세 조회, 고빈도 업데이트

#### 3. `market_history` - 일일 시세 스냅샷

```sql
CREATE TABLE market_history (
    id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id     BIGINT REFERENCES items(id) ON DELETE CASCADE,
    avg_price   REAL NOT NULL,
    trade_count INTEGER NOT NULL,
    date        DATE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(item_id, date)
);

CREATE INDEX idx_market_history_item_id_date
    ON market_history(item_id, date DESC);
```

**용도**: 신규 시세 조회, 일일 1회 스냅샷, 거래량 포함

#### 4. `arkgrid_data` - 아크그리드 사용자 데이터

```sql
CREATE TABLE arkgrid_data (
    id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    character_name TEXT NOT NULL UNIQUE,
    password       TEXT NOT NULL,           -- ⚠️ 평문 저장 (보안 문제)
    arkgrid_config JSONB NOT NULL,          -- 젬/코어 설정
    created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 자동 updated_at 업데이트 트리거
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON arkgrid_data
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
```

**arkgrid_config 구조**:
```json
{
  "orderGems": [
    { "id": 1, "willpower": 3, "points": 5 }
  ],
  "chaosGems": [
    { "id": 2, "willpower": 4, "points": 6 }
  ],
  "selectedCores": {
    "order1": { "grade": "영웅", "willpower": 15, "targetPoints": 10 },
    "order2": { ... },
    "chaos1": { ... }
  }
}
```

### 데이터베이스 함수

#### 1. `get_latest_prices_by_category(p_category_codes INTEGER[])`

**목적**: 레거시 카테고리의 최신 가격 조회

**반환**:
- 최신 가격
- 이전일 가격
- 가격 변동량
- 변동 방향 (up/down/same)

**정렬**: item_name 오름차순

#### 2. `get_latest_market_prices_by_category(p_category_codes INTEGER[])`

**목적**: market_history 테이블 사용 카테고리의 최신 가격 조회

**반환**:
- 최근 날짜의 평균 가격
- 이전 날짜의 평균 가격
- 가격 변동량
- 변동 방향

**장점**: 대용량 데이터에 효율적

#### 3. `get_market_history_by_item_id(p_item_id BIGINT)`

**목적**: 특정 아이템의 가격 히스토리 조회

**반환**: date, avg_price, trade_count (시간순)

**사용처**: Chart.js 그래프 시각화

#### 4. `get_item_details_by_id(p_item_id BIGINT)`

**목적**: 아이템 메타데이터 조회

**반환**: id, item_name, icon_path, grade, category_code

---

## 코딩 규칙 및 패턴

### JavaScript 규칙

#### 모듈 시스템
```javascript
// ES Modules 사용
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
```

#### 초기화 패턴
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // 초기화 로직
    await initialLoad();
});
```

#### 네이밍 컨벤션

**상수**: UPPER_SNAKE_CASE
```javascript
const SUPABASE_URL = 'https://...';
const MAX_GEMS_PER_CORE = 4;
const GEM_IMAGES = { ... };
```

**함수**: camelCase
```javascript
function calculateAndDisplay() { }
async function fetchData() { }
```

**HTML ID/Class**: kebab-case
```html
<div id="calculate-btn" class="nav-button"></div>
```

**Data Attributes**: data-{kebab-case}
```html
<div data-page-category="40000" data-tab="order"></div>
```

#### 상태 관리
```javascript
// 모듈 스코프 변수
let orderGems = [];
let chaosGems = [];
let nextGemId = 1;
const selectedCores = {};
```

#### DOM 조작
```javascript
// 직접 querySelector 사용
const element = document.getElementById('item-id');
const elements = document.querySelectorAll('.class-name');

// innerHTML 할당
element.innerHTML = `<div>${content}</div>`;
```

### CSS 규칙

#### 색상 스키마 (다크 테마)
```css
--background: #121212;      /* 다크 그레이 */
--text: #E0E0E0;            /* 라이트 그레이 */
--accent: #C89B3C;          /* 골드/옐로우 */
--border: #333333;          /* 다크 보더 */
```

#### 아이템 등급 색상
```javascript
const GRADE_COLORS = {
    "일반": "#a5a5a5",    // 그레이
    "고급": "#6bbd00",    // 그린
    "희귀": "#00b0fa",    // 블루
    "영웅": "#ba00f9",    // 퍼플
    "전설": "#f99200",    // 오렌지
    "유물": "#fa5d00",    // 레드오렌지
    "고대": "#B3956C",    // 브론즈
    "에스더": "#14c5b9"   // 시안
};
```

#### 레이아웃
```css
/* Flexbox 기반 */
display: flex;
gap: 16px;
max-width: 1200px;
margin: 0 auto;
padding: 24px;
```

### UI 컴포넌트 패턴

#### 커스텀 드롭다운
```javascript
createCustomDropdown(id, defaultText, items, onSelect) {
    // 외부 라이브러리 없이 직접 구현
    // 이벤트 위임으로 옵션 클릭 처리
    // document 클릭으로 닫기 처리
}
```

#### 모달 다이얼로그
```javascript
// .modal-overlay with display: none/flex
function showModal() {
    modal.style.display = 'flex';
}

// 외부 클릭으로 닫기
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
});
```

#### 탭 전환
```javascript
// data-tab 속성 사용
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        // 모든 탭 비활성화
        // 선택된 탭 활성화
    });
});
```

### 에러 처리

#### 프론트엔드
```javascript
try {
    const { data, error } = await supabase.rpc('function_name', params);
    if (error) throw error;
    // 성공 처리
} catch (error) {
    console.error('에러:', error);
    alert(`오류가 발생했습니다: ${error.message}`);
}
```

#### Edge Functions
```typescript
try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`API 요청 실패. Status: ${response.status}`);
        continue; // 다음 항목으로 계속
    }
    // 성공 처리
} catch (e) {
    console.error(`예외 발생: ${e.message}`);
    // Graceful degradation
}
```

### 데이터베이스 작업

#### Upsert 패턴
```javascript
const { data, error } = await supabase
    .from('items')
    .upsert({
        item_code: code,
        item_name: name,
        // ...
    }, {
        onConflict: 'item_code'  // 충돌 시 업데이트
    })
    .select('id')
    .single();
```

#### RPC 호출
```javascript
const { data, error } = await supabase
    .rpc('get_latest_market_prices_by_category', {
        p_category_codes: [40000, 230000]
    });
```

---

## 개발 워크플로우

### Git 워크플로우

#### 브랜치 전략
- **메인 브랜치**: (현재 브랜치명 확인 필요)
- **기능 브랜치**: `claude/claude-md-mifihxi0jfe9k88h-01AEjMZbSehSdbrXE5aAy1pP`

#### 커밋 메시지 규칙
```
type(scope): 설명

Types:
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- docs: 문서 변경
- style: 코드 포맷팅
- test: 테스트 추가
```

**최근 커밋 예시**:
```
fix(arkgrid): 아크그리드 최적화 로직의 다중 결함 최종 수정
refactor(arkgrid): 아크그리드 최적화 계산 로직 개선
feat: 일일 시세 조회 및 표시 기능 완성
```

### 로컬 개발

#### 1. 정적 서버 실행
```bash
# Python 3
python3 -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# VS Code Live Server 확장
# index.html 우클릭 → "Open with Live Server"
```

#### 2. Supabase 설정

**필수 환경 변수** (`js/script.js`에 하드코딩됨):
```javascript
const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...'; // JWT 토큰
```

⚠️ **보안 경고**: 프론트엔드에 자격증명 노출. RLS(Row Level Security) 필수.

#### 3. Edge Functions 로컬 테스트

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작
supabase start

# 함수 실행
supabase functions serve fetch-market-stats

# 함수 테스트
curl -X POST http://localhost:54321/functions/v1/fetch-market-stats \
  -H "Authorization: Bearer $ANON_KEY"
```

### 배포

#### 1. Edge Functions 배포
```bash
# 특정 함수 배포
supabase functions deploy fetch-market-stats

# 환경 변수 설정
supabase secrets set LOSTARK_API_KEY=your_key_here
```

#### 2. 정적 파일 배포

**Netlify**:
```toml
# netlify.toml
[build]
  publish = "."
  command = "echo 'No build required'"
```

**Vercel**:
```json
{
  "version": 2,
  "builds": [
    { "src": "**/*", "use": "@vercel/static" }
  ]
}
```

**GitHub Pages**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

---

## 주요 파일 가이드

### 프론트엔드 핵심

#### `js/script.js` (171 라인)

**역할**: 시세 조회 페이지의 공통 로직

**주요 함수**:
```javascript
// Supabase 클라이언트 초기화
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 페이지 로드 시 실행
async function initialLoad() {
    const categoryAttr = document.body.dataset.pageCategory;
    const categories = categoryAttr.split(',').map(Number);

    // 카테고리별 적절한 RPC 함수 선택
    if (isMarketHistoryCategory(categories)) {
        data = await supabase.rpc('get_latest_market_prices_by_category', ...);
    } else {
        data = await supabase.rpc('get_latest_prices_by_category', ...);
    }

    renderItems(data);
}

// 그리드 렌더링
function renderItems(items) {
    // 등급별 색상 적용
    // 가격 변동 아이콘 표시
    // 클릭 시 상세 페이지 이동
}

// 정렬 토글
function toggleSort() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    // 재렌더링
}
```

**사용 페이지**: engraving, honing, jewels, gems

#### `pages/arkgrid/arkgrid.js` (1,057 라인)

**역할**: 아크그리드 최적화 메인 로직

**핵심 상수**:
```javascript
const ARKGRID_CORE_TYPES = {
    order: ['order1', 'order2', 'order3'],
    chaos: ['chaos1', 'chaos2', 'chaos3']
};

const ARKGRID_GRADE_DATA = {
    "영웅": { willpower: 15, points: [5, 8, 10, 12, 15] },
    "전설": { willpower: 20, points: [6, 10, 12, 15, 18, 20] },
    // ...
};

const MAX_GEMS_PER_CORE = 4;
```

**주요 함수**:
```javascript
// 최적화 실행
async function runOptimization() {
    const worker = new Worker('arkgrid-worker.js');

    worker.postMessage({
        orderGems, chaosGems, selectedCores
    });

    worker.onmessage = (e) => {
        displayResults(e.data.bestAssignment);
    };
}

// 젬 추가
function addGem(type) {
    const gem = {
        id: nextGemId++,
        willpower: parseInt(willpowerInput.value),
        points: parseInt(pointsInput.value)
    };

    if (type === 'order') {
        orderGems.push(gem);
    } else {
        chaosGems.push(gem);
    }

    renderGemList();
}

// 저장/불러오기
async function saveConfiguration() {
    const { data, error } = await supabase
        .from('arkgrid_data')
        .upsert({
            character_name: characterName,
            password: password, // ⚠️ 평문
            arkgrid_config: { orderGems, chaosGems, selectedCores }
        });
}
```

#### `pages/arkgrid/arkgrid-worker.js` (135 라인)

**역할**: 백트래킹 최적화 알고리즘

**핵심 알고리즘**:
```javascript
// 조합 생성
function findAllPossibleCombinations(core, availableGems) {
    const result = [];

    function backtrack(index, current, willpowerUsed, pointsSum) {
        if (current.length > MAX_GEMS_PER_CORE) return;
        if (willpowerUsed > core.willpower) return;

        // 현재 조합 저장
        result.push({
            gems: [...current],
            points: pointsSum,
            willpower: willpowerUsed
        });

        // 다음 젬 시도
        for (let i = index; i < availableGems.length; i++) {
            const gem = availableGems[i];
            backtrack(
                i + 1,
                [...current, gem],
                willpowerUsed + gem.willpower,
                pointsSum + gem.points
            );
        }
    }

    backtrack(0, [], 0, 0);

    // 포인트 내림차순 정렬 (휴리스틱)
    return result.sort((a, b) => b.points - a.points);
}

// 최적화 솔버
function solve(coreIndex, currentAssignment, currentScore, usedGemIds, maxPossibleFutureScore) {
    // 종료 조건
    if (coreIndex === allCores.length) {
        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestAssignment = currentAssignment;
        }
        return;
    }

    // 타임아웃 체크
    if (Date.now() - startTime > TIMEOUT) return;

    // 가지치기
    if (currentScore + maxPossibleFutureScore <= bestScore) return;

    const core = allCores[coreIndex];
    const combinations = possibleCombinations[core.id];

    // 각 조합 시도
    for (const combo of combinations) {
        // 젬 충돌 체크
        const hasConflict = combo.gems.some(g => usedGemIds.has(g.id));
        if (hasConflict) continue;

        // 목표 포인트 체크
        if (core.targetPoints && combo.points < core.targetPoints) continue;

        // 재귀 호출
        const newUsedGemIds = new Set([...usedGemIds, ...combo.gems.map(g => g.id)]);
        solve(
            coreIndex + 1,
            { ...currentAssignment, [core.id]: combo },
            currentScore + combo.points,
            newUsedGemIds,
            maxPossibleFutureScore - maxPointsPerCore[coreIndex]
        );
    }

    // 코어 스킵 옵션
    solve(
        coreIndex + 1,
        currentAssignment,
        currentScore,
        usedGemIds,
        maxPossibleFutureScore - maxPointsPerCore[coreIndex]
    );
}
```

### 백엔드 핵심

#### `supabase/edge_functions/fetch-market-stats/index_40000.ts`

**역할**: 각인서 시세 데이터 수집

**주요 로직**:
```typescript
// 페이지네이션으로 모든 아이템 수집
async function fetchAllItemsForCategory(categoryCode: number, apiAuthHeader: string) {
    let allItems = [];
    let pageNo = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(`${LOSTARK_API_BASE_URL}/markets/items`, {
            method: 'POST',
            headers: {
                'authorization': apiAuthHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "CategoryCode": categoryCode,
                "PageNo": pageNo,
                "Sort": "GRADE",
                "ItemGrade": "유물", // 또는 전체
            }),
        });

        const data = await response.json();
        const items = data.Items || [];

        if (items.length === 0) {
            hasMore = false;
        } else {
            allItems = allItems.concat(items);
            pageNo++;
            await new Promise(resolve => setTimeout(resolve, 200)); // 레이트 리밋
        }
    }

    return allItems;
}

// 각 아이템 처리
async function processSingleItem(item, supabaseClient, apiAuthHeader, categoryCode) {
    // 1. items 테이블에 Upsert
    const { data: itemData } = await supabaseClient
        .from('items')
        .upsert({
            item_code: String(item.Id),
            item_name: item.Name,
            category_code: categoryCode,
            icon_path: item.Icon,
            grade: item.Grade,
        }, { onConflict: 'item_code' })
        .select('id')
        .single();

    // 2. 상세 통계 조회
    const statsResponse = await fetch(`${LOSTARK_API_BASE_URL}/markets/items/${item.Id}`, ...);
    const stats = await statsResponse.json();

    // 3. market_history에 저장
    await supabaseClient
        .from('market_history')
        .upsert({
            item_id: itemData.id,
            avg_price: stats[0].Stats[0].AvgPrice,
            trade_count: stats[0].Stats[0].TradeCount,
            date: stats[0].Stats[0].Date,
        }, { onConflict: 'item_id,date' });
}
```

**환경 변수**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOSTARK_API_KEY`

#### `supabase/database_function/get_latest_market_prices_by_category.sql`

**역할**: 카테고리별 최신 시세 조회 (신규 버전)

**SQL 로직**:
```sql
CREATE OR REPLACE FUNCTION get_latest_market_prices_by_category(p_category_codes INTEGER[])
RETURNS TABLE (
    item_id BIGINT,
    item_name TEXT,
    icon_path TEXT,
    grade TEXT,
    category_code INTEGER,
    current_price REAL,
    previous_price REAL,
    price_change REAL,
    change_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_dates AS (
        -- 최근 2개 날짜 찾기
        SELECT DISTINCT date
        FROM market_history
        ORDER BY date DESC
        LIMIT 2
    ),
    current_prices AS (
        -- 최신 날짜 가격
        SELECT mh.item_id, mh.avg_price
        FROM market_history mh
        WHERE mh.date = (SELECT MAX(date) FROM latest_dates)
    ),
    previous_prices AS (
        -- 이전 날짜 가격
        SELECT mh.item_id, mh.avg_price
        FROM market_history mh
        WHERE mh.date = (SELECT MIN(date) FROM latest_dates)
    )
    SELECT
        i.id,
        i.item_name,
        i.icon_path,
        i.grade,
        i.category_code,
        cp.avg_price AS current_price,
        pp.avg_price AS previous_price,
        (cp.avg_price - pp.avg_price) AS price_change,
        CASE
            WHEN cp.avg_price > pp.avg_price THEN 'up'
            WHEN cp.avg_price < pp.avg_price THEN 'down'
            ELSE 'same'
        END AS change_direction
    FROM items i
    LEFT JOIN current_prices cp ON i.id = cp.item_id
    LEFT JOIN previous_prices pp ON i.id = pp.item_id
    WHERE i.category_code = ANY(p_category_codes)
    ORDER BY i.item_name;
END;
$$ LANGUAGE plpgsql;
```

---

## 최적화 작업

### 최근 아크그리드 최적화 (Git 히스토리 기반)

#### 1. 정렬 우선순위 변경 (751d8e5)
- **목적**: 더 나은 휴리스틱으로 빠른 최적 솔루션 발견
- **변경**: 조합을 포인트 내림차순으로 정렬
- **효과**: 백트래킹 초반에 좋은 솔루션 발견 → 더 많은 가지치기

#### 2. 가지치기 로직 수정 (90b227b)
- **목적**: 불필요한 탐색 공간 제거
- **구현**:
  ```javascript
  // 미래 최대 가능 점수 사전 계산
  const maxPointsPerCore = cores.map(core =>
      Math.max(...possibleCombinations[core.id].map(c => c.points))
  );

  // 가지치기 조건
  if (currentScore + remainingMaxScore <= bestScore) {
      return; // 이 분기 탐색 중단
  }
  ```

#### 3. 타임아웃 시간 증가 (fe9b3d5)
- **변경**: 3초 → 5초
- **이유**: 복잡한 조합에서 최적해 발견 확률 증가
- **트레이드오프**: UX와 정확성의 균형

#### 4. 다중 결함 수정 (4b9c1a2, e901634)
- 젬 충돌 감지 버그
- 목표 포인트 체크 로직 오류
- 엣지 케이스 처리

### 성능 최적화 기법

#### 1. Web Worker 사용
- **문제**: 백트래킹 알고리즘이 메인 스레드 블로킹
- **해결**: arkgrid-worker.js로 오프로딩
- **효과**: UI 반응성 유지, 5초간 계산 가능

#### 2. 인덱스 최적화
```sql
-- 가격 조회 빈도가 높은 컬럼에 인덱스
CREATE INDEX idx_price_history_item_id_timestamp
    ON price_history (item_id, timestamp DESC);

CREATE INDEX idx_market_history_item_id_date
    ON market_history(item_id, date DESC);
```

#### 3. API 레이트 리밋 대응
```typescript
// 페이지네이션 사이에 200ms 지연
for (const page of pages) {
    await fetchPage(page);
    await new Promise(resolve => setTimeout(resolve, 200));
}
```

#### 4. 데이터 중복 제거
- `UNIQUE(item_id, date)` 제약으로 일일 시세 중복 방지
- `item_code UNIQUE` 제약으로 아이템 중복 방지

---

## 보안 고려사항

### ⚠️ 현재 보안 문제

#### 1. 프론트엔드 자격증명 노출
```javascript
// js/script.js
const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...'; // 공개 노출
```

**위험**:
- Anon Key가 클라이언트 코드에 하드코딩
- 악의적 사용자가 직접 API 호출 가능

**완화 방법**:
- Supabase RLS (Row Level Security) 설정 필수
- 읽기 전용 정책 적용
- 민감한 작업은 Edge Function으로 이동

#### 2. 평문 비밀번호 저장
```sql
CREATE TABLE arkgrid_data (
    password TEXT NOT NULL  -- ⚠️ 평문
);
```

**위험**:
- 데이터베이스 침해 시 모든 비밀번호 노출
- 사용자 계정 보안 취약

**권장 해결책**:
```javascript
// 프론트엔드에서 해싱
import bcrypt from 'bcryptjs';

async function saveConfiguration() {
    const hashedPassword = await bcrypt.hash(password, 10);

    await supabase.from('arkgrid_data').upsert({
        character_name: characterName,
        password: hashedPassword,
        arkgrid_config: config
    });
}

async function loadConfiguration() {
    const { data } = await supabase
        .from('arkgrid_data')
        .select('*')
        .eq('character_name', characterName)
        .single();

    const isValid = await bcrypt.compare(password, data.password);
    if (!isValid) throw new Error('비밀번호가 일치하지 않습니다');

    return data.arkgrid_config;
}
```

#### 3. CORS 전체 허용
```typescript
// Edge Functions
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',  // 모든 도메인 허용
};
```

**위험**: CSRF 공격 가능성

**개선**:
```typescript
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://yourdomain.com',
    'Access-Control-Allow-Credentials': 'true',
};
```

### ✅ 권장 보안 모범 사례

#### 1. Supabase RLS 정책 설정
```sql
-- items 테이블: 모든 사용자 읽기 가능
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON items
    FOR SELECT USING (true);

-- arkgrid_data: 본인 데이터만 접근
ALTER TABLE arkgrid_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own data" ON arkgrid_data
    FOR ALL USING (auth.uid() = user_id);
```

#### 2. 환경 변수 관리
```javascript
// ❌ 나쁜 예
const API_KEY = 'hardcoded_key';

// ✅ 좋은 예
const API_KEY = import.meta.env.VITE_API_KEY;
```

#### 3. XSS 방지
```javascript
// ❌ 나쁜 예
element.innerHTML = userInput;

// ✅ 좋은 예
element.textContent = userInput;

// 또는 DOMPurify 사용
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

---

## 일반적인 작업

### 새로운 카테고리 추가

#### 1. Edge Function 생성
```typescript
// supabase/edge_functions/fetch-market-stats/index_XXXXX.ts
serve(async (req) => {
    const CATEGORY_CODE = 60000; // 새 카테고리

    // 기존 로직 복사 및 수정
    const items = await fetchAllItemsForCategory(CATEGORY_CODE, apiAuthHeader);

    for (const item of items) {
        await processSingleItem(item, supabaseClient, apiAuthHeader, CATEGORY_CODE);
    }
});
```

#### 2. 페이지 생성
```html
<!-- pages/new-category/index.html -->
<!DOCTYPE html>
<html lang="ko">
<head>
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body data-page-category="60000">
    <div id="items-container"></div>
    <script type="module" src="../../js/script.js"></script>
</body>
</html>
```

#### 3. 메인 네비게이션 업데이트
```html
<!-- index.html -->
<a href="pages/new-category/" class="nav-button">
    <img src="icon.png" alt="새 카테고리">
    새 카테고리
</a>
```

### 새로운 데이터베이스 함수 추가

#### 1. SQL 작성
```sql
-- supabase/database_function/new_function.sql
CREATE OR REPLACE FUNCTION get_top_selling_items(p_limit INTEGER)
RETURNS TABLE (
    item_name TEXT,
    total_trades BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.item_name,
        SUM(mh.trade_count) AS total_trades
    FROM items i
    JOIN market_history mh ON i.id = mh.item_id
    GROUP BY i.item_name
    ORDER BY total_trades DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

#### 2. Supabase에 배포
- SQL Editor에서 실행
- 또는 마이그레이션 파일로 관리

#### 3. 프론트엔드에서 호출
```javascript
const { data, error } = await supabase
    .rpc('get_top_selling_items', { p_limit: 10 });
```

### 새로운 UI 기능 추가

#### 1. HTML 마크업
```html
<div class="new-feature">
    <button id="feature-btn">새 기능</button>
    <div id="feature-result"></div>
</div>
```

#### 2. CSS 스타일
```css
.new-feature {
    background: var(--background);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
}

#feature-btn {
    background: var(--accent);
    color: var(--background);
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
```

#### 3. JavaScript 로직
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('feature-btn');
    const result = document.getElementById('feature-result');

    btn.addEventListener('click', async () => {
        try {
            // 기능 실행
            const data = await fetchData();
            result.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            result.textContent = `오류: ${error.message}`;
        }
    });
});
```

### 버그 수정 워크플로우

#### 1. 문제 재현
```javascript
// 재현 케이스 작성
console.log('Input:', input);
console.log('Expected:', expected);
console.log('Actual:', actual);
```

#### 2. 원인 파악
- Chrome DevTools 사용
- Console 로그 확인
- Network 탭에서 API 응답 확인
- Supabase 로그 확인

#### 3. 수정 및 테스트
```javascript
// 수정 전
function buggyFunction(input) {
    return input.map(x => x.value); // input이 null일 수 있음
}

// 수정 후
function fixedFunction(input) {
    if (!input || !Array.isArray(input)) {
        console.warn('Invalid input:', input);
        return [];
    }
    return input.map(x => x?.value).filter(Boolean);
}
```

#### 4. 커밋
```bash
git add .
git commit -m "fix(scope): 설명

- 문제 상황
- 원인
- 해결 방법"
```

### 성능 최적화 체크리스트

#### 프론트엔드
- [ ] 불필요한 DOM 조작 최소화
- [ ] 이벤트 위임 사용
- [ ] 디바운싱/쓰로틀링 적용
- [ ] 이미지 레이지 로딩
- [ ] CSS 애니메이션 (JS 대신)

#### 백엔드
- [ ] 적절한 인덱스 설정
- [ ] N+1 쿼리 방지
- [ ] 페이지네이션 구현
- [ ] 캐싱 전략 수립
- [ ] API 레이트 리밋 준수

#### 알고리즘
- [ ] 시간 복잡도 분석
- [ ] 메모이제이션 적용
- [ ] 불필요한 계산 제거
- [ ] 가지치기 최적화
- [ ] 타임아웃 설정

---

## AI 어시스턴트 작업 가이드

### 코드 읽기 시 주의사항

1. **카테고리 코드 확인**:
   - 40000 = 각인서
   - 50010, 50020 = 재련 재료
   - 210000 = 보석
   - 230000 = 젬

2. **데이터 소스 확인**:
   - market_history: 신규 카테고리 (일일 스냅샷)
   - price_history: 레거시 카테고리 (실시간)

3. **파일 의존성**:
   - 시세 페이지 → `js/script.js` 의존
   - 아크그리드 → Web Worker 필요
   - 모든 페이지 → Supabase 클라이언트 필요

### 코드 수정 시 주의사항

1. **기존 패턴 유지**:
   - 네이밍 컨벤션 준수
   - 에러 처리 방식 일관성
   - 코드 스타일 통일

2. **하위 호환성**:
   - 데이터베이스 스키마 변경 시 마이그레이션 고려
   - API 변경 시 기존 호출 지점 확인

3. **보안 고려**:
   - 사용자 입력 검증
   - SQL 인젝션 방지 (Parameterized queries)
   - XSS 방지 (textContent 우선)

4. **성능 고려**:
   - 대량 데이터 처리 시 페이지네이션
   - CPU 집약적 작업은 Web Worker
   - 적절한 인덱스 확인

### 디버깅 팁

1. **프론트엔드**:
```javascript
// 상태 확인
console.log('State:', { orderGems, chaosGems, selectedCores });

// 함수 실행 시간 측정
console.time('optimization');
await runOptimization();
console.timeEnd('optimization');

// 네트워크 요청 확인
const { data, error } = await supabase.rpc('function_name', params);
console.log('RPC Result:', { data, error });
```

2. **Edge Functions**:
```typescript
// 환경 변수 확인
console.log('Env:', {
    url: Deno.env.get('SUPABASE_URL'),
    hasKey: !!Deno.env.get('LOSTARK_API_KEY')
});

// API 응답 로깅
console.log('API Response:', await response.json());
```

3. **데이터베이스**:
```sql
-- 쿼리 성능 분석
EXPLAIN ANALYZE
SELECT * FROM items WHERE category_code = 40000;

-- 인덱스 사용 확인
SELECT * FROM pg_indexes WHERE tablename = 'items';
```

### 일반적인 실수 방지

1. **Async/Await 누락**:
```javascript
// ❌ 잘못된 예
function fetchData() {
    const data = supabase.rpc('function'); // Promise 반환
    return data; // Promise 객체 그대로 반환
}

// ✅ 올바른 예
async function fetchData() {
    const { data } = await supabase.rpc('function');
    return data;
}
```

2. **Null 체크 누락**:
```javascript
// ❌ 잘못된 예
const price = item.price_history[0].price; // price_history가 비어있을 수 있음

// ✅ 올바른 예
const price = item.price_history?.[0]?.price ?? 0;
```

3. **이벤트 리스너 중복 등록**:
```javascript
// ❌ 잘못된 예
function setupListeners() {
    btn.addEventListener('click', handler); // 여러 번 호출 시 중복
}

// ✅ 올바른 예
function setupListeners() {
    btn.removeEventListener('click', handler);
    btn.addEventListener('click', handler);
}

// 또는
let isListenerAdded = false;
function setupListeners() {
    if (!isListenerAdded) {
        btn.addEventListener('click', handler);
        isListenerAdded = true;
    }
}
```

---

## 마무리

이 문서는 로스트아크 시세 정보 프로젝트의 포괄적인 가이드입니다.

### 핵심 원칙
- **단순성 유지**: 프레임워크 없이 바닐라 JavaScript 사용
- **성능 우선**: Web Worker, 인덱스, 알고리즘 최적화
- **사용자 경험**: 빠른 로딩, 직관적 UI, 명확한 피드백
- **데이터 무결성**: 적절한 제약 조건, 에러 처리

### 추가 리소스
- [Supabase 문서](https://supabase.com/docs)
- [Lost Ark Developer API](https://developer-lostark.game.onstove.com/)
- [Chart.js 문서](https://www.chartjs.org/docs/)
- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

### 연락처
프로젝트 관련 문의는 GitHub Issues를 통해 제출해주세요.

---

**마지막 업데이트**: 2025-11-26
**문서 버전**: 1.0.0
