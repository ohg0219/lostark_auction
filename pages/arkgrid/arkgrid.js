console.log("arkgrid.js loaded");

const ARKGRID_DATA = {
    cores: {
        heroic: { name: '영웅', willpower: 7, activationPoints: [10] },
        legendary: { name: '전설', willpower: 11, activationPoints: [10, 14] },
        relic: { name: '유물', willpower: 15, activationPoints: [10, 14, 17, 18, 19, 20] },
        ancient: { name: '고대', willpower: 17, activationPoints: [10, 14, 17, 18, 19, 20] }
    },
    gems: {
        max_per_core: 4
    }
};

// --- DOM Elements ---
const addGemBtn = document.getElementById('add-gem-btn');
const calculateBtn = document.getElementById('calculate-btn');
const orderGemList = document.getElementById('order-gem-list');
const chaosGemList = document.getElementById('chaos-gem-list');
const resultsDiv = document.getElementById('results');

// --- State ---
let orderGems = [];
let chaosGems = [];
let nextGemId = 0;

// --- Functions ---
function addGem() {
    const type = document.getElementById('gem-type').value;
    const willpowerInput = document.getElementById('gem-willpower');
    const pointInput = document.getElementById('gem-point');

    const willpower = parseInt(willpowerInput.value, 10);
    const point = parseInt(pointInput.value, 10);

    if (isNaN(willpower) || isNaN(point) || willpower < 3 || willpower > 5 || point < 1 || point > 5) {
        alert('유효한 젬 정보를 입력하세요. (의지력: 3-5, 포인트: 1-5)');
        return;
    }

    const gem = { id: nextGemId++, type, willpower, point };

    if (type === 'order') {
        orderGems.push(gem);
    } else {
        chaosGems.push(gem);
    }

    willpowerInput.value = '';
    pointInput.value = '';
    renderGemLists();
}

function renderGemLists() {
    orderGemList.innerHTML = '';
    chaosGemList.innerHTML = '';

    const createGemElement = (gem) => {
        const gemEl = document.createElement('div');
        gemEl.className = 'gem-item';
        gemEl.textContent = `의지력: ${gem.willpower}, 포인트: ${gem.point} `;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '삭제';
        deleteBtn.onclick = () => {
            if (gem.type === 'order') {
                orderGems = orderGems.filter(g => g.id !== gem.id);
            } else {
                chaosGems = chaosGems.filter(g => g.id !== gem.id);
            }
            renderGemLists();
        };

        gemEl.appendChild(deleteBtn);
        return gemEl;
    };

    orderGems.forEach(gem => orderGemList.appendChild(createGemElement(gem)));
    chaosGems.forEach(gem => chaosGemList.appendChild(createGemElement(gem)));
}

function findBestGemCombination(core, availableGems) {
    let bestCombination = {
        gems: [],
        points: 0,
        willpower: 0
    };

    // availableGems를 포인트 내림차순으로 정렬하여 더 효율적으로 탐색
    const sortedGems = [...availableGems].sort((a, b) => b.point - a.point);

    function find(startIndex, currentGems, currentWillpower, currentPoints) {
        // 현재 조합이 기존 최적 조합보다 더 좋으면 업데이트
        if (currentPoints > bestCombination.points) {
            bestCombination = {
                gems: [...currentGems],
                points: currentPoints,
                willpower: currentWillpower
            };
        }

        // 젬을 4개 채웠거나 더 이상 탐색할 젬이 없으면 종료
        if (currentGems.length >= ARKGRID_DATA.gems.max_per_core || startIndex >= sortedGems.length) {
            return;
        }

        // startIndex부터 시작하여 나머지 젬들을 탐색
        for (let i = startIndex; i < sortedGems.length; i++) {
            const newGem = sortedGems[i];
            const newWillpower = currentWillpower + newGem.willpower;

            // 의지력이 초과되지 않는 경우에만 젬을 추가하고 재귀 호출
            if (newWillpower <= core.willpower) {
                currentGems.push(newGem);
                find(i + 1, currentGems, newWillpower, currentPoints + newGem.point);
                currentGems.pop(); // 백트래킹
            }
        }
    }

    find(0, [], 0, 0);
    return bestCombination;
}

function calculate() {
    resultsDiv.innerHTML = '';
    let availableOrderGems = [...orderGems];
    let availableChaosGems = [...chaosGems];

    const coreSelectors = document.querySelectorAll('.core-selector');

    coreSelectors.forEach((selector, index) => {
        const grade = selector.value;
        if (grade === 'none') return;

        const coreType = selector.dataset.coreType;
        const coreData = ARKGRID_DATA.cores[grade];
        const core = {
            name: `${coreType === 'order' ? '질서' : '혼돈'} 코어 ${index % 3 + 1} (${coreData.name})`,
            willpower: coreData.willpower,
            activationPoints: coreData.activationPoints,
        };

        const availableGems = coreType === 'order' ? availableOrderGems : availableChaosGems;
        const result = findBestGemCombination(core, availableGems);

        // Update the available gems pool
        if (coreType === 'order') {
            availableOrderGems = availableOrderGems.filter(gem => !result.gems.some(usedGem => usedGem.id === gem.id));
        } else {
            availableChaosGems = availableChaosGems.filter(gem => !result.gems.some(usedGem => usedGem.id === gem.id));
        }

        renderResult(core, result);
    });
}

function renderResult(core, result) {
    const resultEl = document.createElement('div');
    resultEl.className = 'result-core';

    let activatedOptions = core.activationPoints.filter(p => result.points >= p);
    let activatedOptionsStr = activatedOptions.length > 0 ? ` (활성: ${activatedOptions.join(', ')})` : ' (활성 옵션 없음)';

    let html = `
        <h4>${core.name}</h4>
        <p><strong>총 포인트:</strong> ${result.points}${activatedOptionsStr}</p>
        <p><strong>소모 의지력:</strong> ${result.willpower} / ${core.willpower}</p>
        <ul>
    `;
    if (result.gems.length > 0) {
        result.gems.forEach(gem => {
            html += `<li>의지력 ${gem.willpower}, 포인트 ${gem.point} 젬</li>`;
        });
    } else {
        html += '<li>장착된 젬 없음</li>';
    }
    html += `</ul>`;

    resultEl.innerHTML = html;
    resultsDiv.appendChild(resultEl);
}


// --- Event Listeners ---
addGemBtn.addEventListener('click', addGem);
calculateBtn.addEventListener('click', calculate);

// --- Initial Render ---
renderGemLists();
