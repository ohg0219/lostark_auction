-- 아이템의 고유 정보를 저장하는 테이블
CREATE TABLE items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  item_code TEXT UNIQUE NOT NULL, -- 로스트아크 API에서 제공하는 아이템의 고유 코드
  item_name TEXT NOT NULL,
  category_code INTEGER NOT NULL,
  icon_path TEXT,
  grade TEXT
);

-- 아이템 가격 변동을 기록하는 테이블
CREATE TABLE price_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE, -- items 테이블의 id를 참조
  price INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 가격 조회를 빠르게 하기 위해 인덱스를 추가합니다.
CREATE INDEX idx_price_history_item_id_timestamp ON price_history (item_id, timestamp DESC);
