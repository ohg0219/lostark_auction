import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 탭 버튼과 탭 패널을 초기화하고 클릭 이벤트를 설정하여 탭을 전환합니다.
 *
 * @return {void} 이 메서드는 아무 값도 반환하지 않습니다.
 */
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

/**
 * `GEM_IMAGES` 변수는 게임 내에서 사용되는 보석(Order, Chaos)의 이미지를 나타내는 URL을 저장한 객체입니다.
 *
 * 속성:
 * - `order`: 보석(Order) 이미지를 나타내는 URL 문자열.
 * - `chaos`: 보석(Chaos) 이미지를 나타내는 URL 문자열.
 */
const GEM_IMAGES = {
    order: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_102.png',
    chaos: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_103.png'
};

/**
 * ARKGRID_CORE_TYPES는 Lost Ark 게임의 UI 구성 요소를 나타내는 객체입니다.
 *
 * @description
 * ARKGRID_CORE_TYPES는 두 가지 유형(order, chaos)으로 구성되어 있으며,
 * 각 유형에는 세 가지 항목(해, 달, 별)이 포함되어 있습니다.
 * 각 항목은 고유의 id, 이름(name), 아이콘(icon) URL을 가지고 있습니다.
 *
 * @property {Object[]} order - "order" 유형에 속하는 항목 목록.
 * @property {string} order[].id - 항목의 고유 식별자. (예: 'sun', 'moon', 'star')
 * @property {string} order[].name - 항목의 이름. (예: '해', '달', '별')
 * @property {string} order[].icon - 항목의 아이콘 URL.
 *
 * @property {Object[]} chaos - "chaos" 유형에 속하는 항목 목록.
 * @property {string} chaos[].id - 항목의 고유 식별자. (예: 'sun', 'moon', 'star')
 * @property {string} chaos[].name - 항목의 이름. (예: '해', '달', '별')
 * @property {string} chaos[].icon - 항목의 아이콘 URL.
 */
const ARKGRID_CORE_TYPES = {
    order: [
        {id: 'sun', name: '해', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_96.png'},
        {id: 'moon', name: '달', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_97.png'},
        {id: 'star', name: '별', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_98.png'}
    ],
    chaos: [
        {id: 'sun', name: '해', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_99.png'},
        {id: 'moon', name: '달', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_100.png'},
        {id: 'star', name: '별', icon: 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_101.png'}
    ]
};

/**
 * ARKGRID_GRADE_DATA는 게임 내 등급에 따른 속성 데이터를 정의합니다.
 *
 * 각 등급은 다음과 같은 정보를 포함합니다:
 * - 이름 (name): 등급의 이름.
 * - 정신력 (willpower): 해당 등급의 정신력 수치.
 * - 활성화 포인트 (activationPoints): 해당 등급에서 사용할 수 있는 활성화 포인트 목록.
 *
 * 속성 설명:
 * - heroic: '영웅' 등급의 데이터.
 * - legendary: '전설' 등급의 데이터.
 * - relic: '유물' 등급의 데이터.
 * - ancient: '고대' 등급의 데이터.
 */
const ARKGRID_GRADE_DATA = {
    heroic: {name: '영웅', willpower: 7, activationPoints: [10]},
    legendary: {name: '전설', willpower: 11, activationPoints: [10, 14]},
    relic: {name: '유물', willpower: 15, activationPoints: [10, 14, 17, 18, 19, 20]},
    ancient: {name: '고대', willpower: 17, activationPoints: [10, 14, 17, 18, 19, 20]}
};

/**
 * GRADE_COLORS 변수는 아이템 등급에 따라 색상을 정의하는 객체입니다.
 * 각 키는 아이템의 등급을 나타내며, 값은 해당 등급에 대응하는 색상을 나타냅니다.
 */
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
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
// Modal DOM Elements
const modal = document.getElementById('data-modal');
const modalTitle = document.getElementById('modal-title');
const modalCharacterNameInput = document.getElementById('modal-character-name');
const modalCharacterPasswordInput = document.getElementById('modal-character-password');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');


// --- State ---
let orderGems = [];
let chaosGems = [];
let nextGemId = 0;
// selectedCores will track the selections for all 6 slots.
// Example: { 'chaos-1': 'sun', 'chaos-2': 'moon', ... }
let selectedCores = {};
let currentModalConfirmAction = null;


// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', init);

/**
 * 초기화 메서드로, 사용자 인터페이스 요소를 설정하고 이벤트 리스너를 바인딩합니다.
 *
 * @return {void} 초기화 작업을 수행하며 반환 값이 없습니다.
 */
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
    const gemTypeDropdown = createCustomDropdown('gem-type', '젬 종류',
        [{id: 'order', name: '질서', icon: GEM_IMAGES.order}, {id: 'chaos', name: '혼돈', icon: GEM_IMAGES.chaos}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = s.icon ? `<img src="${s.icon}" alt="${s.text}"><span>${s.text}</span>` : `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
        });
    const willpowerDropdown = createCustomDropdown('gem-willpower', '의지력',
        [{id: 3, name: 3}, {id: 4, name: 4}, {id: 5, name: 5}, {id: 6, name: 6}, {id: 7, name: 7}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
        });
    const pointDropdown = createCustomDropdown('gem-point', '포인트',
        [{id: 1, name: 1}, {id: 2, name: 2}, {id: 3, name: 3}, {id: 4, name: 4}, {id: 5, name: 5}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
        });

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

    // Main save/load button listeners
    saveBtn.addEventListener('click', () => openPopup('save'));
    loadBtn.addEventListener('click', () => openPopup('load'));

    // Modal button listeners
    modalCancelBtn.addEventListener('click', closePopup);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePopup();
        }
    });
    modalConfirmBtn.addEventListener('click', () => {
        if (currentModalConfirmAction) {
            currentModalConfirmAction();
        }
    });
}

// --- Functions ---
/**
 * 주어진 ID, 기본 텍스트 및 옵션 항목을 사용하여 커스텀 드롭다운을 생성합니다.
 *
 * @param {string} id 드롭다운의 고유 식별자
 * @param {string} defaultText 드롭다운의 기본 표시 텍스트
 * @param {Array.<{id: string, name: string, icon: string|undefined}>} items 드롭다운에서 표시될 옵션 항목 배열, 각 항목은 고유 ID, 이름, 선택적 아이콘을 가짐
 * @param {function} onSelect 드롭다운 옵션 선택 시 호출되는 콜백 함수. 선택된 항목의 데이터를 매개변수로 받음(wrapper, {value, text, icon})
 * @return {Element} DOM 요소로 생성된 커스텀 드롭다운 컴포넌트
 */
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
        onSelect(wrapper, {value: 'none', text: defaultText, icon: null});
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
                onSelect(wrapper, {value: item.id, text: item.name, icon: item.icon});
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

/**
 * 주어진 항목으로 구성된 드롭다운을 생성합니다.
 *
 * @param {string} id 드롭다운 요소의 고유 식별자입니다.
 * @param {string} defaultText 드롭다운에 표시될 기본 텍스트입니다.
 * @param {Array} items 드롭다운에 포함될 항목 객체 배열입니다. 각 객체는 id와 name 속성을 포함해야 합니다.
 * @param {function} onSelect 항목 선택 시 호출될 콜백 함수입니다. 선택된 항목의 정보(value, text, icon)를 매개변수로 전달받습니다.
 * @return {HTMLElement} 생성된 드롭다운을 포함하는 div 요소입니다.
 */
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
            onSelect(wrapper, {value: item.id, text: item.name, icon: null});
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

/**
 * 주어진 슬롯 ID에 해당하는 슬롯 결과를 초기화합니다.
 *
 * @param {number|string} slotId 초기화할 슬롯의 ID
 * @return {void}
 */
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

/**
 * 지정된 유형과 ID를 바탕으로 코어 슬롯을 생성합니다.
 * 생성된 코어 슬롯은 목표 포인트 선택, 등급 선택, 그리고 코어 종류 선택을 위한 커스텀 드롭다운과 관련 데이터를 포함합니다.
 *
 * @param {string} type 코어 슬롯의 유형을 나타내는 문자열입니다.
 * @param {string} id 코어 슬롯의 고유 식별자를 나타내는 문자열입니다.
 * @return {HTMLElement} 완성된 코어 슬롯 요소를 반환합니다.
 */
function createCoreSlot(type, id) {
    const slotId = `${type}-${id}`;
    const slot = document.createElement('div');
    slot.className = 'core-slot';
    slot.id = `slot-${slotId}`;

    const controls = document.createElement('div');
    controls.className = 'core-controls';

    const gradeDataForDropdown = Object.keys(ARKGRID_GRADE_DATA).map(key => ({
        id: key,
        name: ARKGRID_GRADE_DATA[key].name
    }));

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

        const targetOptions = activationPoints.map(p => ({id: p, name: p}));

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

/**
 * 새 젬 데이터를 추가하는 함수입니다. 유효하지 않은 데이터가 입력되었을 경우 경고 메시지를 출력합니다.
 *
 * @return {undefined} 함수는 반환값이 없으며, 젬 데이터를 추가하거나 경고 메시지를 출력하고 종료합니다.
 */
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

    if (isNaN(willpower) || isNaN(point) || willpower < 3 || willpower > 7 || point < 1 || point > 5) {
        alert('유효한 젬 정보를 입력하세요. (의지력: 3-7, 포인트: 1-5)');
        return;
    }

    const gem = {id: nextGemId++, type, willpower, point};

    if (type === 'order') {
        orderGems.push(gem);
    } else {
        chaosGems.push(gem);
    }

    renderGemLists();
}

/**
 * `renderGemLists` 메서드는 orderGems와 chaosGems 배열에 있는 젬 데이터를 기반으로
 * 각각 orderGemList와 chaosGemList DOM 요소에 젬 목록을 렌더링합니다.
 *
 * @return {void} 이 메서드는 반환값이 없으며, DOM을 업데이트합니다.
 */
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


/**
 * 지정된 타입에 따라 옵션을 업데이트하는 함수입니다. 선택된 값들을 확인하고,
 * 중복 선택이 되지 않도록 옵션의 상태를 조정합니다.
 *
 * @param {string} type 업데이트할 타입의 식별자입니다.
 * @return {void} 반환값이 없습니다.
 */
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


/**
 * `calculate` 함수는 슬롯에 할당된 보석과 핵심 데이터에 따라 최적의 보석 조합을 계산하고 결과를 렌더링합니다.
 * 슬롯별 목표 점수 달성 여부를 확인하며, 사용된 보석은 이후 슬롯 계산에서 제외됩니다.
 *
 * @return {void} 이 함수는 반환값이 없으며, DOM을 업데이트하여 계산 결과를 반영합니다.
 */
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

/**
 * 주어진 슬롯 ID와 결과값을 기반으로 UI 요소를 업데이트하여 결과를 렌더링합니다.
 *
 * @param {string} slotId - 업데이트할 슬롯의 ID.
 * @param {Object} core - 코어 오브젝트이며, 동작에 필요한 데이터(예: 의지력)를 포함합니다.
 * @param {Object} result - 렌더링할 결과 데이터로, `achieved`, `points`, `gems`, `willpower`를 포함합니다.
 * @param {boolean} result.achieved - 요청된 목표 달성 여부.
 * @param {number} result.points - 결과 포인트 값.
 * @param {Array} result.gems - 보석 정보 배열.
 * @param {number} result.willpower - 계산된 의지력 값.
 * @return {void} 이 메서드는 값을 반환하지 않습니다.
 */
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

/**
 * 사용 가능한 보석과 코어의 조건을 기반으로 최적의 보석 조합을 찾습니다. 목표 점수를 달성할 수 있다면 해당 정보를 반환하고,
 * 목표를 달성하지 못할 경우 가장 높은 점수를 얻을 수 있는 조합을 반환합니다.
 *
 * @param {Object} core 코어의 정보를 포함하는 객체. core.willpower는 총 제한 의지력입니다.
 * @param {Array} availableGems 사용 가능한 보석 목록. 각 보석은 point와 willpower 속성을 가진 객체입니다.
 * @param {number} targetPoint 달성해야 할 목표 점수. 0 이하의 값이 주어진 경우 목표 점수 없이 최적 조합을 찾습니다.
 * @return {Object} 최적의 보석 조합을 나타내는 객체. gems, points, willpower, achieved 속성을 포함하며,
 *                  achieved가 true면 목표를 달성했음을 나타냅니다. 달성하지 못했다면 achieved는 false입니다.
 */
function findBestGemCombination(core, availableGems, targetPoint) {
    // If no target is specified, find the combination with the maximum possible points.
    if (targetPoint <= 0) {
        let bestCombination = { gems: [], points: -1, willpower: 0, achieved: false };

        function findMax(startIndex, currentGems, currentWillpower, currentPoints) {
            if (currentPoints > bestCombination.points || (currentPoints === bestCombination.points && currentWillpower < bestCombination.willpower)) {
                bestCombination = { gems: [...currentGems], points: currentPoints, willpower: currentWillpower, achieved: false };
            }
            if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= availableGems.length) {
                return;
            }
            for (let i = startIndex; i < availableGems.length; i++) {
                const newGem = availableGems[i];
                if (currentWillpower + newGem.willpower <= core.willpower) {
                    currentGems.push(newGem);
                    findMax(i + 1, currentGems, currentWillpower + newGem.willpower, currentPoints + newGem.point);
                    currentGems.pop();
                }
            }
        }
        findMax(0, [], 0, 0);
        return bestCombination;
    }

    // --- Logic for when a targetPoint is provided ---
    // Combination with the highest score BELOW the target
    let bestUnderTarget = { gems: [], points: -1, willpower: 0, achieved: false };
    // Combination with the lowest score ABOVE OR EQUAL to the target
    let bestOverTarget = { gems: [], points: Infinity, willpower: 0, achieved: true };

    function findClosest(startIndex, currentGems, currentWillpower, currentPoints) {
        // Check if the current combination is a candidate for bestUnderTarget or bestOverTarget
        if (currentPoints >= targetPoint) {
            // This combination meets or exceeds the target.
            // We want the one with the LOWEST score (closest to the target).

            // Tie-breaker: higher willpower to use up budget and leave smaller gems for others.
            if (currentPoints < bestOverTarget.points || (currentPoints === bestOverTarget.points && currentWillpower > bestOverTarget.willpower)) {
                bestOverTarget = { gems: [...currentGems], points: currentPoints, willpower: currentWillpower, achieved: true };
            }
        } else { // currentPoints < targetPoint
            // This combination is under the target.
            // We want the one with the HIGHEST score (closest to the target).
            if (currentPoints > bestUnderTarget.points || (currentPoints === bestUnderTarget.points && currentWillpower < bestUnderTarget.willpower)) {
                bestUnderTarget = { gems: [...currentGems], points: currentPoints, willpower: currentWillpower, achieved: false };
            }
        }

        // Base case for recursion
        if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= availableGems.length) {
            return;
        }

        // Recursive step
        for (let i = startIndex; i < availableGems.length; i++) {
            const newGem = availableGems[i];
            if (currentWillpower + newGem.willpower <= core.willpower) {
                currentGems.push(newGem);
                findClosest(i + 1, currentGems, currentWillpower + newGem.willpower, currentPoints + newGem.point);
                currentGems.pop();
            }
        }
    }

    findClosest(0, [], 0, 0);

    // --- Determine final result ---
    // If we found a combination that meets/exceeds the target, that's our preferred answer.
    if (bestOverTarget.points !== Infinity) {
        return bestOverTarget;
    }
    // Otherwise, return the best we found that was under the target.
    if (bestUnderTarget.points !== -1) {
        return bestUnderTarget;
    }
    // If absolutely no combination was possible, return an empty/failure state.
    return { gems: [], points: -1, willpower: 0, achieved: false };
}

async function saveData(characterName, password) {
    if (!characterName || !password) {
        alert('캐릭터명과 비밀번호를 모두 입력해주세요.');
        return;
    }

    // 1. Gather current configuration
    const coreSlots = {};
    ['order', 'chaos'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const typeId = document.getElementById(`type-${slotId}`).dataset.value || 'none';
            const gradeId = document.getElementById(`grade-${slotId}`).dataset.value || 'none';
            const targetPoint = document.getElementById(`target-${slotId}`).dataset.value || 'none';
            coreSlots[slotId] = { type: typeId, grade: gradeId, target: targetPoint };
        }
    });

    const arkgridConfig = {
        orderGems: orderGems,
        chaosGems: chaosGems,
        coreSlots: coreSlots
    };

    try {
        // 2. Check if character exists
        let { data: existingData, error: selectError } = await supabase
            .from('arkgrid_data')
            .select('password')
            .eq('character_name', characterName)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "No rows found", which is not an error for us.
            throw selectError;
        }

        // 3. Insert or Update
        if (existingData) {
            // Character exists, check password and update
            if (existingData.password === password) {
                const { error: updateError } = await supabase
                    .from('arkgrid_data')
                    .update({ arkgrid_config: arkgridConfig })
                    .eq('character_name', characterName);

                if (updateError) throw updateError;
                alert('데이터를 덮어썼습니다.');
                closePopup();
            } else {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }
        } else {
            // Character does not exist, insert new data
            const { error: insertError } = await supabase
                .from('arkgrid_data')
                .insert([
                    { character_name: characterName, password: password, arkgrid_config: arkgridConfig }
                ]);

            if (insertError) throw insertError;
            alert('데이터를 새로 저장했습니다.');
            closePopup();
        }

    } catch (error) {
        console.error('데이터 저장 중 오류 발생:', error);
        alert(`데이터 저장에 실패했습니다: ${error.message}`);
    }
}

async function loadData(characterName, password) {
    if (!characterName || !password) {
        alert('캐릭터명과 비밀번호를 모두 입력해주세요.');
        return;
    }

    try {
        let { data, error } = await supabase
            .from('arkgrid_data')
            .select('password, arkgrid_config')
            .eq('character_name', characterName)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows found
                alert('해당 캐릭터명의 데이터가 존재하지 않습니다.');
            } else {
                throw error;
            }
            return;
        }

        if (data.password === password) {
            alert('데이터를 불러옵니다.');
            restoreState(data.arkgrid_config);
            closePopup();
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }

    } catch (error) {
        console.error('데이터 불러오기 중 오류 발생:', error);
        alert(`데이터 불러오기에 실패했습니다: ${error.message}`);
    }
}

function restoreState(config) {
    // 1. Restore Gems
    orderGems = config.orderGems || [];
    chaosGems = config.chaosGems || [];

    // Reset nextGemId to prevent ID conflicts
    const maxOrderId = orderGems.reduce((max, gem) => Math.max(max, gem.id), -1);
    const maxChaosId = chaosGems.reduce((max, gem) => Math.max(max, gem.id), -1);
    nextGemId = Math.max(maxOrderId, maxChaosId) + 1;

    renderGemLists();

    // 2. Restore Core Slots
    if (config.coreSlots) {
        Object.keys(config.coreSlots).forEach(slotId => {
            const slotConfig = config.coreSlots[slotId];

            // Helper function to programmatically "click" an option in a custom dropdown
            const selectDropdownOption = (dropdownId, valueToSelect) => {
                if (!valueToSelect || valueToSelect === 'none') {
                     // If the value is none, we need to reset the dropdown
                    const wrapper = document.getElementById(dropdownId);
                    if (!wrapper) return;
                    const defaultOption = wrapper.querySelector('.custom-option[data-value="none"]');
                    if(defaultOption) {
                        defaultOption.click();
                    }
                    return;
                };
                const wrapper = document.getElementById(dropdownId);
                if (!wrapper) return;
                const option = wrapper.querySelector(`.custom-option[data-value="${valueToSelect}"]`);
                if (option) {
                    option.click();
                }
            };

            // Restore in sequence: Type -> Grade -> Target
            selectDropdownOption(`type-${slotId}`, slotConfig.type);
            selectDropdownOption(`grade-${slotId}`, slotConfig.grade);
            selectDropdownOption(`target-${slotId}`, slotConfig.target);
        });
    }

    // 3. Recalculate results
    // Use a small timeout to ensure all DOM updates from the clicks have been processed
    setTimeout(calculate, 100);
}

// --- Modal Functions ---
function openPopup(mode) {
    // Clear previous inputs
    modalCharacterNameInput.value = '';
    modalCharacterPasswordInput.value = '';

    if (mode === 'save') {
        modalTitle.textContent = '데이터 저장하기';
        modalConfirmBtn.textContent = '저장';
        currentModalConfirmAction = () => {
            const charName = modalCharacterNameInput.value.trim();
            const password = modalCharacterPasswordInput.value.trim();
            saveData(charName, password);
        };
    } else { // mode === 'load'
        modalTitle.textContent = '데이터 불러오기';
        modalConfirmBtn.textContent = '불러오기';
        currentModalConfirmAction = () => {
            const charName = modalCharacterNameInput.value.trim();
            const password = modalCharacterPasswordInput.value.trim();
            loadData(charName, password);
        };
    }

    modal.style.display = 'flex';
    modalCharacterNameInput.focus();
}

function closePopup() {
    modal.style.display = 'none';
    currentModalConfirmAction = null;
}
