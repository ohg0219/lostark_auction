import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener('DOMContentLoaded', () => {
    const characterNameInput = document.getElementById('character-name');
    const searchButton = document.getElementById('search-button');
    const tableBody = document.querySelector('#result-table tbody');

    const search = async () => {
        const characterName = characterNameInput.value.trim();

        if (!characterName) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">캐릭터명을 입력해주세요.</td></tr>';
            return;
        }

        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">검색 중...</td></tr>';

        try {
            // Supabase Edge Function 호출
            const { data: siblings, error } = await supabase.functions.invoke('fetch-siblings', {
                body: { characterName: characterName },
            });

            if (error) {
                // Edge Function 자체에서 반환한 에러 메시지를 사용하려고 시도
                let errorMessage = error.message;
                try {
                    // context는 종종 JSON 문자열로 된 추가 정보를 포함
                    const context = JSON.parse(error.context);
                    if (context.error) {
                        errorMessage = context.error;
                    }
                } catch (e) {
                    // 파싱 실패 시 원래 에러 메시지 사용
                }
                throw new Error(errorMessage);
            }

            tableBody.innerHTML = ''; // 기존 내용 지우기

            if (siblings === null || siblings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">형제 캐릭터 정보가 없거나 캐릭터를 찾을 수 없습니다.</td></tr>';
                return;
            }

            siblings.forEach(char => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = char.ServerName;
                row.insertCell().textContent = char.CharacterName;
                row.insertCell().textContent = char.CharacterLevel;
                row.insertCell().textContent = char.CharacterClassName;
                row.insertCell().textContent = char.ItemAvgLevel;
            });

        } catch (error) {
            console.error('Error fetching sibling data:', error);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">오류: ${error.message}</td></tr>`;
        }
    };

    searchButton.addEventListener('click', search);

    characterNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            search();
        }
    });
});
