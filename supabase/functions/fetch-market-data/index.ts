import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS 헤더 설정 (브라우저에서 함수를 호출할 수 있도록 허용)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 메인 로직 함수
async function fetchAndStoreMarketData(supabaseClient, apiAuthHeader) {
    let itemsProcessed = 0;
    const lostArkApiBase = 'https://developer-lostark.game.onstove.com';
    const optionsResponse = await fetch(`${lostArkApiBase}/markets/options`, {
        headers: {
            'accept': 'application/json',
            'authorization': apiAuthHeader
        }
    });
    if (!optionsResponse.ok) {
        throw new Error(`Failed to fetch market options. Status: ${optionsResponse.status} ${optionsResponse.statusText}`);
    }
    let responseData;
    try {
        responseData = await optionsResponse.json();
    } catch (e) {
        // If parsing fails, get the raw text for logging.
        const responseText = await optionsResponse.text();
        console.error("Failed to parse market options JSON. Response text:", responseText);
        throw new Error(`Failed to parse market options response as JSON: ${e.message}`);
    }
    console.log("Received market options data:", responseData);
    if (!Array.isArray(responseData)) {
        const dataType = typeof responseData;
        const keys = dataType === 'object' && responseData !== null ? Object.keys(responseData).join(', ') : '';
        console.error("API response for market options is not an array. Type:", dataType, "Keys:", keys);
        throw new Error(`Failed to process market options: unexpected data structure from API. Expected array, got ${dataType}. Keys: [${keys}]`);
    }
    const allCategories = responseData.flatMap((group)=>group.Categories || []);
    const categoryCodesToFetch = allCategories.map((c)=>c.Code).slice(0, 2);
    console.log(`Found ${allCategories.length} total categories. Fetching first ${categoryCodesToFetch.length}...`);
    for (const categoryCode of categoryCodesToFetch){
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
                "PageNo": 1,
                "SortCondition": "ASC"
            })
        });
        if (!marketResponse.ok) continue;
        const marketData = await marketResponse.json();
        const itemsFromApi = marketData.Items || [];
        for (const apiItem of itemsFromApi){
            const { Id: itemCode, Name: itemName, CurrentMinPrice: itemPrice, Grade: itemGrade, Icon: itemIcon } = apiItem;
            if (!itemCode || !itemName || itemPrice === undefined) continue;
            const { data: itemData, error: upsertError } = await supabaseClient.from('items').upsert({
                item_code: itemCode,
                item_name: itemName,
                category_code: categoryCode,
                icon_path: itemIcon,
                grade: itemGrade
            }, {
                onConflict: 'item_code'
            }).select('id').single();
            if (upsertError) continue;
            const { error: priceError } = await supabaseClient.from('price_history').insert({
                item_id: itemData.id,
                price: itemPrice
            });
            if (!priceError) itemsProcessed++;
        }
    }
    return itemsProcessed;
}
// 메인 핸들러
serve(async (req)=>{
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
