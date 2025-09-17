console.log("arkgrid.js loaded");

// --- Tab Functionality ---
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// --- Static Data ---

const GEM_IMAGES = {
    order: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_102.png',
    chaos: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_103.png'
};

const ARKGRID_CORE_TYPES = {
    order: [
        { id: 'sun', name: '해', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_96.png' },
        { id: 'moon', name: '달', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_97.png' },
        { id: 'star', name: '별', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_98.png' }
    ],
    chaos: [
        { id: 'sun', name: '해', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_99.png' },
        { id: 'moon', name: '달', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_100.png' },
        { id: 'star', name: '별', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_101.png' }
    ]
};

const ARKGRID_GRADE_DATA = {
    heroic: { name: '영웅', willpower: 7, activationPoints: [10] },
    legendary: { name: '전설', willpower: 11, activationPoints: [10, 14] },
    relic: { name: '유물', willpower: 15, activationPoints: [10, 14, 17, 18, 19, 20] },
    ancient: { name: '고대', willpower: 17, activationPoints: [10, 14, 17, 18, 19, 20] }
};

const GRADE_COLORS = {
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
    // Initialize tabs
    initializeTabs();

    // Create 3 slots for each column
    for (let i = 1; i <= 3; i++) {
        orderCoreColumn.appendChild(createCoreSlot('order', i));
        chaosCoreColumn.appendChild(createCoreSlot('chaos', i));
    }

    // Create gem input dropdowns
    const gemInputForm = document.getElementById('gem-input-form');
    const gemTypeDropdown = createCustomDropdown('gem-type', '젬 종류', [{id: 'order', name: '질서', icon: GEM_IMAGES.order}, {id: 'chaos', name: '혼돈', icon: GEM_IMAGES.chaos}], (w, s) => { w.dataset.value = s.value; w.querySelector('.custom-select-trigger').innerHTML = s.icon ? `<img src="${s.icon}" alt="${s.text}"><span>${s.text}</span>` : `<span>${s.text}</span>`; w.querySelector('.custom-options').style.display = 'none'; });
    const willpowerDropdown = createCustomDropdown('gem-willpower', '의지력', [{id: 3, name: 3}, {id: 4, name: 4}, {id: 5, name: 5}], (w, s) => { w.dataset.value = s.value; w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`; w.querySelector('.custom-options').style.display = 'none'; });
    const pointDropdown = createCustomDropdown('gem-point', '포인트', [{id: 1, name: 1}, {id: 2, name: 2}, {id: 3, name: 3}, {id: 4, name: 4}, {id: 5, name: 5}], (w, s) => { w.dataset.value = s.value; w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`; w.querySelector('.custom-options').style.display = 'none'; });

    // Create row containers
    const row1 = document.createElement('div');
    row1.className = 'gem-input-row single';
    row1.appendChild(gemTypeDropdown);

    const row2 = document.createElement('div');
    row2.className = 'gem-input-row';
    row2.appendChild(willpowerDropdown);
    row2.appendChild(pointDropdown);

    const row3 = document.createElement('div');
    row3.className = 'gem-input-row single';
    row3.appendChild(addGemBtn);

    gemInputForm.appendChild(row1);
    gemInputForm.appendChild(row2);
    gemInputForm.appendChild(row3);

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
        if (wrapper.classList.contains('disabled')) return;
        // Close other dropdowns
        document.querySelectorAll('.custom-options').forEach(opt => {
            if (opt !== options) opt.style.display = 'none';
        });
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    wrapper.append(trigger, options);
    return wrapper;
}

function createGradeDropdown(id, defaultText, items, onSelect) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    wrapper.id = id;
    wrapper.dataset.value = 'none';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `<span>${defaultText}</span>`;

    const options = document.createElement('div');
    options.className = 'custom-options';

    // Grade options only - no default option
    items.forEach(item => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = item.id;
        option.innerHTML = `<span>${item.name}</span>`;
        option.addEventListener('click', () => {
            onSelect(wrapper, { value: item.id, text: item.name, icon: null });
        });
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        if (wrapper.classList.contains('disabled')) return;
        // Close other dropdowns
        document.querySelectorAll('.custom-options').forEach(opt => {
            if (opt !== options) opt.style.display = 'none';
        });
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    wrapper.append(trigger, options);
    return wrapper;
}

function clearSlotResults(slotId) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);
    socketContainer.innerHTML = '';
    for (let j = 0; j < MAX_GEMS_PER_CORE; j++) {
        const socket = document.createElement('div');
        socket.className = 'gem-socket';
        socketContainer.appendChild(socket);
    }
    document.getElementById(`summary-${slotId}`).innerHTML = '';
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


    const gradeSelectWrapper = createGradeDropdown(`grade-${slotId}`, '등급', gradeDataForDropdown, (gWrapper, gSelected) => {
        gWrapper.dataset.value = gSelected.value;
        gWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${gSelected.text}</span>`;
        gWrapper.querySelector('.custom-options').style.display = 'none';

        const gradeData = ARKGRID_GRADE_DATA[gSelected.value];
        const willpower = gradeData.willpower;
        const activationPoints = gradeData.activationPoints;

        document.getElementById(`info-${slotId}`).textContent = `공급 의지력: ${willpower}`;
        slot.style.borderColor = GRADE_COLORS[gSelected.value];

        // Clear previous calculation results and remove target-failed class
        const slotElement = document.getElementById(`slot-${slotId}`);
        slotElement.classList.remove('target-failed');
        clearSlotResults(slotId);

        const targetOptions = activationPoints.map(p => ({ id: p, name: p }));

        // Find existing target dropdown to replace
        const oldTargetDropdown = document.getElementById(`target-${slotId}`);
        const newTargetDropdown = createCustomDropdown(`target-${slotId}`, '목표 포인트', targetOptions, (tWrapper, tSelected) => {
            tWrapper.dataset.value = tSelected.value;
            tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
            tWrapper.querySelector('.custom-options').style.display = 'none';
        });

        oldTargetDropdown.replaceWith(newTargetDropdown);

        if (activationPoints.length === 0) {
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
            clearSlotResults(slotId); // Clear results when core type is reset
        } else {
            gradeSelectWrapper.classList.remove('disabled');
            // Reset grade dropdown to show placeholder text
            gradeSelectWrapper.dataset.value = 'none';
            gradeSelectWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>등급</span>`;
        }

        // Reset target dropdown to initial state and disable it
        const currentTargetDropdown = document.getElementById(`target-${slotId}`);
        const resetTargetDropdown = createCustomDropdown(`target-${slotId}`, '목표 포인트', [], (tWrapper, tSelected) => {
            tWrapper.dataset.value = tSelected.value;
            tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
            tWrapper.querySelector('.custom-options').style.display = 'none';
        });
        resetTargetDropdown.classList.add('disabled');
        currentTargetDropdown.replaceWith(resetTargetDropdown);

        // Clear slot info and reset border color
        document.getElementById(`info-${slotId}`).textContent = '';
        slot.style.borderColor = '#333333';
        clearSlotResults(slotId);
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
    const type = document.getElementById('gem-type').dataset.value;
    const willpowerStr = document.getElementById('gem-willpower').dataset.value;
    const pointStr = document.getElementById('gem-point').dataset.value;

    if (type === 'none' || willpowerStr === 'none' || pointStr === 'none') {
        alert('젬 종류, 의지력, 포인트를 모두 선택하세요.');
        return;
    }

    const willpower = parseInt(willpowerStr, 10);
    const point = parseInt(pointStr, 10);

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

    renderGemLists();
}

function renderGemLists() {
    orderGemList.innerHTML = '';
    chaosGemList.innerHTML = '';

    const createGemElement = (gem) => {
        const gemEl = document.createElement('div');
        gemEl.className = `gem-item ${gem.type}`;

        const gemImage = GEM_IMAGES[gem.type];
        gemEl.innerHTML = `
            <div class="gem-item-content">
                <img src="${gemImage}" alt="${gem.type} 젬" class="gem-item-image">
                <div class="gem-item-stats">
                    <div>의지력: ${gem.willpower}</div>
                    <div>포인트: ${gem.point}</div>
                </div>
            </div>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'gem-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '젬 삭제';
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
            const gemImage = GEM_IMAGES[gem.type];
            socket.innerHTML = `
                <div class="gem-socket-content">
                    <img src="${gemImage}" alt="${gem.type} 젬" class="gem-socket-image">
                    <div class="gem-socket-stats">
                        <div>의지력: ${gem.willpower}</div>
                        <div>포인트: ${gem.point}</div>
                    </div>
                </div>
            `;
            socket.classList.add('gem-equipped');
        }
    });

    summaryEl.innerHTML = `[의지력: ${result.willpower} / ${core.willpower}] [포인트: ${result.points}]`;
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
