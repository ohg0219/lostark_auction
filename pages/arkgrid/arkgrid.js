console.log("arkgrid.js loaded");

// --- Static Data ---

const ARKGRID_CORE_TYPES = {
    order: [
        { id: 'sun', name: '해', icon: 'https://ohg0219.github.io/lostark_auction/image/질서_해.png' },
        { id: 'moon', name: '달', icon: 'https://ohg0219.github.io/lostark_auction/image/질서_달.png' },
        { id: 'star', name: '별', icon: 'https://ohg0219.github.io/lostark_auction/image/질서_별.png' }
    ],
    chaos: [
        { id: 'sun', name: '해', icon: 'https://ohg0219.github.io/lostark_auction/image/혼돈_해.png' },
        { id: 'moon', name: '달', icon: 'https://ohg0219.github.io/lostark_auction/image/혼돈_달.png' },
        { id: 'star', name: '별', icon: 'https://ohg0219.github.io/lostark_auction/image/혼돈_별.png' }
    ]
};

const ARKGRID_GRADE_DATA = {
    none: { name: '선택 안함', willpower: 0, activationPoints: [] },
    heroic: { name: '영웅', willpower: 7, activationPoints: [10] },
    legendary: { name: '전설', willpower: 11, activationPoints: [10, 14] },
    relic: { name: '유물', willpower: 15, activationPoints: [10, 14, 17, 18, 19, 20] },
    ancient: { name: '고대', willpower: 17, activationPoints: [10, 14, 17, 18, 19, 20] }
};

const MAX_GEMS_PER_CORE = 4;

// --- DOM Elements ---
const chaosCoreColumn = document.getElementById('chaos-core-column');
const orderCoreColumn = document.getElementById('order-core-column');
const addGemBtn = document.getElementById('add-gem-btn');
const calculateBtn = document.getElementById('calculate-btn');
const orderGemList = document.getElementById('order-gem-list');
const chaosGemList = document.getElementById('chaos-gem-list');

// --- State ---
let orderGems = [];
let chaosGems = [];
let nextGemId = 0;
// selectedCores will track the selections for all 6 slots.
// Example: { 'chaos-1': 'sun', 'chaos-2': 'moon', ... }
let selectedCores = {};

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Create 3 slots for each column
    for (let i = 1; i <= 3; i++) {
        chaosCoreColumn.appendChild(createCoreSlot('chaos', i));
        orderCoreColumn.appendChild(createCoreSlot('order', i));
    }

    addGemBtn.addEventListener('click', addGem);
    calculateBtn.addEventListener('click', calculate);
}

// --- Functions ---

function createCoreSlot(type, id) {
    const slotId = `${type}-${id}`;
    const slot = document.createElement('div');
    slot.className = 'core-slot';
    slot.id = `slot-${slotId}`;

    // 1. Core Selection Controls
    const controls = document.createElement('div');
    controls.className = 'core-controls';

    // Core Type Dropdown
    const typeSelect = document.createElement('select');
    typeSelect.id = `type-${slotId}`;
    typeSelect.innerHTML = '<option value="none">코어 종류</option>' + ARKGRID_CORE_TYPES[type].map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    typeSelect.addEventListener('change', () => updateCoreTypeOptions(type));

    // Grade Dropdown
    const gradeSelect = document.createElement('select');
    gradeSelect.id = `grade-${slotId}`;
    gradeSelect.innerHTML = Object.keys(ARKGRID_GRADE_DATA).map(key => `<option value="${key}">${ARKGRID_GRADE_DATA[key].name}</option>`).join('');

    // Target Point Input
    const targetInput = document.createElement('input');
    targetInput.type = 'number';
    targetInput.id = `target-${slotId}`;
    targetInput.placeholder = '목표 P';

    controls.append(typeSelect, gradeSelect, targetInput);

    // 2. Gem Sockets
    const sockets = document.createElement('div');
    sockets.className = 'gem-sockets';
    sockets.id = `sockets-${slotId}`;
    for (let i = 0; i < MAX_GEMS_PER_CORE; i++) {
        const socket = document.createElement('div');
        socket.className = 'gem-socket';
        sockets.appendChild(socket);
    }

    slot.append(controls, sockets);
    return slot;
}

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


function updateCoreTypeOptions(type) {
    const selected = [];
    for (let i = 1; i <= 3; i++) {
        const currentVal = document.getElementById(`type-${type}-${i}`).value;
        if (currentVal !== 'none') {
            selected.push(currentVal);
        }
    }

    for (let i = 1; i <= 3; i++) {
        const dropdown = document.getElementById(`type-${type}-${i}`);
        const currentValue = dropdown.value;
        for (const option of dropdown.options) {
            if (option.value !== 'none' && option.value !== currentValue) {
                option.disabled = selected.includes(option.value);
            }
        }
    }
}

function calculate() {
    let availableOrderGems = [...orderGems];
    let availableChaosGems = [...chaosGems];

    ['chaos', 'order'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const typeId = document.getElementById(`type-${slotId}`).value;
            const gradeId = document.getElementById(`grade-${slotId}`).value;
            const targetPoint = parseInt(document.getElementById(`target-${slotId}`).value, 10) || 0;

            // Clear previous results
            const socketContainer = document.getElementById(`sockets-${slotId}`);
            socketContainer.innerHTML = ''; // Clear old gems
             for (let j = 0; j < MAX_GEMS_PER_CORE; j++) {
                const socket = document.createElement('div');
                socket.className = 'gem-socket';
                socketContainer.appendChild(socket);
            }

            if (typeId === 'none' || gradeId === 'none') continue;

            const coreTypeData = ARKGRID_CORE_TYPES[type].find(t => t.id === typeId);
            const coreGradeData = ARKGRID_GRADE_DATA[gradeId];

            const core = {
                name: `${coreTypeData.name} (${coreGradeData.name})`,
                willpower: coreGradeData.willpower,
            };

            const availableGems = type === 'order' ? availableOrderGems : availableChaosGems;
            const result = findBestGemCombination(core, availableGems, targetPoint);

            if (result.achieved) {
                if (type === 'order') {
                    availableOrderGems = availableOrderGems.filter(gem => !result.gems.some(usedGem => usedGem.id === gem.id));
                } else {
                    availableChaosGems = availableChaosGems.filter(gem => !result.gems.some(usedGem => usedGem.id === gem.id));
                }
            }
            renderResult(slotId, result);
        }
    });
}

function renderResult(slotId, result) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);

    if (!result.achieved) {
        const firstSocket = socketContainer.firstChild;
        if(firstSocket) firstSocket.textContent = '실패';
        return;
    }

    result.gems.forEach((gem, index) => {
        if (socketContainer.children[index]) {
            const socket = socketContainer.children[index];
            socket.textContent = `P${gem.point}/W${gem.willpower}`;
            // You can add more styling here, e.g., based on gem points
        }
    });
}

function findBestGemCombination(core, availableGems, targetPoint) {
    let bestCombination = {
        gems: [],
        points: 0,
        willpower: Infinity, // 최소화 대상
        achieved: false
    };

    const sortedGems = [...availableGems].sort((a, b) => {
        if (a.willpower !== b.willpower) return a.willpower - b.willpower;
        return b.point - a.point;
    });

    function find(startIndex, currentGems, currentWillpower, currentPoints) {
        if (currentPoints >= targetPoint) {
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

        if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= sortedGems.length) {
            return;
        }

        for (let i = startIndex; i < sortedGems.length; i++) {
            const newGem = sortedGems[i];
            const newWillpower = currentWillpower + newGem.willpower;

            if (newWillpower <= core.willpower) {
                if (newWillpower >= bestCombination.willpower) continue;

                currentGems.push(newGem);
                find(i + 1, currentGems, newWillpower, currentPoints + newGem.point);
                currentGems.pop();
            }
        }
    }

    find(0, [], 0, 0);
    return bestCombination;
}
