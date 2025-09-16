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

function findBestGemCombination(core, availableGems, targetPoint) {
    let bestCombination = {
        gems: [],
        points: 0,
        willpower: Infinity, // 최소화 대상
        achieved: false
    };

    // 의지력 소모가 적은 순, 그 다음 포인트가 높은 순으로 정렬
    const sortedGems = [...availableGems].sort((a, b) => {
        if (a.willpower !== b.willpower) {
            return a.willpower - b.willpower;
        }
        return b.point - a.point;
    });

    function find(startIndex, currentGems, currentWillpower, currentPoints) {
        // 목표 포인트를 달성했는지 확인
        if (currentPoints >= targetPoint) {
            // 현재 조합이 기존 최적 조합보다 더 나은지 평가
            // 1. 의지력 소모가 더 적거나
            // 2. 의지력 소모는 같은데 포인트가 더 높으면
            if (currentWillpower < bestCombination.willpower ||
               (currentWillpower === bestCombination.willpower && currentPoints > bestCombination.points)) {
                bestCombination = {
                    gems: [...currentGems],
                    points: currentPoints,
                    willpower: currentWillpower,
                    achieved: true
                };
            }
        }

        // 4개를 다 채웠거나 더 탐색할 젬이 없으면 종료
        if (currentGems.length >= ARKGRID_DATA.gems.max_per_core || startIndex >= sortedGems.length) {
            return;
        }

        // 나머지 젬들을 탐색
        for (let i = startIndex; i < sortedGems.length; i++) {
            const newGem = sortedGems[i];
            const newWillpower = currentWillpower + newGem.willpower;

            if (newWillpower <= core.willpower) {
                // 최적화: 만약 현재 찾은 최고 조합보다 이미 의지력을 더 썼다면 더 볼 필요 없음
                if (newWillpower >= bestCombination.willpower) continue;

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

    coreSelectors.forEach(selector => {
        const grade = selector.value;
        if (grade === 'none') return;

        const coreId = selector.id; // e.g., "order-core-1"
        const targetPointInput = document.getElementById(`${coreId}-target`);
        const targetPoint = parseInt(targetPointInput.value, 10) || 0;

        const coreType = selector.dataset.coreType;
        const coreData = ARKGRID_DATA.cores[grade];
        const core = {
            name: `${coreType === 'order' ? '질서' : '혼돈'} 코어 ${selector.dataset.coreId} (${coreData.name})`,
            willpower: coreData.willpower,
            activationPoints: coreData.activationPoints,
            targetPoint: targetPoint
        };

        const availableGems = coreType === 'order' ? availableOrderGems : availableChaosGems;
        const result = findBestGemCombination(core, availableGems, targetPoint);

        if (result.achieved) {
            if (coreType === 'order') {
                availableOrderGems = availableOrderGems.filter(gem => !result.gems.some(usedGem => usedGem.id === gem.id));
            } else {
                availableChaosGems = availableChaosGems.filter(gem => !result.gems.some(usedGem => usedGem.id === gem.id));
            }
        }

        renderResult(core, result);
    });
}

function renderResult(core, result) {
    const resultEl = document.createElement('div');
    resultEl.className = 'result-core';

    let html;

    if (result.achieved) {
        let activatedOptions = core.activationPoints.filter(p => result.points >= p);
        let activatedOptionsStr = activatedOptions.length > 0 ? ` (활성: ${activatedOptions.join(', ')})` : ' (활성 옵션 없음)';

        html = `
            <h4>${core.name} - 목표 ${core.targetPoint} 달성!</h4>
            <p><strong>총 포인트:</strong> ${result.points}${activatedOptionsStr}</p>
            <p><strong>소모 의지력:</strong> ${result.willpower} / ${core.willpower}</p>
            <ul>
        `;
        result.gems.forEach(gem => {
            html += `<li>의지력 ${gem.willpower}, 포인트 ${gem.point} 젬</li>`;
        });
        html += `</ul>`;
    } else {
        html = `
            <h4>${core.name} - 목표 ${core.targetPoint} 달성 실패</h4>
            <p>해당 목표를 달성할 수 있는 젬 조합을 찾지 못했습니다.</p>
        `;
    }

    resultEl.innerHTML = html;
    resultsDiv.appendChild(resultEl);
}


// --- Event Listeners ---
addGemBtn.addEventListener('click', addGem);
calculateBtn.addEventListener('click', calculate);

// --- Initial Render ---
renderGemLists();
