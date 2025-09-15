import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
// CORS 헤더 설정 (브라우저에서 함수를 호출할 수 있도록 허용)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// 메인 로직 함수 (Refactored)
async function fetchAndStoreMarketData(supabaseClient, apiAuthHeader) {
    let itemsProcessed = 0;
    const lostArkApiBase = 'https://developer-lostark.game.onstove.com';
    const categoryCode = 50000; // CategoryCode를 50000으로 고정
    // PageNo를 1부터 9까지 반복
    for (let pageNo = 1; pageNo <= 9; pageNo++) {
        console.log(`[Edge] Fetching page ${pageNo} for category ${categoryCode}...`);
        const marketResponse = await fetch(`${lostArkApiBase}/markets/items`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'authorization': apiAuthHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Sort": "GRADE",
                "CategoryCode": categoryCode,
                "PageNo": pageNo,
                "SortCondition": "ASC"
            })
        });
        if (!marketResponse.ok) {
            console.error(`[Edge] Failed to fetch page ${pageNo} for category ${categoryCode}. Status: ${marketResponse.status} ${marketResponse.statusText}`);
            continue; // 다음 페이지로 건너뛰기
        }
        const marketData = await marketResponse.json();
        const itemsFromApi = marketData.Items || [];
        // 아이템이 더 이상 없으면 반복 중단
        if (itemsFromApi.length === 0) {
            console.log(`[Edge] No more items found on page ${pageNo}. Stopping pagination for category ${categoryCode}.`);
            break;
        }
        // 아이템 처리 로직
        for (const apiItem of itemsFromApi) {
            const {
                Id: itemCode,
                Name: itemName,
                CurrentMinPrice: itemPrice,
                Grade: itemGrade,
                Icon: itemIcon
            } = apiItem;
            if (!itemCode || !itemName || itemPrice === undefined) continue;
            const {data: itemData, error: upsertError} = await supabaseClient.from('items').upsert({
                item_code: itemCode,
                item_name: itemName,
                category_code: categoryCode,
                icon_path: itemIcon,
                grade: itemGrade
            }, {
                onConflict: 'item_code'
            }).select('id').single();
            if (upsertError) {
                console.error(`[Edge] Upsert error for item ${itemCode}: ${upsertError.message}`);
                continue;
            }
            if (!itemData) {
                console.error(`[Edge] No data returned from upsert for item ${itemCode}`);
                continue;
            }
            const {error: priceError} = await supabaseClient.from('price_history').insert({
                item_id: itemData.id,
                price: itemPrice
            });
            if (priceError) {
                console.error(`[Edge] Price insert error for item ID ${itemData.id}: ${priceError.message}`);
                continue;
            }
            itemsProcessed++;
        }
    }
    return itemsProcessed;
}

// 메인 핸들러
serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', {
        headers: corsHeaders
    });
    try {
        const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
        const lostarkApiKey = Deno.env.get('LOSTARK_API_KEY');
        if (!lostarkApiKey) throw new Error('LOSTARK_API_KEY is not set.');
        const apiAuthHeader = `bearer ${lostarkApiKey}`;
        const itemsProcessed = await fetchAndStoreMarketData(supabaseClient, apiAuthHeader);
        return new Response(JSON.stringify({
            message: `Successfully processed ${itemsProcessed} items.`
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 500
        });
    }
});
