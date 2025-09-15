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