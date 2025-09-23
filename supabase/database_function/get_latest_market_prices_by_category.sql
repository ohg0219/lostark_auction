CREATE OR REPLACE FUNCTION get_latest_market_prices_by_category(p_category_codes INTEGER[])
RETURNS TABLE(
    item_id BIGINT,
    item_name TEXT,
    avg_price REAL,
    grade TEXT,
    icon_path TEXT,
    price_change REAL,
    change_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_prices AS (
        SELECT
            mh.item_id,
            mh.avg_price,
            ROW_NUMBER() OVER(PARTITION BY mh.item_id ORDER BY mh.date DESC) as rn
        FROM
            market_history mh
        JOIN
            items i ON mh.item_id = i.id
        WHERE
            i.category_code = ANY(p_category_codes)
    ),
    price_comparison AS (
        SELECT
            latest.item_id,
            latest.avg_price AS latest_price,
            prev.avg_price AS prev_price
        FROM
            ranked_prices latest
        LEFT JOIN
            ranked_prices prev ON latest.item_id = prev.item_id AND prev.rn = 2
        WHERE
            latest.rn = 1
    )
    SELECT
        i.id AS item_id,
        i.item_name,
        pc.latest_price AS avg_price,
        i.grade,
        i.icon_path,
        COALESCE(pc.latest_price - pc.prev_price, 0)::REAL AS price_change,
        CASE
            WHEN pc.prev_price IS NULL THEN 'same'
            WHEN pc.latest_price > pc.prev_price THEN 'up'
            WHEN pc.latest_price < pc.prev_price THEN 'down'
            ELSE 'same'
        END AS change_direction
    FROM
        items i
    JOIN
        price_comparison pc ON i.id = pc.item_id
    ORDER BY
        i.item_name;
END;
$$ LANGUAGE plpgsql;
