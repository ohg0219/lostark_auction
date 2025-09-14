# 로스트아크 시세 정보 (Lost Ark Market Price Information)

이 프로젝트는 로스트아크(Lost Ark) 게임 내 주요 아이템들의 시세를 확인하고, 경매 분배금을 계산할 수 있는 웹 애플리케이션입니다. PWA(Progressive Web App)로 구현되어 모바일 기기에서도 홈 화면에 추가하여 네이티브 앱처럼 사용할 수 있습니다.

## 주요 기능

- **카테고리별 시세 정보 제공**:
  - 각인서
  - 재련 재료
  - 보석
  - 젬
- **가격순 정렬**: 아이템을 가격순(오름차순/내림차순)으로 정렬하여 볼 수 있습니다.
- **경매 분배금 계산기**: 경매장에서 아이템을 낙찰받을 때의 손익분기점과 적정 입찰가를 계산합니다. (현재 비활성화 상태)
- **PWA 지원**: 웹 앱을 휴대폰 홈 화면에 추가하여 빠르고 편리하게 접근할 수 있습니다.

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript (ESM)
- **Backend & Database**: [Supabase](https://supabase.io/)
  - **Database**: PostgreSQL
  - **Edge Functions**: Deno (TypeScript) - 외부 API에서 데이터를 가져와 데이터베이스를 업데이트합니다.
- **Hosting**: 정적 호스팅이 가능한 모든 플랫폼 (e.g., Netlify, Vercel, GitHub Pages)

## 설정 및 실행 방법

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.io/)에 가입하고 새 프로젝트를 생성합니다.
2. `schema.sql` 파일의 내용을 사용하여 Supabase SQL Editor에서 테이블을 생성합니다.
3. 프로젝트의 API URL과 Anon Key를 `script.js` 파일의 다음 변수에 입력합니다.
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

### 2. Supabase Edge Functions 배포

1. [Supabase CLI](https://supabase.com/docs/guides/cli)를 설치합니다.
2. `supabase/functions` 디렉터리 내의 각 함수(`fetch-gem-auction-price`, `fetch_engraving_data` 등)를 Supabase 프로젝트에 배포합니다.
   ```bash
   supabase functions deploy <function_name>
   ```
3. 함수가 주기적으로 실행되도록 스케줄을 설정합니다. (예: Cron jobs)

### 3. 로컬에서 실행

- 별도의 빌드 과정 없이 `index.html` 파일을 브라우저에서 열면 바로 실행됩니다. (단, Supabase 설정이 완료되어야 데이터를 불러올 수 있습니다.)

## 향후 추가할 기능

- **가격 변동 그래프**: 아이템별 가격 변동 추이를 시각적인 그래프로 제공합니다.
- **검색 기능**: 원하는 아이템을 이름으로 쉽게 찾을 수 있는 검색 기능을 추가합니다.
- **즐겨찾기**: 자주 확인하는 아이템을 즐겨찾기에 등록하여 빠르게 접근할 수 있도록 합니다.
- **알림 기능**: 특정 아이템의 가격이 설정한 값 이하/이상으로 변동될 경우 푸시 알림을 보냅니다.
- **다크 모드**: 사용자의 눈의 피로를 덜어주는 다크 모드 UI를 제공합니다.
- **UI/UX 개선**: 전반적인 사용자 인터페이스와 경험을 개선하여 더 직관적이고 사용하기 쉽게 만듭니다.
- **경매 분배금 계산기 활성화**: 현재 비활성화된 경매 분배금 계산기 기능을 다시 활성화하고 개선합니다.
