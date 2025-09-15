import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 조회할 4티어 보석 아이템 이름 목록
const GEM_NAMES = [
  '1레벨 겁화의 보석', '2레벨 겁화의 보석', '3레벨 겁화의 보석', '4레벨 겁화의 보석', '5레벨 겁화의 보석',
  '6레벨 겁화의 보석', '7레벨 겁화의 보석', '8레벨 겁화의 보석', '9레벨 겁화의 보석', '10레벨 겁화의 보석',
  '1레벨 작열의 보석', '2레벨 작열의 보석', '3레벨 작열의 보석', '4레벨 작열의 보석', '5레벨 작열의 보석',
  '6레벨 작열의 보석', '7레벨 작열의 보석', '8레벨 작열의 보석', '9레벨 작열의 보석', '10레벨 작열의 보석'
];

// Lost Ark API 요청 본문 생성
const createApiBody = (itemName) => ({
  "Sort": "BUY_PRICE",
  "CategoryCode": 210000,
  "ItemTier": 4, // 4티어 보석
  "ItemName": itemName,
  "PageNo": 1, // 첫 페이지 결과만 확인
  "SortCondition": "ASC"
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Lost Ark API 키 가져오기
    const lostarkApiKey = Deno.env.get('LOSTARK_API_KEY');
    if (!lostarkApiKey) {
      throw new Error('LOSTARK_API_KEY가 설정되지 않았습니다.');
    }
    const apiAuthHeader = `bearer ${lostarkApiKey}`;

    let processedCount = 0;
    const lostArkApiUrl = 'https://developer-lostark.game.onstove.com/auctions/items';

    // 각 보석 이름에 대해 API 호출 및 데이터베이스 작업 수행
    for (const gemName of GEM_NAMES) {
      console.log(`[Edge] '${gemName}' 정보 조회 중...`);

      const response = await fetch(lostArkApiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': apiAuthHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createApiBody(gemName)),
      });

      if (!response.ok) {
        console.error(`[Edge] API 요청 실패: ${gemName}. Status: ${response.status}`);
        continue;
      }

      const data = await response.json();

      // 응답에 아이템이 없거나 비어있는 경우 건너뛰기
      if (!data.Items || data.Items.length === 0) {
        console.log(`[Edge] '${gemName}'에 대한 검색 결과가 없습니다.`);
        continue;
      }

      const apiItem = data.Items[0];
      const buyPrice = apiItem.AuctionInfo?.BuyPrice;

      // 즉시 구매가가 없는 아이템은 건너뛰기 (경매만 진행중인 아이템)
      if (buyPrice === undefined || buyPrice === null) {
        console.log(`[Edge] '${apiItem.Name}'은 즉시 구매가가 없어 건너뜁니다.`);
        continue;
      }

      // items 테이블에 아이템 정보 UPSERT
      // item_code를 기준으로 중복 확인 및 삽입/업데이트
      const { data: itemData, error: upsertError } = await supabaseClient
        .from('items')
        .upsert({
          item_code: apiItem.Name, // API 응답에 Code 필드가 없으므로 Name을 고유 식별자로 사용
          item_name: apiItem.Name,
          category_code: 210000,
          icon_path: apiItem.Icon,
          grade: apiItem.Grade,
        }, {
          onConflict: 'item_code',
        })
        .select('id')
        .single();

      if (upsertError) {
        console.error(`[Edge] DB UPSERT 실패: ${apiItem.Name}. Error: ${upsertError.message}`);
        continue;
      }
      if (!itemData) {
        console.error(`[Edge] UPSERT 후 itemData를 받지 못했습니다: ${apiItem.Name}`);
        continue;
      }

      // price_history 테이블에 가격 정보 삽입
      const { error: priceError } = await supabaseClient
        .from('price_history')
        .insert({
          item_id: itemData.id,
          price: buyPrice,
        });

      if (priceError) {
        console.error(`[Edge] 가격 정보 삽입 실패: ${apiItem.Name}. Error: ${priceError.message}`);
        continue;
      }

      processedCount++;
      console.log(`[Edge] '${apiItem.Name}' 가격 정보 저장 완료: ${buyPrice}`);
    }

    return new Response(
      JSON.stringify({ message: `성공적으로 ${processedCount}개의 보석 가격 정보를 처리했습니다.` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
