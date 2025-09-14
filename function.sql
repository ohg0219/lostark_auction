-- This is the new function that fetches prices by category and calculates price changes.
-- Now returns item_id as well.
CREATE OR REPLACE FUNCTION get_latest_prices_by_category(p_category_codes INTEGER[])
RETURNS TABLE (
    item_id BIGINT,
    item_name TEXT,
    icon_path TEXT,
    grade TEXT,
    price INTEGER,
    last_updated TIMESTAMPTZ,
    category_code INTEGER,
    price_change INTEGER,
    change_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT
            p.item_id,
            p.price,
            p.timestamp
        FROM (
            SELECT
                ph.item_id,
                ph.price,
                ph.timestamp,
                ROW_NUMBER() OVER (PARTITION BY ph.item_id ORDER BY ph.timestamp DESC) as rn
            FROM price_history ph
            JOIN items i ON ph.item_id = i.id
            WHERE i.category_code = ANY(p_category_codes)
        ) p
        WHERE p.rn = 1
    ),
    prev_day_prices AS (
        SELECT
            p.item_id,
            p.price
        FROM (
            SELECT
                ph.item_id,
                ph.price,
                ROW_NUMBER() OVER (PARTITION BY ph.item_id ORDER BY ph.timestamp DESC) as rn
            FROM price_history ph
            JOIN items i ON ph.item_id = i.id
            WHERE i.category_code = ANY(p_category_codes)
              AND ph.timestamp < date_trunc('day', now()) -- Before today
        ) p
        WHERE p.rn = 1
    )
    SELECT
        i.id AS item_id,
        i.item_name,
        i.icon_path,
        i.grade,
        lp.price,
        lp.timestamp AS last_updated,
        i.category_code,
        COALESCE(lp.price - pdp.price, 0) AS price_change,
        CASE
            WHEN pdp.price IS NULL THEN 'same'
            WHEN lp.price > pdp.price THEN 'up'
            WHEN lp.price < pdp.price THEN 'down'
            ELSE 'same'
        END AS change_direction
    FROM
        items i
    JOIN
        latest_prices lp ON i.id = lp.item_id
    LEFT JOIN
        prev_day_prices pdp ON i.id = pdp.item_id
    WHERE
        i.category_code = ANY(p_category_codes)
    ORDER BY
        i.item_name;
END;
$$ LANGUAGE plpgsql;

-- 각 아이템의 최신 가격 정보를 조회하는 데이터베이스 함수를 생성합니다.
-- 이 함수를 사용하면 웹페이지에서 훨씬 빠르고 효율적으로 데이터를 불러올 수 있습니다.
CREATE OR REPLACE FUNCTION get_latest_prices()
RETURNS TABLE (
    item_name TEXT,
    icon_path TEXT,
    grade TEXT,
    price INTEGER,
    last_updated TIMESTAMPTZ,
    category_code INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT i.item_name,
           i.icon_path,
           i.grade,
           p.price,
           p.timestamp AS last_updated,
           i.category_code
    FROM items i
    JOIN (
        SELECT ph.item_id,
               ph.price,
               ph.timestamp,
               ROW_NUMBER() OVER (PARTITION BY ph.item_id ORDER BY ph.timestamp DESC) as rn
        FROM price_history ph
    ) p ON i.id = p.item_id
    WHERE p.rn = 1
    ORDER BY i.item_name;
END;
$$ LANGUAGE plpgsql;

-- 특정 아이템의 최신 정보와 가격을 ID로 조회하는 함수
CREATE OR REPLACE FUNCTION get_item_details_by_id(p_item_id BIGINT)
RETURNS TABLE (
    item_name TEXT,
    icon_path TEXT,
    grade TEXT,
    price INTEGER,
    last_updated TIMESTAMPTZ,
    category_code INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.item_name,
        i.icon_path,
        i.grade,
        p.price,
        p.timestamp AS last_updated,
        i.category_code
    FROM items i
    JOIN (
        SELECT
            ph.item_id,
            ph.price,
            ph.timestamp,
            ROW_NUMBER() OVER(PARTITION BY ph.item_id ORDER BY ph.timestamp DESC) as rn
        FROM price_history ph
    ) p ON i.id = p.item_id
    WHERE p.rn = 1 AND i.id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- 특정 아이템의 일자별 마지막 가격을 ID로 조회하는 함수 (최근 30일)
CREATE OR REPLACE FUNCTION get_item_price_history_by_id(p_item_id BIGINT)
RETURNS TABLE (
    history_date DATE,
    closing_price INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_prices AS (
        SELECT
            (ph.timestamp AT TIME ZONE 'Asia/Seoul')::DATE AS history_date,
            ph.price,
            ROW_NUMBER() OVER(PARTITION BY (ph.timestamp AT TIME ZONE 'Asia/Seoul')::DATE ORDER BY ph.timestamp DESC) as rn
        FROM price_history ph
        JOIN items i ON ph.item_id = i.id
        WHERE i.id = p_item_id
          AND ph.timestamp >= NOW() - INTERVAL '30 days'
    )
    SELECT
        dp.history_date,
        dp.price AS closing_price
    FROM daily_prices dp
    WHERE dp.rn = 1
    ORDER BY dp.history_date ASC;
END;
$$ LANGUAGE plpgsql;