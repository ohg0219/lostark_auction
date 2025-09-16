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

const GRADE_COLORS = {
    "none": "#a5a5a5",
    "heroic": "#ba00f9",
    "legendary": "#f99200",
    "relic": "#fa5d00",
    "ancient": "#B3956C",
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

function createCustomDropdown(id, defaultText, items, onSelect) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    wrapper.id = id;
    wrapper.dataset.value = 'none';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `<span>${defaultText}</span>`;

    const options = document.createElement('div');
    options.className = 'custom-options';

    // Default option
    const defaultOption = document.createElement('div');
    defaultOption.className = 'custom-option';
    defaultOption.dataset.value = 'none';
    defaultOption.innerHTML = `<span>${defaultText}</span>`;
    defaultOption.addEventListener('click', () => {
        onSelect(wrapper, { value: 'none', text: defaultText, icon: null });
    });
    options.appendChild(defaultOption);

    // Other options
    items.forEach(item => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = item.id;
        option.innerHTML = item.icon ? `<img src="${item.icon}" alt="${item.name}"><span>${item.name}</span>` : `<span>${item.name}</span>`;
        option.addEventListener('click', () => {
             if (!option.classList.contains('disabled')) {
                onSelect(wrapper, { value: item.id, text: item.name, icon: item.icon });
            }
        });
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        // Close other dropdowns
        document.querySelectorAll('.custom-options').forEach(opt => {
            if (opt !== options) opt.style.display = 'none';
        });
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    wrapper.append(trigger, options);
    return wrapper;
}

function createCoreSlot(type, id) {
    const slotId = `${type}-${id}`;
    const slot = document.createElement('div');
    slot.className = 'core-slot';
    slot.id = `slot-${slotId}`;

    const controls = document.createElement('div');
    controls.className = 'core-controls';

    const gradeDataForDropdown = Object.keys(ARKGRID_GRADE_DATA).map(key => ({ id: key, name: ARKGRID_GRADE_DATA[key].name }));

    // --- Create all 3 dropdowns ---
    const targetSelectWrapper = createCustomDropdown(`target-${slotId}`, '목표 포인트', [], (tWrapper, tSelected) => {
        tWrapper.dataset.value = tSelected.value;
        tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
        tWrapper.querySelector('.custom-options').style.display = 'none';
    });
    targetSelectWrapper.classList.add('disabled');


    const gradeSelectWrapper = createCustomDropdown(`grade-${slotId}`, '등급', gradeDataForDropdown, (gWrapper, gSelected) => {
        gWrapper.dataset.value = gSelected.value;
        gWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${gSelected.text}</span>`;
        gWrapper.querySelector('.custom-options').style.display = 'none';

        const willpower = ARKGRID_GRADE_DATA[gSelected.value]?.willpower || 0;
        const activationPoints = ARKGRID_GRADE_DATA[gSelected.value]?.activationPoints || [];

        document.getElementById(`info-${slotId}`).textContent = willpower > 0 ? `공급 의지력: ${willpower}` : '';
        slot.style.borderColor = GRADE_COLORS[gSelected.value] || '#4a4a7e';

        const targetOptions = activationPoints.map(p => ({ id: p, name: p }));

        // Find existing target dropdown to replace
        const oldTargetDropdown = document.getElementById(`target-${slotId}`);
        const newTargetDropdown = createCustomDropdown(`target-${slotId}`, '목표 포인트', targetOptions, (tWrapper, tSelected) => {
            tWrapper.dataset.value = tSelected.value;
            tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
            tWrapper.querySelector('.custom-options').style.display = 'none';
        });

        oldTargetDropdown.replaceWith(newTargetDropdown);

        if (gSelected.value === 'none' || activationPoints.length === 0) {
            newTargetDropdown.classList.add('disabled');
        } else {
            newTargetDropdown.classList.remove('disabled');
        }
    });
    gradeSelectWrapper.classList.add('disabled');


    const coreTypeSelectWrapper = createCustomDropdown(`type-${slotId}`, '코어 종류', ARKGRID_CORE_TYPES[type], (cWrapper, cSelected) => {
        cWrapper.dataset.value = cSelected.value;
        cWrapper.querySelector('.custom-select-trigger').innerHTML = cSelected.icon ? `<img src="${cSelected.icon}" alt="${cSelected.text}"><span>${cSelected.text}</span>` : `<span>${cSelected.text}</span>`;
        cWrapper.querySelector('.custom-options').style.display = 'none';

        updateCoreTypeOptions(type);

        if (cSelected.value === 'none') {
            gradeSelectWrapper.classList.add('disabled');
            gradeSelectWrapper.dataset.value = 'none';
            gradeSelectWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>등급</span>`;
        } else {
            gradeSelectWrapper.classList.remove('disabled');
        }

        // Reset grade dropdown by clicking its "none" option
        gradeSelectWrapper.querySelector('.custom-option[data-value="none"]').click();
    });

    controls.append(coreTypeSelectWrapper, gradeSelectWrapper, targetSelectWrapper);

    const infoDisplay = document.createElement('div');
    infoDisplay.className = 'core-info';
    infoDisplay.id = `info-${slotId}`;

    const sockets = document.createElement('div');
    sockets.className = 'gem-sockets';
    sockets.id = `sockets-${slotId}`;
    for (let i = 0; i < MAX_GEMS_PER_CORE; i++) {
        const socket = document.createElement('div');
        socket.className = 'gem-socket';
        sockets.appendChild(socket);
    }

    const summaryDisplay = document.createElement('div');
    summaryDisplay.className = 'result-summary';
    summaryDisplay.id = `summary-${slotId}`;

    slot.append(controls, infoDisplay, sockets, summaryDisplay);
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

    ['order', 'chaos'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const typeId = document.getElementById(`type-${slotId}`).dataset.value;
            const gradeId = document.getElementById(`grade-${slotId}`).dataset.value;
            const targetPoint = parseInt(document.getElementById(`target-${slotId}`).dataset.value, 10) || 0;

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

            if (result.points > -1) {
                const usedGemIds = result.gems.map(g => g.id);
                if (type === 'order') {
                    availableOrderGems = availableOrderGems.filter(gem => !usedGemIds.includes(gem.id));
                } else {
                    availableChaosGems = availableChaosGems.filter(gem => !usedGemIds.includes(gem.id));
                }
            }
            renderResult(slotId, core, result);
        }
    });
}

function renderResult(slotId, core, result) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);
    const summaryEl = document.getElementById(`summary-${slotId}`);

    if (!result.achieved) {
        const slotElement = document.getElementById(`slot-${slotId}`);
        slotElement.classList.add('target-failed');
    }

    if (result.points <= -1) {
        summaryEl.textContent = '';
        return;
    }

    result.gems.forEach((gem, index) => {
        if (socketContainer.children[index]) {
            const socket = socketContainer.children[index];
            socket.innerHTML = `의지력: ${gem.willpower}<br>포인트: ${gem.point}`;
        }
    });

    summaryEl.innerHTML = `의지력: ${result.willpower} / ${core.willpower}<br>포인트: ${result.points}`;
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
