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
DECLARE
    v_category_code INTEGER;
BEGIN
    -- 주어진 아이템 ID로 카테고리 코드를 조회합니다.
    SELECT i.category_code INTO v_category_code
    FROM items i
    WHERE i.id = p_item_id;

    -- 카테고리 코드에 따라 다른 가격 테이블을 조회합니다.
    -- 40000: 각인서, 230000: 보석, 50010: 재련 재료, 50020: 추가 재련 재료
    IF v_category_code IN (40000, 230000, 50010, 50020) THEN
        -- market_history 테이블에서 최신 데이터를 조회합니다.
        RETURN QUERY
        SELECT
            i.item_name,
            i.icon_path,
            i.grade,
            CAST(p.avg_price AS INTEGER), -- price를 INTEGER로 캐스팅
            (p.date + time '23:59:59') AT TIME ZONE 'UTC', -- date를 TIMESTAMPTZ로 변환
            i.category_code
        FROM items i
        JOIN (
            SELECT
                mh.item_id,
                mh.avg_price,
                mh.date,
                ROW_NUMBER() OVER(PARTITION BY mh.item_id ORDER BY mh.date DESC) as rn
            FROM market_history mh
        ) p ON i.id = p.item_id
        WHERE p.rn = 1 AND i.id = p_item_id;
    ELSE
        -- 그 외 카테고리는 기존 price_history 테이블에서 조회합니다.
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
    END IF;
END;
$$ LANGUAGE plpgsql;