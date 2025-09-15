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
            // 로컬 개발 환경이나 실제 배포 환경에 따라 URL을 적절히 수정해야 할 수 있습니다.
            const response = await fetch(`/api/fetch-siblings?characterName=${encodeURIComponent(characterName)}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `서버 오류: ${response.status}`);
            }

            const siblings = await response.json();

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
