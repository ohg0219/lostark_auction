-- 각 아이템의 최신 가격 정보를 조회하는 데이터베이스 함수를 생성합니다.
-- 이 함수를 사용하면 웹페이지에서 훨씬 빠르고 효율적으로 데이터를 불러올 수 있습니다.
CREATE OR REPLACE FUNCTION get_latest_prices()
RETURNS TABLE (
    item_name TEXT,
    icon_path TEXT,
    grade TEXT,
    price INTEGER,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.item_name,
        i.icon_path,
        i.grade,
        p.price,
        p.timestamp AS last_updated
    FROM
        items i
    JOIN
        (
            SELECT
                ph.item_id,
                ph.price,
                ph.timestamp,
                ROW_NUMBER() OVER(PARTITION BY ph.item_id ORDER BY ph.timestamp DESC) as rn
            FROM
                price_history ph
        ) p ON i.id = p.item_id
    WHERE
        p.rn = 1
    ORDER BY
        i.item_name;
END;
$$ LANGUAGE plpgsql;
