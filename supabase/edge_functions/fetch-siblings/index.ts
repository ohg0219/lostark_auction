import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // OPTIONS 요청에 대한 사전 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 요청 본문에서 characterName 가져오기
    const { characterName } = await req.json();

    if (!characterName) {
      return new Response(JSON.stringify({ error: '캐릭터명이 필요합니다.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Lost Ark API 키 가져오기
    const lostarkApiKey = Deno.env.get('LOSTARK_CHARACTERS_SIBLINGS');
    if (!lostarkApiKey) {
      throw new Error('LOSTARK_API_KEY가 설정되지 않았습니다.');
    }
    const apiAuthHeader = `bearer ${lostarkApiKey}`;

    const encodedCharacterName = encodeURIComponent(characterName);
    const lostArkApiUrl = `https://developer-lostark.game.onstove.com/characters/${encodedCharacterName}/siblings`;

    const response = await fetch(lostArkApiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'authorization': apiAuthHeader,
      },
    });

    if (!response.ok) {
        const errorData = await response.text(); // API가 JSON이 아닌 텍스트를 반환할 수 있음
        try {
            const parsedError = JSON.parse(errorData);
            return new Response(JSON.stringify({ error: parsedError.Message || `API 요청 실패. Status: ${response.status}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: response.status,
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: errorData || `API 요청 실패. Status: ${response.status}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: response.status,
            });
        }
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
