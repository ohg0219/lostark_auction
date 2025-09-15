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

    const totalGoldContainer = document.getElementById('total-gold-container');

    // 골드 계산 함수
    const calculateCharacterGold = (itemLevel, levelBrackets) => {
        const level = parseFloat(itemLevel.replace(/,/g, ''));
        const bracket = levelBrackets.find(b => level >= b.minLevel && level <= b.maxLevel);
        return bracket ? bracket.totalGold : 0;
    };

    const search = async () => {
        const characterName = characterNameInput.value.trim();

        // 이전 결과 초기화
        tableBody.innerHTML = '';
        serverNameElement.textContent = '';
        totalGoldContainer.innerHTML = '';

        if (!characterName) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">캐릭터명을 입력해주세요.</td></tr>';
            return;
        }

        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">검색 중...</td></tr>';

        try {
            // 데이터 로드
            const [levelBracketsRes, siblingsRes] = await Promise.all([
                fetch('../../data/level_dungeons.json'),
                supabase.functions.invoke('fetch-siblings', { body: { characterName } })
            ]);

            if (!levelBracketsRes.ok) {
                throw new Error('골드 데이터를 불러오는데 실패했습니다.');
            }
            const levelBrackets = await levelBracketsRes.json();

            const { data: siblings, error: siblingsError } = siblingsRes;

            if (siblingsError) {
                let errorMessage = siblingsError.message;
                try {
                    const context = JSON.parse(siblingsError.context);
                    if (context.error) errorMessage = context.error;
                } catch (e) { /* 파싱 실패 */ }
                throw new Error(errorMessage);
            }

            tableBody.innerHTML = '';

            if (siblings === null || siblings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">캐릭터 정보가 없거나 캐릭터를 찾을 수 없습니다.</td></tr>';
                return;
            }

            // 1. 서버 이름 추출 및 표시
            const serverName = siblings[0].ServerName;
            serverNameElement.textContent = `${serverName} 서버`;

            // 2. 데이터 정렬
            siblings.sort((a, b) => {
                const itemLevelA = parseFloat(a.ItemAvgLevel.replace(/,/g, ''));
                const itemLevelB = parseFloat(b.ItemAvgLevel.replace(/,/g, ''));
                if (itemLevelB !== itemLevelA) {
                    return itemLevelB - itemLevelA;
                }
                return a.CharacterName.localeCompare(b.CharacterName);
            });

            // 3. 테이블 렌더링 및 골드 계산
            let totalExpeditionGold = 0;
            siblings.forEach((char, index) => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = char.CharacterName;
                row.insertCell().textContent = char.CharacterLevel;
                row.insertCell().textContent = char.CharacterClassName;
                row.insertCell().textContent = char.ItemAvgLevel;

                let gold = 0;
                const itemLevel = parseFloat(char.ItemAvgLevel.replace(/,/g, ''));
                const bracket = levelBrackets.find(b => itemLevel >= b.minLevel && itemLevel <= b.maxLevel);

                if (index < 6 && bracket) {
                    gold = bracket.totalGold;
                    totalExpeditionGold += gold;
                }

                const goldCell = row.insertCell();
                goldCell.textContent = gold.toLocaleString();

                // 행 클릭 이벤트 추가 (골드 획득 가능 캐릭터만)
                if (bracket && bracket.dungeons) {
                    row.style.cursor = 'pointer';
                    row.addEventListener('click', () => {
                        const nextRow = row.nextSibling;
                        // 이미 상세 정보가 열려있으면 닫기
                        if (nextRow && nextRow.classList.contains('dungeon-details')) {
                            nextRow.remove();
                        } else {
                            // 다른 상세 정보가 열려있으면 먼저 닫기
                            const existingDetails = tableBody.querySelector('.dungeon-details');
                            if (existingDetails) {
                                existingDetails.remove();
                            }
                            // 새로운 상세 정보 열기
                            const detailsRow = tableBody.insertRow(row.sectionRowIndex + 1);
                            detailsRow.classList.add('dungeon-details');
                            const detailsCell = detailsRow.insertCell();
                            detailsCell.colSpan = 5;
                            detailsCell.innerHTML = `<div style="padding: 10px; background-color: #f9f9f9; color: #333; border-left: 3px solid #4CAF50;"><strong>추천 던전:</strong> ${bracket.dungeons.join(', ')}</div>`;
                        }
                    });
                }
            });

            // 4. 총 골드 표시
            totalGoldContainer.innerHTML = `<h3>원정대 획득 골드 합계: ${totalExpeditionGold.toLocaleString()}</h3>`;

        } catch (error) {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">오류: ${error.message}</td></tr>`;
            serverNameElement.textContent = '';
            totalGoldContainer.innerHTML = '';
        }
    };

    searchButton.addEventListener('click', search);

    characterNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            search();
        }
    });
});
