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
              AND ph.timestamp < (date_trunc('day', now() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul') -- Before today (KST)
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