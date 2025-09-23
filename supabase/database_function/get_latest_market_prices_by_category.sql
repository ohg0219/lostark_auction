CREATE OR REPLACE FUNCTION get_latest_market_prices_by_category(p_category_code INTEGER)
RETURNS TABLE(
    item_id BIGINT,
    item_name TEXT,
    avg_price REAL,
    grade TEXT,
    icon_path TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_prices AS (
        SELECT
            mh.item_id,
            mh.avg_price,
            ROW_NUMBER() OVER(PARTITION BY mh.item_id ORDER BY mh.date DESC) as rn
        FROM
            market_history mh
        JOIN
            items i ON mh.item_id = i.id
        WHERE
            i.category_code = p_category_code
    )
    SELECT
        lp.item_id,
        i.item_name,
        lp.avg_price,
        i.grade,
        i.icon_path
    FROM
        latest_prices lp
    JOIN
        items i ON lp.item_id = i.id
    WHERE
        lp.rn = 1
    ORDER BY
        i.item_name;
END;
$$ LANGUAGE plpgsql;
