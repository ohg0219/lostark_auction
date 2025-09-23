CREATE OR REPLACE FUNCTION get_market_history_by_item_id(p_item_id BIGINT)
RETURNS TABLE(
    date DATE,
    avg_price REAL,
    trade_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mh.date,
        mh.avg_price,
        mh.trade_count
    FROM
        market_history mh
    WHERE
        mh.item_id = p_item_id
    ORDER BY
        mh.date ASC;
END;
$$ LANGUAGE plpgsql;
