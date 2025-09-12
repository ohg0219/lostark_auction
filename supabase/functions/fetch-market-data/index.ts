import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS 헤더 설정 (브라우저에서 함수를 호출할 수 있도록 허용)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 로스트아크 API 응답 타입 정의 (예상)
interface ApiItem {
  Id: string;
  Name: string;
  Grade: string;
  Icon: string;
  BundleCount: number;
  CurrentMinPrice: number;
}

interface MarketOptionsCategory {
    Code: number;
    CodeName: string;
}

// 실제 데이터 수집 및 저장을 처리하는 메인 함수
async function fetchAndStoreMarketData(supabaseClient: SupabaseClient, apiAuthHeader: string) {
    let itemsProcessed = 0;
    const lostArkApiBase = 'https://developer-lostark.game.onstove.com';

    // 1. 거래 가능한 아이템 카테고리 목록 가져오기
    console.log("Fetching market categories...");
    const optionsResponse = await fetch(`${lostArkApiBase}/markets/options`, {
        headers: {
            'accept': 'application/json',
            'authorization': apiAuthHeader,
        }
    });
    if (!optionsResponse.ok) {
        console.error("Failed to fetch market options:", await optionsResponse.text());
        throw new Error('Failed to fetch market options.');
    }

    const responseData = await optionsResponse.json();

    // The API returns an array of objects, each containing a "Categories" array.
    // We need to flatten this structure to get a single list of all category objects.
    const allCategories = responseData.flatMap(group => group.Categories);

    // API 호출 횟수를 줄이기 위해 일부 카테고리만 테스트용으로 선택 (예: 2개)
    const categoryCodesToFetch = allCategories.map(c => c.Code).slice(0, 2);
    console.log(`Found ${allCategories.length} total categories. Fetching first ${categoryCodesToFetch.length}...`);


    // 2. 각 카테고리를 순회하며 아이템 목록 가져오기
    for (const categoryCode of categoryCodesToFetch) {
        console.log(`Fetching items for category: ${categoryCode}`);
        const marketResponse = await fetch(`${lostArkApiBase}/markets/items`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'authorization': apiAuthHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "Sort": "GRADE",
                "CategoryCode": categoryCode,
                "PageNo": 1,
                "SortCondition": "ASC"
            })
        });

        if (!marketResponse.ok) {
            console.error(`API request failed for category ${categoryCode}:`, await marketResponse.text());
            continue; // 에러 발생 시 다음 카테고리로 이동
        }

        const marketData = await marketResponse.json();
        const itemsFromApi: ApiItem[] = marketData.Items || [];
        console.log(`Found ${itemsFromApi.length} items in category ${categoryCode}.`);

        // 3. API로부터 받은 각 아이템 처리하기
        for (const apiItem of itemsFromApi) {
            const { Id: itemCode, Name: itemName, CurrentMinPrice: itemPrice, Grade: itemGrade, Icon: itemIcon } = apiItem;

            if (!itemCode || !itemName || itemPrice === undefined) {
                console.warn("Skipping item with missing data:", apiItem);
                continue;
            }

            // 4. 'items' 테이블에 아이템 정보 저장 또는 업데이트 (Upsert)
            const { data: itemData, error: upsertError } = await supabaseClient
                .from('items')
                .upsert({
                    item_code: itemCode,
                    item_name: itemName,
                    category_code: categoryCode,
                    icon_path: itemIcon,
                    grade: itemGrade,
                }, { onConflict: 'item_code' })
                .select('id')
                .single();

            if (upsertError) {
                console.error(`Error upserting item ${itemName}:`, upsertError);
                continue;
            }

            // 5. 'price_history' 테이블에 새로운 가격 정보 추가
            const { error: priceError } = await supabaseClient
                .from('price_history')
                .insert({ item_id: itemData.id, price: itemPrice });

            if (priceError) {
                console.error(`Error inserting price for ${itemName}:`, priceError);
            } else {
                itemsProcessed++;
            }
        }
    }
    return itemsProcessed;
}

// Edge Function의 메인 핸들러
serve(async (req) => {
  // 웹 브라우저의 CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 초기화 (Admin 권한)
    // Edge Function 환경에서는 환경 변수에서 자동으로 URL과 키를 가져옵니다.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Supabase 시크릿에서 Lost Ark API 키 가져오기
    const lostarkApiKey = Deno.env.get('LOSTARK_API_KEY');
    if (!lostarkApiKey) throw new Error('LOSTARK_API_KEY is not set in Supabase secrets.');

    const apiAuthHeader = `bearer ${lostarkApiKey}`;

    // 데이터 수집 함수 호출
    const itemsProcessed = await fetchAndStoreMarketData(supabaseClient, apiAuthHeader);

    // 성공 응답 반환
    return new Response(JSON.stringify({ message: `Successfully processed ${itemsProcessed} items.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // 에러 응답 반환
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
