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

    const controls = document.createElement('div');
    controls.className = 'core-controls';

    // --- Custom Core Type Dropdown ---
    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'custom-select-wrapper';
    selectWrapper.id = `type-${slotId}`; // Keep id for easy access
    selectWrapper.dataset.value = 'none'; // Store selected value

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = '<span>코어 종류</span>';

    const options = document.createElement('div');
    options.className = 'custom-options';

    // Default "None" option
    const defaultOption = document.createElement('div');
    defaultOption.className = 'custom-option';
    defaultOption.dataset.value = 'none';
    defaultOption.innerHTML = '<span>코어 종류</span>';
    defaultOption.addEventListener('click', () => selectOption(selectWrapper, 'none', '코어 종류', null, type));
    options.appendChild(defaultOption);

    // Other options
    ARKGRID_CORE_TYPES[type].forEach(coreType => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = coreType.id;
        option.innerHTML = `<img src="${coreType.icon}" alt="${coreType.name}"><span>${coreType.name}</span>`;
        option.addEventListener('click', () => selectOption(selectWrapper, coreType.id, coreType.name, coreType.icon, type));
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });
    selectWrapper.append(trigger, options);

    // --- Grade and Target ---
    const gradeSelect = document.createElement('select');
    gradeSelect.id = `grade-${slotId}`;
    gradeSelect.innerHTML = Object.keys(ARKGRID_GRADE_DATA).map(key => `<option value="${key}">${ARKGRID_GRADE_DATA[key].name}</option>`).join('');

    const targetInput = document.createElement('input');
    targetInput.type = 'number';
    targetInput.id = `target-${slotId}`;
    targetInput.placeholder = '목표 P';

    controls.append(selectWrapper, gradeSelect, targetInput);

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

function selectOption(wrapper, value, name, iconUrl, type) {
    wrapper.dataset.value = value;
    const trigger = wrapper.querySelector('.custom-select-trigger');
    if (iconUrl) {
        trigger.innerHTML = `<img src="${iconUrl}" alt="${name}"><span>${name}</span>`;
    } else {
        trigger.innerHTML = `<span>${name}</span>`;
    }
    wrapper.querySelector('.custom-options').style.display = 'none';
    updateCoreTypeOptions(type);
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
    const selectedValues = [];
    for (let i = 1; i <= 3; i++) {
        const wrapper = document.getElementById(`type-${type}-${i}`);
        if (wrapper.dataset.value !== 'none') {
            selectedValues.push(wrapper.dataset.value);
        }
    }

    for (let i = 1; i <= 3; i++) {
        const wrapper = document.getElementById(`type-${type}-${i}`);
        const currentValue = wrapper.dataset.value;
        const options = wrapper.querySelectorAll('.custom-option');
        options.forEach(option => {
            const optionValue = option.dataset.value;
            if (optionValue !== 'none' && optionValue !== currentValue) {
                if (selectedValues.includes(optionValue)) {
                    option.classList.add('disabled');
                } else {
                    option.classList.remove('disabled');
                }
            }
        });
    }
}



function calculate() {
    let availableOrderGems = [...orderGems];
    let availableChaosGems = [...chaosGems];

    ['chaos', 'order'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const typeId = document.getElementById(`type-${slotId}`).dataset.value;
            const gradeId = document.getElementById(`grade-${slotId}`).value;
            const targetPoint = parseInt(document.getElementById(`target-${slotId}`).value, 10) || 0;

            const slotElement = document.getElementById(`slot-${slotId}`);
            slotElement.classList.remove('target-failed');

            const socketContainer = document.getElementById(`sockets-${slotId}`);
            socketContainer.innerHTML = '';
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

            // Only consume gems if a valid combination was found (points > -1)
            if (result.points > -1) {
                // Always use the gems from the result, whether target was achieved or not
                const usedGemIds = result.gems.map(g => g.id);
                if (type === 'order') {
                    availableOrderGems = availableOrderGems.filter(gem => !usedGemIds.includes(gem.id));
                } else {
                    availableChaosGems = availableChaosGems.filter(gem => !usedGemIds.includes(gem.id));
                }
            }
            renderResult(slotId, result);
        }
    });
}

function renderResult(slotId, result) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);

    if (!result.achieved) {
        const slotElement = document.getElementById(`slot-${slotId}`);
        slotElement.classList.add('target-failed');
    }

    if (result.points <= -1) return; // No valid combination found at all

    result.gems.forEach((gem, index) => {
        if (socketContainer.children[index]) {
            const socket = socketContainer.children[index];
            socket.innerHTML = `의지력: ${gem.willpower}<br>포인트: ${gem.point}`;
        }
    });
}

function findBestGemCombination(core, availableGems, targetPoint) {
    let bestAchieved = { gems: [], points: 0, willpower: Infinity, achieved: false };
    let bestOverall = { gems: [], points: -1, willpower: 0 };

    const sortedGems = [...availableGems].sort((a, b) => b.point - a.point);

    function find(startIndex, currentGems, currentWillpower, currentPoints) {
        // Update bestOverall combination (highest points)
        if (currentPoints > bestOverall.points) {
            bestOverall = {
                gems: [...currentGems],
                points: currentPoints,
                willpower: currentWillpower
            };
        }

        // Check for and update bestAchieved combination
        if (targetPoint > 0 && currentPoints >= targetPoint) {
            if (currentWillpower < bestAchieved.willpower ||
               (currentWillpower === bestAchieved.willpower && currentPoints > bestAchieved.points)) {
                bestAchieved = {
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
                currentGems.push(newGem);
                find(i + 1, currentGems, newWillpower, currentPoints + newGem.point);
                currentGems.pop();
            }
        }
    }

    find(0, [], 0, 0);

    if (bestAchieved.achieved) {
        return bestAchieved;
    } else {
        // Return the best combination found, marking that it didn't meet the target
        return { ...bestOverall, achieved: false };
    }
}
