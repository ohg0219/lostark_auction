import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener('DOMContentLoaded', () => {
    const characterNameInput = document.getElementById('character-name');
    const searchButton = document.getElementById('search-button');
    const tableBody = document.querySelector('#result-table tbody');
    const serverNameElement = document.getElementById('server-name');

    const search = async () => {
        const characterName = characterNameInput.value.trim();

        // Clear previous results
        tableBody.innerHTML = '';
        serverNameElement.textContent = '';

        if (!characterName) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">캐릭터명을 입력해주세요.</td></tr>';
            return;
        }

        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">검색 중...</td></tr>';

        try {
            // Supabase Edge Function 호출
            const { data: siblings, error } = await supabase.functions.invoke('fetch-siblings', {
                body: { characterName: characterName },
            });

            if (error) {
                let errorMessage = error.message;
                try {
                    const context = JSON.parse(error.context);
                    if (context.error) errorMessage = context.error;
                } catch (e) { /* 파싱 실패 시 원래 에러 메시지 사용 */ }
                throw new Error(errorMessage);
            }

            tableBody.innerHTML = '';

            if (siblings === null || siblings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">캐릭터 정보가 없거나 캐릭터를 찾을 수 없습니다.</td></tr>';
                return;
            }

            // 1. 서버 이름 추출 및 표시
            const serverName = siblings[0].ServerName;
            serverNameElement.textContent = `서버: ${serverName}`;

            // 2. 데이터 정렬
            siblings.sort((a, b) => {
                const itemLevelA = parseFloat(a.ItemAvgLevel.replace(/,/g, ''));
                const itemLevelB = parseFloat(b.ItemAvgLevel.replace(/,/g, ''));

                if (itemLevelB !== itemLevelA) {
                    return itemLevelB - itemLevelA; // 아이템 레벨 내림차순
                }
                return b.CharacterName.localeCompare(a.CharacterName); // 캐릭터명 내림차순
            });

            // 3. 테이블 렌더링
            siblings.forEach(char => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = char.CharacterName;
                row.insertCell().textContent = char.CharacterLevel;
                row.insertCell().textContent = char.CharacterClassName;
                row.insertCell().textContent = char.ItemAvgLevel;
            });

        } catch (error) {
            console.error('Error fetching sibling data:', error);
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">오류: ${error.message}</td></tr>`;
            serverNameElement.textContent = ''; // 오류 발생 시 서버 이름도 지움
        }
    };

    searchButton.addEventListener('click', search);

    characterNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            search();
        }
    });
});
