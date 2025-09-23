import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient, SupabaseClient} from 'https://esm.sh/@supabase/supabase-js@2';

// CORS 헤더 설정
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 로스트아크 API 기본 URL
const LOSTARK_API_BASE_URL = 'https://developer-lostark.game.onstove.com';

// 특정 카테고리의 모든 아이템 목록을 페이지네이션을 통해 가져오는 함수
async function fetchAllItemsForCategory(categoryCode: number, apiAuthHeader: string): Promise<any[]> {
    let allItems: any[] = [];
    let pageNo = 1;
    let hasMore = true;

    console.log(`[Edge] 카테고리 ${categoryCode}의 아이템 수집 시작.`);

    while (hasMore) {
        try {
            const response = await fetch(`${LOSTARK_API_BASE_URL}/markets/items`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'authorization': apiAuthHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "Sort": "GRADE",
                    "CategoryCode": categoryCode,
                    "PageNo": pageNo,
                    "SortCondition": "ASC",
                }),
            });

            if (!response.ok) {
                console.error(`[Edge] 카테고리 ${categoryCode}, 페이지 ${pageNo}에서 API 오류 발생. Status: ${response.status}`);
                break;
            }

            const data = await response.json();
            const items = data.Items || [];

            if (items.length === 0) {
                hasMore = false;
            } else {
                allItems = allItems.concat(items);
                pageNo++;
                await new Promise(resolve => setTimeout(resolve, 200)); // API 속도 제한을 피하기 위한 지연
            }
        } catch (e) {
            console.error(`[Edge] 아이템 수집 중 예외 발생 (카테고리: ${categoryCode}, 페이지: ${pageNo}): ${e.message}`);
            hasMore = false;
        }
    }
    console.log(`[Edge] 카테고리 ${categoryCode}에서 총 ${allItems.length}개의 아이템 발견.`);
    return allItems;
}

// 단일 아이템의 상세 통계를 가져와 Supabase에 저장하는 함수
async function processSingleItem(item: any, supabaseClient: SupabaseClient, apiAuthHeader: string, categoryCode: number) {
    const {Id: itemCode, Name: itemName, Grade: itemGrade, Icon: itemIcon} = item;

    if (!itemCode || !itemName) {
        console.log(`[Edge] 아이템 코드 또는 이름이 없어 건너뜁니다.`);
        return null;
    }

    // 1. 'items' 테이블에 아이템 정보를 Upsert하여 DB ID를 확보합니다.
    const {data: itemData, error: upsertError} = await supabaseClient
        .from('items')
        .upsert({
            item_code: String(itemCode),
            item_name: itemName,
            category_code: categoryCode,
            icon_path: itemIcon,
            grade: itemGrade,
        }, {onConflict: 'item_code'})
        .select('id')
        .single();

    if (upsertError) {
        console.error(`[Edge] 아이템 ${itemName} (${itemCode})의 DB upsert 오류: ${upsertError.message}`);
        return null;
    }
    const itemId = itemData.id;

    // 2. 아이템 코드를 사용하여 상세 시장 내역을 조회합니다.
    try {
        const statsResponse = await fetch(`${LOSTARK_API_BASE_URL}/markets/items/${itemCode}`, {
            headers: {'accept': 'application/json', 'authorization': apiAuthHeader},
        });

        if (!statsResponse.ok) {
            console.error(`[Edge] ${itemName} (${itemCode})의 통계 API 오류. Status: ${statsResponse.status}`);
            return null;
        }

        const statsDataArray = await statsResponse.json();

        // API 응답은 아이템의 변형(예: 거래 가능 횟수)에 따라 여러 객체를 포함하는 배열입니다.
        if (!Array.isArray(statsDataArray) || statsDataArray.length === 0) {
            console.log(`[Edge] ${itemName}에 대한 통계 데이터 배열이 없습니다.`);
            return null;
        }

        // 가장 거래가 활발한(거래량이 가장 많은) 아이템 변형을 찾습니다.
        let mostActiveVariant = null;
        let maxTradeCount = -1;

        for (const itemVariant of statsDataArray) {
            const latestStat = itemVariant?.Stats?.[0]; // 가장 최근 통계로 대표 거래량을 확인
            if (latestStat && latestStat.TradeCount > maxTradeCount) {
                maxTradeCount = latestStat.TradeCount;
                mostActiveVariant = itemVariant;
            }
        }

        if (!mostActiveVariant || !mostActiveVariant.Stats || mostActiveVariant.Stats.length === 0) {
            console.log(`[Edge] ${itemName}의 모든 변형에서 유효한 시장 데이터를 찾지 못했습니다.`);
            return null;
        }

        // 3. 찾은 아이템 변형의 모든 일별 데이터를 'market_history' 테이블에 저장합니다.
        const dailyStats = mostActiveVariant.Stats;
        let upsertCount = 0;

        for (const dailyStat of dailyStats) {
            if (dailyStat.AvgPrice === undefined || dailyStat.TradeCount === undefined || !dailyStat.Date) {
                continue; // 필수 데이터가 없으면 건너뜁니다.
            }

            const {error: historyError} = await supabaseClient
                .from('market_history')
                .upsert({
                    item_id: itemId,
                    avg_price: dailyStat.AvgPrice,
                    trade_count: dailyStat.TradeCount,
                    date: dailyStat.Date,
                }, {onConflict: 'item_id,date'});

            if (historyError) {
                console.error(`[Edge] ${itemName}의 시세 정보(${dailyStat.Date}) 삽입 오류: ${historyError.message}`);
            } else {
                upsertCount++;
            }
        }

        console.log(`[Edge] ${itemName} 데이터 저장 완료: 총 ${upsertCount}일치 데이터를 upsert했습니다.`);
        return {itemName, upsertedDays: upsertCount};

    } catch (e) {
        console.error(`[Edge] ${itemName} 통계 처리 중 예외 발생: ${e.message}`);
        return null;
    }
}

// 엣지 함수의 메인 핸들러
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {headers: corsHeaders});
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const lostarkApiKey = Deno.env.get('LOSTARK_API_KEY');
        if (!lostarkApiKey) {
            throw new Error('LOSTARK_API_KEY가 설정되지 않았습니다.');
        }
        const apiAuthHeader = `bearer ${lostarkApiKey}`;

        let totalItemsProcessed = 0;

        const items = await fetchAllItemsForCategory(230000, apiAuthHeader);
        for (const item of items) {
            const result = await processSingleItem(item, supabaseClient, apiAuthHeader, 230000);
            if (result) {
                totalItemsProcessed++;
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // 각 아이템 처리 후 짧은 지연
        }

        return new Response(
            JSON.stringify({message: `총 ${totalItemsProcessed}개 아이템의 시세 정보 처리를 성공적으로 완료했습니다.`}),
            {headers: {...corsHeaders, 'Content-Type': 'application/json'}, status: 200}
        );

    } catch (error) {
        console.error(`[Edge] 메인 핸들러에서 예기치 않은 오류 발생: ${error.message}`);
        return new Response(
            JSON.stringify({error: "내부 서버 오류가 발생했습니다."}),
            {headers: {...corsHeaders, 'Content-Type': 'application/json'}, status: 500}
        );
    }
});
