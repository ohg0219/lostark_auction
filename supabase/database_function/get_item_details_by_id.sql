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