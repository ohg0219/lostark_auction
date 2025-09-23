-- 아이템의 고유 정보를 저장하는 테이블
CREATE TABLE items
(
    id            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_code     TEXT UNIQUE NOT NULL, -- 로스트아크 API에서 제공하는 아이템의 고유 코드
    item_name     TEXT        NOT NULL,
    category_code INTEGER     NOT NULL,
    icon_path     TEXT,
    grade         TEXT
);

-- 아이템 가격 변동을 기록하는 테이블
CREATE TABLE price_history
(
    id      BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id BIGINT REFERENCES items (id) ON DELETE CASCADE, -- items 테이블의 id를 참조
    price   INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 가격 조회를 빠르게 하기 위해 인덱스를 추가합니다.
CREATE INDEX idx_price_history_item_id_timestamp ON price_history (item_id, timestamp DESC);

-- 아크그리드 사용자 데이터를 저장하는 테이블
CREATE TABLE arkgrid_data (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    character_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    arkgrid_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- updated_at 컬럼을 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- arkgrid_data 테이블에 대한 트리거 생성
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON arkgrid_data
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- 일일 아이템 시세를 저장하는 테이블
CREATE TABLE market_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    avg_price REAL NOT NULL,
    trade_count INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(item_id, date)
);

-- 시세 조회를 빠르게 하기 위해 인덱스 추가
CREATE INDEX idx_market_history_item_id_date ON market_history(item_id, date DESC);
