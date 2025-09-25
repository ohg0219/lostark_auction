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
    const orderGemListContainer = document.getElementById('order-gem-list-container');
    const chaosGemListContainer = document.getElementById('chaos-gem-list-container');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Toggle gem list visibility based on the selected tab
            if (targetTab === 'order-cores') {
                orderGemListContainer.style.display = 'block';
                chaosGemListContainer.style.display = 'none';
            } else { // 'chaos-cores'
                orderGemListContainer.style.display = 'none';
                chaosGemListContainer.style.display = 'block';
            }
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
    heroic: {name: '영웅', willpower: 9, activationPoints: [10]},
    legendary: {name: '전설', willpower: 12, activationPoints: [10, 14]},
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

const GEM_DATA = {
    order: {
        '안정': { name: '안정', willpower: [3, 4, 5, 6, 7], gemPoints: [1, 2, 3, 4, 5], subOptions: ['공격력', '추가피해', '낙인력', '아군피해강화'] },
        '견고': { name: '견고', willpower: [4, 5, 6, 7, 8], gemPoints: [1, 2, 3, 4, 5], subOptions: ['공격력', '보스피해', '아군피해강화', '아군공격강화'] },
        '불변': { name: '불변', willpower: [5, 6, 7, 8, 9], gemPoints: [1, 2, 3, 4, 5], subOptions: ['추가피해', '보스피해', '낙인력', '아군공격강화'] }
    },
    chaos: {
        '침식': { name: '침식', willpower: [3, 4, 5, 6, 7], gemPoints: [1, 2, 3, 4, 5], subOptions: ['공격력', '추가피해', '낙인력', '아군피해강화'] },
        '왜곡': { name: '왜곡', willpower: [4, 5, 6, 7, 8], gemPoints: [1, 2, 3, 4, 5], subOptions: ['공격력', '보스피해', '아군피해강화', '아군공격강화'] },
        '붕괴': { name: '붕괴', willpower: [5, 6, 7, 8, 9], gemPoints: [1, 2, 3, 4, 5], subOptions: ['추가피해', '보스피해', '낙인력', '아군공격강화'] }
    }
};

const SUB_OPTION_DATA = {
    '공격력': [0.00029, 0.00067, 0.00105, 0.00134, 0.00172],
    '추가피해': [0.00060, 0.00119, 0.00187, 0.00239, 0.00299],
    '보스피해': [0.00078, 0.00156, 0.00244, 0.00313, 0.00391],
    '아군피해강화': [0.00029, 0.00067, 0.00105, 0.00134, 0.00172],
    '낙인력': [0.00060, 0.00119, 0.00187, 0.00239, 0.00299],
    '아군공격강화': [0.00078, 0.00156, 0.00244, 0.00313, 0.00391]
};

const CLASS_EFFECTIVE_OPTIONS = {
    '딜러': ['공격력', '추가피해', '보스피해'],
    '서포터': ['낙인력', '아군피해강화', '아군공격강화']
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
const dataModal = document.getElementById('data-modal');
const modalTitle = document.getElementById('modal-title');
const modalCharacterNameInput = document.getElementById('modal-character-name');
const modalCharacterPasswordInput = document.getElementById('modal-character-password');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
// Alert Modal DOM Elements
const alertModal = document.getElementById('alert-modal');
const alertModalMessage = document.getElementById('alert-modal-message');
const alertModalOkBtn = document.getElementById('alert-modal-ok-btn');
// Gem Edit Modal DOM Elements
const gemEditModal = document.getElementById('gem-edit-modal');
const gemEditForm = document.getElementById('gem-edit-form');
const gemEditSaveBtn = document.getElementById('gem-edit-save-btn');
const gemEditCancelBtn = document.getElementById('gem-edit-cancel-btn');
// Spinner Modal
const spinnerModal = document.getElementById('spinner-modal');
const spinnerText = document.querySelector('#spinner-modal .spinner-text');


// --- State ---
let orderGems = [];
let chaosGems = [];
let nextGemId = 0;
let selectedCharacterClass = '딜러'; // Default class
// selectedCores will track the selections for all 6 slots.
// Example: { 'chaos-1': 'sun', 'chaos-2': 'moon', ... }
let selectedCores = {};
let currentModalConfirmAction = null;
let currentlyEditingGem = null;


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

    // Set initial Gem List visibility
    document.getElementById('chaos-gem-list-container').style.display = 'none';
    document.getElementById('order-gem-list-container').style.display = 'block';

    // Create 3 slots for each column
    for (let i = 1; i <= 3; i++) {
        orderCoreColumn.appendChild(createCoreSlot('order', i));
        chaosCoreColumn.appendChild(createCoreSlot('chaos', i));
    }

    // Create Character Class Selector
    const characterClassSelector = document.getElementById('character-class-selector');
    const classDropdown = createCustomDropdown('character-class', '직업군',
        [{id: '딜러', name: '딜러'}, {id: '서포터', name: '서포터'}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
            selectedCharacterClass = s.value;
        }
    );
    characterClassSelector.appendChild(classDropdown);


    // Create New Gem Input Form
    setupNewGemInputForm();


    addGemBtn.addEventListener('click', addGem);
    calculateBtn.addEventListener('click', calculate); // No parameter needed


    // Main save/load button listeners
    saveBtn.addEventListener('click', () => openPopup('save'));
    loadBtn.addEventListener('click', () => openPopup('load'));

    // Data Modal button listeners
    modalCancelBtn.addEventListener('click', closeDataPopup);
    dataModal.addEventListener('click', (e) => {
        if (e.target === dataModal) {
            closeDataPopup();
        }
    });
    modalConfirmBtn.addEventListener('click', () => {
        if (currentModalConfirmAction) {
            currentModalConfirmAction();
        }
    });

    // Alert Modal button listeners
    alertModalOkBtn.addEventListener('click', closeCustomAlert);
    alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            closeCustomAlert();
        }
    });

    // Gem Edit Modal button listeners
    gemEditCancelBtn.addEventListener('click', closeGemEditPopup);
    gemEditModal.addEventListener('click', (e) => {
        if (e.target === gemEditModal) {
            closeGemEditPopup();
        }
    });
    gemEditSaveBtn.addEventListener('click', saveGemEdit);

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

    const handleSelection = (optionEl, value, text, icon) => {
        // Remove 'selected' from all options
        options.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        // Add 'selected' to the clicked option
        if (optionEl) {
            optionEl.classList.add('selected');
        }
        // Call the original onSelect callback
        onSelect(wrapper, { value, text, icon });
    };

    // Default option
    const defaultOption = document.createElement('div');
    defaultOption.className = 'custom-option';
    defaultOption.dataset.value = 'none';
    defaultOption.innerHTML = `<span>${defaultText}</span>`;
    defaultOption.addEventListener('click', () => {
        handleSelection(defaultOption, 'none', defaultText, null);
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
                handleSelection(option, item.id, item.name, item.icon);
            }
        });
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        if (wrapper.classList.contains('disabled')) return;
        // Set the initial selected class when opening
        const currentValue = wrapper.dataset.value;
        options.querySelectorAll('.custom-option').forEach(opt => {
            if (opt.dataset.value === String(currentValue)) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
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
function setupNewGemInputForm() {
    const gemInputForm = document.getElementById('gem-input-form');
    gemInputForm.innerHTML = ''; // Clear previous form

    // Row 1: Gem Type (Order/Chaos) -> Gem Name
    const row1 = document.createElement('div');
    row1.className = 'gem-input-row';

    const gemTypeDropdown = createCustomDropdown('gem-type', '젬 종류',
        [{ id: 'order', name: '질서', icon: GEM_IMAGES.order }, { id: 'chaos', name: '혼돈', icon: GEM_IMAGES.chaos }],
        (wrapper, selected) => {
            wrapper.dataset.value = selected.value;
            wrapper.querySelector('.custom-select-trigger').innerHTML = selected.icon ? `<img src="${selected.icon}" alt="${selected.text}"><span>${selected.text}</span>` : `<span>${selected.text}</span>`;
            wrapper.querySelector('.custom-options').style.display = 'none';
            updateGemNameDropdown(selected.value);
        }
    );

    const gemNameDropdown = createCustomDropdown('gem-name', '젬 이름', [], (wrapper, selected) => {
        wrapper.dataset.value = selected.value;
        wrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${selected.text}</span>`;
        wrapper.querySelector('.custom-options').style.display = 'none';
        updateDynamicDropdowns(selected.value);
    });
    gemNameDropdown.classList.add('disabled');


    row1.appendChild(gemTypeDropdown);
    row1.appendChild(gemNameDropdown);
    gemInputForm.appendChild(row1);

    // Row 2: Willpower & Points
    const row2 = document.createElement('div');
    row2.className = 'gem-input-row';
    const willpowerDropdown = createCustomDropdown('gem-willpower', '의지력', [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    willpowerDropdown.classList.add('disabled');
    const pointDropdown = createCustomDropdown('gem-point', '포인트', [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    pointDropdown.classList.add('disabled');
    row2.appendChild(willpowerDropdown);
    row2.appendChild(pointDropdown);
    gemInputForm.appendChild(row2);

    // Row 3: Sub-option 1 & Level 1
    const row3 = document.createElement('div');
    row3.className = 'gem-input-row';
    const subOption1Dropdown = createCustomDropdown('gem-sub-option-1', '부가옵션 1', [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption1Dropdown.classList.add('disabled');
    const subOption1LevelDropdown = createCustomDropdown('gem-sub-option-1-level', '레벨', [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption1LevelDropdown.classList.add('disabled');
    row3.appendChild(subOption1Dropdown);
    row3.appendChild(subOption1LevelDropdown);
    gemInputForm.appendChild(row3);

    // Row 4: Sub-option 2 & Level 2
    const row4 = document.createElement('div');
    row4.className = 'gem-input-row';
    const subOption2Dropdown = createCustomDropdown('gem-sub-option-2', '부가옵션 2', [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption2Dropdown.classList.add('disabled');
    const subOption2LevelDropdown = createCustomDropdown('gem-sub-option-2-level', '레벨', [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption2LevelDropdown.classList.add('disabled');
    row4.appendChild(subOption2Dropdown);
    row4.appendChild(subOption2LevelDropdown);
    gemInputForm.appendChild(row4);
}

function updateGemNameDropdown(gemType) {
    const gemNameDropdown = document.getElementById('gem-name');
    const nameTrigger = gemNameDropdown.querySelector('.custom-select-trigger');
    const nameOptions = gemNameDropdown.querySelector('.custom-options');
    nameOptions.innerHTML = '';
    nameTrigger.innerHTML = '<span>젬 이름</span>';
    gemNameDropdown.dataset.value = 'none';

    // Also reset all subsequent dropdowns
    const subsequentDropdowns = ['gem-willpower', 'gem-point', 'gem-sub-option-1', 'gem-sub-option-1-level', 'gem-sub-option-2', 'gem-sub-option-2-level'];
    subsequentDropdowns.forEach(id => {
        const dd = document.getElementById(id);
        if (dd) {
            dd.classList.add('disabled');
            dd.querySelector('.custom-select-trigger').innerHTML = `<span>${id.includes('willpower') ? '의지력' : id.includes('point') ? '포인트' : id.includes('level') ? '레벨' : '부가옵션'}</span>`;
            dd.dataset.value = 'none';
        }
    });

    if (gemType === 'none') {
        gemNameDropdown.classList.add('disabled');
        return;
    }

    gemNameDropdown.classList.remove('disabled');
    const names = Object.keys(GEM_DATA[gemType]);
    names.forEach(name => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = name;
        option.innerHTML = `<span>${name}</span>`;
        option.addEventListener('click', () => {
            gemNameDropdown.dataset.value = name;
            nameTrigger.innerHTML = `<span>${name}</span>`;
            nameOptions.style.display = 'none';
            // Pass both gemName and gemType
            const type = document.getElementById('gem-type').dataset.value;
            updateDynamicDropdowns(name, type);
        });
        nameOptions.appendChild(option);
    });
}

function updateDynamicDropdowns(gemName, gemType) {
    if (!gemName || !gemType || gemName === 'none' || gemType === 'none') {
        return;
    }
    const gemInfo = GEM_DATA[gemType][gemName];
    const willpowerDropdown = document.getElementById('gem-willpower');
    const pointDropdown = document.getElementById('gem-point');
    const subOption1Dropdown = document.getElementById('gem-sub-option-1');
    const subOption1LevelDropdown = document.getElementById('gem-sub-option-1-level');
    const subOption2Dropdown = document.getElementById('gem-sub-option-2');
    const subOption2LevelDropdown = document.getElementById('gem-sub-option-2-level');

    const dropdowns = [willpowerDropdown, pointDropdown, subOption1Dropdown, subOption1LevelDropdown, subOption2Dropdown, subOption2LevelDropdown];
    dropdowns.forEach(dd => {
        dd.classList.remove('disabled');
        const trigger = dd.querySelector('.custom-select-trigger');
        const options = dd.querySelector('.custom-options');
        options.innerHTML = '';
        trigger.innerHTML = `<span>${dd.id.includes('willpower') ? '의지력' : dd.id.includes('point') ? '포인트' : dd.id.includes('level') ? '레벨' : '부가옵션'}</span>`;
        dd.dataset.value = 'none';
    });

    const populateDropdown = (dropdown, values) => {
        const trigger = dropdown.querySelector('.custom-select-trigger');
        const options = dropdown.querySelector('.custom-options');
        values.forEach(val => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.dataset.value = val;
            option.innerHTML = `<span>${val}</span>`;
            option.addEventListener('click', () => {
                dropdown.dataset.value = val;
                trigger.innerHTML = `<span>${val}</span>`;
                options.style.display = 'none';
            });
            options.appendChild(option);
        });
    };

    populateDropdown(willpowerDropdown, gemInfo.willpower);
    populateDropdown(pointDropdown, gemInfo.gemPoints);
    populateDropdown(subOption1Dropdown, gemInfo.subOptions);
    populateDropdown(subOption2Dropdown, gemInfo.subOptions);
    populateDropdown(subOption1LevelDropdown, [1, 2, 3, 4, 5]);
    populateDropdown(subOption2LevelDropdown, [1, 2, 3, 4, 5]);
}


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

        const gradeId = gSelected.value;
        const gradeData = ARKGRID_GRADE_DATA[gradeId];
        let willpower = gradeData.willpower;
        const activationPoints = gradeData.activationPoints;

        document.getElementById(`info-${slotId}`).textContent = `공급 의지력: ${willpower}`;
        slot.style.borderColor = GRADE_COLORS[gradeId];

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

function addGem() {
    const type = document.getElementById('gem-type').dataset.value;
    const name = document.getElementById('gem-name').dataset.value;
    const willpower = parseInt(document.getElementById('gem-willpower').dataset.value, 10);
    const point = parseInt(document.getElementById('gem-point').dataset.value, 10);
    const subOption1 = document.getElementById('gem-sub-option-1').dataset.value;
    const subOption1Level = parseInt(document.getElementById('gem-sub-option-1-level').dataset.value, 10);
    const subOption2 = document.getElementById('gem-sub-option-2').dataset.value;
    const subOption2Level = parseInt(document.getElementById('gem-sub-option-2-level').dataset.value, 10);

    if (type === 'none' || name === 'none' || isNaN(willpower) || isNaN(point) || subOption1 === 'none' || isNaN(subOption1Level) || subOption2 === 'none' || isNaN(subOption2Level)) {
        showCustomAlert('모든 젬 정보를 올바르게 입력해주세요.');
        return;
    }

    if (subOption1 === subOption2) {
        showCustomAlert('부가옵션 1과 부가옵션 2는 서로 다른 옵션이어야 합니다.');
        return;
    }

    const gem = {
        id: nextGemId++,
        type,
        name,
        willpower,
        point,
        subOption1,
        subOption1Level,
        subOption2,
        subOption2Level
    };

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
        gemEl.style.cursor = 'pointer';

        const gemImage = GEM_IMAGES[gem.type];
        let detailsHtml;

        if (gem.name === '') {
            detailsHtml = `
                <div class="gem-item-details">
                    <div class="gem-item-sub-options">
                        <span>의지력: ${gem.willpower} / 포인트: ${gem.point}</span>
                    </div>
                </div>
            `;
        } else {
            detailsHtml = `
                <div class="gem-item-details">
                    <div class="gem-item-title">${gem.name} (W:${gem.willpower} / P:${gem.point})</div>
                    <div class="gem-item-sub-options">
                        <span>${gem.subOption1} Lv.${gem.subOption1Level}</span>
                        <span>${gem.subOption2} Lv.${gem.subOption2Level}</span>
                    </div>
                </div>
            `;
        }

        gemEl.innerHTML = `
            <div class="gem-item-content">
                <img src="${gemImage}" alt="${gem.type} 젬" class="gem-item-image">
                ${detailsHtml}
            </div>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'gem-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '젬 삭제';
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent the gem edit modal from opening when deleting
            if (gem.type === 'order') {
                orderGems = orderGems.filter(g => g.id !== gem.id);
            } else {
                chaosGems = chaosGems.filter(g => g.id !== gem.id);
            }
            renderGemLists();
        };

        gemEl.appendChild(deleteBtn);

        gemEl.addEventListener('click', () => {
            openGemEditPopup(gem);
        });

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


function showSpinner(text) {
    spinnerText.textContent = text;
    spinnerModal.style.display = 'flex';
}

function hideSpinner() {
    spinnerModal.style.display = 'none';
}

function calculate() {
    // 1. UI 업데이트: 스피너 표시
    showSpinner('최적 조합을 계산 중입니다...');

    // 2. 활성화된 코어 정보 수집
    let activeCores = [];
    ['order', 'chaos'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const slotElement = document.getElementById(`slot-${slotId}`);
            slotElement.classList.remove('target-failed');
            clearSlotResults(slotId);

            const typeId = document.getElementById(`type-${slotId}`).dataset.value;
            const gradeId = document.getElementById(`grade-${slotId}`).dataset.value;
            const targetPointStr = document.getElementById(`target-${slotId}`).dataset.value;

            if (typeId !== 'none' && gradeId !== 'none' && targetPointStr !== 'none') {
                const coreTypeData = ARKGRID_CORE_TYPES[type].find(t => t.id === typeId);
                const coreGradeData = ARKGRID_GRADE_DATA[gradeId];

                // *** 프리뷰 로직 시작 ***
                let willpower = coreGradeData.willpower;
                // *** 프리뷰 로직 끝 ***

                activeCores.push({
                    id: slotId,
                    type: type,
                    coreData: {
                        name: `${coreTypeData.name} (${coreGradeData.name})`,
                        willpower: willpower, // 수정된 의지력 적용
                    },
                    targetPoint: parseInt(targetPointStr, 10),
                });
            }
        }
    });

    if (activeCores.length === 0) {
        hideSpinner();
        return;
    }

    // 3. 웹 워커 생성 및 데이터 전송
    const worker = new Worker('./arkgrid-worker_v2.js');

    // 워커에 필요한 모든 데이터를 전송합니다. (상수 포함)
    worker.postMessage({
        activeCores, // 수정된 데이터가 포함될 수 있음
        orderGems,
        chaosGems,
        selectedCharacterClass,
        ARKGRID_CORE_TYPES,
        ARKGRID_GRADE_DATA, // 원본 데이터 전송
        GEM_DATA: {
            order: GEM_DATA.order,
            chaos: GEM_DATA.chaos
        },
        SUB_OPTION_DATA,
        CLASS_EFFECTIVE_OPTIONS,
        CALCULATION_TIMEOUT: 5000 // 5초
    });

    // 4. 워커로부터 결과 수신
    worker.onmessage = function(e) {
        const { success, bestAssignment, timedOut, error, stack } = e.data;
        hideSpinner();

        if (success) {
            if (timedOut) {
                showCustomAlert('계산 시간이 5초를 초과하여, 현재까지 찾은 최적의 조합을 표시합니다.');
            }

            if (bestAssignment && bestAssignment.score >= 0) {
                activeCores.forEach(core => {
                    const result = bestAssignment.assignment[core.id];
                    // 결과 렌더링 시에도 수정된 의지력 값을 전달해야 함
                    renderResult(core.id, core.coreData, { ...(result || {}), achieved: !!result });
                });
            } else {
                activeCores.forEach(core => {
                    renderResult(core.id, core.coreData, { achieved: false });
                });
            }
        } else {
            console.error('워커 V2에서 오류 발생:', error, stack);
            showCustomAlert(`계산 중 오류가 발생했습니다: ${error}`);
        }
        worker.terminate();
    };

    worker.onerror = function(e) {
        hideSpinner();
        console.error(`워커 V2 오류 발생: ${e.message}`, e);
        showCustomAlert(`치명적인 워커 오류가 발생했습니다: ${e.message}`);
        worker.terminate();
    };
}

function renderResult(slotId, core, result) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);
    const summaryEl = document.getElementById(`summary-${slotId}`);
    const slotElement = document.getElementById(`slot-${slotId}`);

    slotElement.classList.remove('target-failed');

    if (!result || !result.achieved) {
        slotElement.classList.add('target-failed');
        summaryEl.textContent = '최적 조합을 찾을 수 없습니다.';
        return;
    }

    result.gems.forEach((gem, index) => {
        if (socketContainer.children[index]) {
            const socket = socketContainer.children[index];
            const gemImage = GEM_IMAGES[gem.type];
            socket.innerHTML = `
                <div class="gem-socket-content">
                    <img src="${gemImage}" alt="${gem.type} 젬" class="gem-socket-image">
                    <div class="gem-item-details">
                        <div class="gem-item-title">${gem.name} (W:${gem.willpower}/P:${gem.point})</div>
                        <div class="gem-item-sub-options">
                           <span>${gem.subOption1} Lv.${gem.subOption1Level}</span>
                           <span>${gem.subOption2} Lv.${gem.subOption2Level}</span>
                        </div>
                    </div>
                </div>
            `;
            socket.classList.add('gem-equipped');
        }
    });
    const scoreText = result.effectivenessScore !== undefined ? `[예상효율: ${(result.effectivenessScore * 100).toFixed(4)}%]` : '';
    summaryEl.innerHTML = `[의지력: ${result.willpower} / ${core.willpower}] [포인트: ${result.points}] ${scoreText}`;
}


async function saveData(characterName, password) {
    if (!characterName || !password) {
        showCustomAlert('캐릭터명과 비밀번호를 모두 입력해주세요.');
        return;
    }

    // 1. Gather current configuration
    const coreSlots = {};
    let isCoreDataEntered = false;
    ['order', 'chaos'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const typeId = document.getElementById(`type-${slotId}`).dataset.value || 'none';
            const gradeId = document.getElementById(`grade-${slotId}`).dataset.value || 'none';
            const targetPoint = document.getElementById(`target-${slotId}`).dataset.value || 'none';
            if (typeId !== 'none' || gradeId !== 'none' || targetPoint !== 'none') {
                isCoreDataEntered = true;
            }
            coreSlots[slotId] = { type: typeId, grade: gradeId, target: targetPoint };
        }
    });

    const isGemDataEntered = orderGems.length > 0 || chaosGems.length > 0;

    if (!isCoreDataEntered && !isGemDataEntered) {
        showCustomAlert('저장할 데이터가 없습니다. 코어를 선택하거나 젬을 추가해주세요.');
        return;
    }

    const arkgridConfig = {
        orderGems: orderGems,
        chaosGems: chaosGems,
        coreSlots: coreSlots,
        characterClass: selectedCharacterClass
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
                closeDataPopup();
                showCustomAlert('데이터를 덮어썼습니다.');
            } else {
                showCustomAlert('비밀번호가 일치하지 않습니다.');
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
            closeDataPopup();
            showCustomAlert('데이터를 새로 저장했습니다.');
        }

    } catch (error) {
        console.error('데이터 저장 중 오류 발생:', error);
        showCustomAlert(`데이터 저장에 실패했습니다: ${error.message}`);
    }
}

async function loadData(characterName, password) {
    if (!characterName || !password) {
        showCustomAlert('캐릭터명과 비밀번호를 모두 입력해주세요.');
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
                showCustomAlert('해당 캐릭터명의 데이터가 존재하지 않습니다.');
            } else {
                throw error;
            }
            return;
        }

        if (data.password === password) {
            closeDataPopup();
            showSpinner('데이터를 불러오는 중...');
            // Use a timeout to allow the spinner to render before state restoration
            setTimeout(() => {
                restoreState(data.arkgrid_config);
            }, 50);
        } else {
            showCustomAlert('비밀번호가 일치하지 않습니다.');
        }

    } catch (error) {
        console.error('데이터 불러오기 중 오류 발생:', error);
        showCustomAlert(`데이터 불러오기에 실패했습니다: ${error.message}`);
    }
}

function restoreState(config) {
    // Helper function to migrate old gem data format to the new one
    const migrateGem = (gem) => {
        if (gem.hasOwnProperty('name')) {
            return gem; // Already in new format
        }
        // Old format, add default values for new properties
        return {
            ...gem,
            name: '',
            subOption1: '-',
            subOption1Level: 0,
            subOption2: '-',
            subOption2Level: 0,
        };
    };

    // 1. Restore and migrate Gems
    orderGems = (config.orderGems || []).map(migrateGem);
    chaosGems = (config.chaosGems || []).map(migrateGem);

    // Restore character class
    selectedCharacterClass = config.characterClass || '딜러';
    const classDropdown = document.getElementById('character-class');
    if (classDropdown) {
        const classOption = classDropdown.querySelector(`.custom-option[data-value="${selectedCharacterClass}"]`);
        if (classOption) {
            classOption.click();
        }
    }

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
    calculate();
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

    dataModal.style.display = 'flex';
    modalCharacterNameInput.focus();
}

function closeDataPopup() {
    dataModal.style.display = 'none';
    currentModalConfirmAction = null;
}

function showCustomAlert(message) {
    alertModalMessage.textContent = message;
    alertModal.style.display = 'flex';
}

function closeCustomAlert() {
    alertModal.style.display = 'none';
}

// --- Gem Edit Modal Functions ---
function openGemEditPopup(gem) {
    currentlyEditingGem = gem;
    gemEditForm.innerHTML = ''; // Clear previous form

    // Handle V1 gems that don't have a name
    if (!gem.name) {
        const title = document.getElementById('gem-edit-modal-title');
        title.textContent = '젬 종류 선택';

        const possibleNames = Object.keys(GEM_DATA[gem.type]);
        const nameDropdown = createCustomDropdown(
            'edit-gem-name',
            '젬 종류',
            possibleNames.map(name => ({ id: name, name: name })),
            (w, s) => {
                if (s.value !== 'none') {
                    // "Upgrade" the gem with the new name and re-open the popup
                    const updatedGem = { ...gem, name: s.value };
                    openGemEditPopup(updatedGem);
                }
            }
        );
        gemEditForm.appendChild(nameDropdown);
        gemEditModal.style.display = 'flex';
        return; // Stop execution here for v1 gems
    }

    // Restore title for standard V2 gems
    document.getElementById('gem-edit-modal-title').textContent = '젬 정보 수정';

    const gemInfo = GEM_DATA[gem.type][gem.name];

    // Helper function to create a labeled dropdown row
    const createDropdownRow = (labelText, dropdownId, initialValue, items, onSelectCallback) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'gem-input-row';
        const label = document.createElement('label');
        label.textContent = labelText;
        const dropdown = createCustomDropdown(dropdownId, initialValue, items, onSelectCallback);
        dropdown.dataset.value = initialValue;
        wrapper.append(label, dropdown);
        return wrapper;
    };

    const onSelect = (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    };

    // Willpower
    gemEditForm.appendChild(createDropdownRow('의지력', 'edit-gem-willpower', gem.willpower, gemInfo.willpower.map(w => ({ id: w, name: w })), onSelect));

    // Point
    gemEditForm.appendChild(createDropdownRow('포인트', 'edit-gem-point', gem.point, gemInfo.gemPoints.map(p => ({ id: p, name: p })), onSelect));

    // Sub Option 1
    const subOption1Row = createDropdownRow('부가옵션 1', 'edit-gem-sub-option-1', gem.subOption1, gemInfo.subOptions.map(opt => ({ id: opt, name: opt })), onSelect);
    const subOption1LevelDropdown = createCustomDropdown('edit-gem-sub-option-1-level', `Lv.${gem.subOption1Level}`, [1, 2, 3, 4, 5].map(l => ({ id: l, name: `Lv.${l}` })), onSelect);
    subOption1LevelDropdown.dataset.value = gem.subOption1Level;
    subOption1Row.appendChild(subOption1LevelDropdown);
    gemEditForm.appendChild(subOption1Row);


    // Sub Option 2
    const subOption2Row = createDropdownRow('부가옵션 2', 'edit-gem-sub-option-2', gem.subOption2, gemInfo.subOptions.map(opt => ({ id: opt, name: opt })), onSelect);
    const subOption2LevelDropdown = createCustomDropdown('edit-gem-sub-option-2-level', `Lv.${gem.subOption2Level}`, [1, 2, 3, 4, 5].map(l => ({ id: l, name: `Lv.${l}` })), onSelect);
    subOption2LevelDropdown.dataset.value = gem.subOption2Level;
    subOption2Row.appendChild(subOption2LevelDropdown);
    gemEditForm.appendChild(subOption2Row);


    gemEditModal.style.display = 'flex';
}

function closeGemEditPopup() {
    gemEditModal.style.display = 'none';
    currentlyEditingGem = null;
    gemEditForm.innerHTML = ''; // Clear form
}

function saveGemEdit() {
    if (!currentlyEditingGem) return;

    // Get values from all dropdowns
    const newWillpower = parseInt(document.getElementById('edit-gem-willpower').dataset.value, 10);
    const newPoint = parseInt(document.getElementById('edit-gem-point').dataset.value, 10);
    const newSubOption1 = document.getElementById('edit-gem-sub-option-1').dataset.value;
    const newSubOption1Level = parseInt(document.getElementById('edit-gem-sub-option-1-level').dataset.value, 10);
    const newSubOption2 = document.getElementById('edit-gem-sub-option-2').dataset.value;
    const newSubOption2Level = parseInt(document.getElementById('edit-gem-sub-option-2-level').dataset.value, 10);

    // Validation
    if (newSubOption1 === '-' || newSubOption2 === '-' || !newSubOption1Level || !newSubOption2Level) {
        showCustomAlert('모든 부가옵션과 레벨을 선택해주세요.');
        return;
    }

    if (isNaN(newWillpower) || isNaN(newPoint) || isNaN(newSubOption1Level) || isNaN(newSubOption2Level)) {
        showCustomAlert('모든 젬 정보를 올바르게 입력해주세요.');
        return;
    }

    if (newSubOption1 === newSubOption2) {
        showCustomAlert('부가옵션 1과 부가옵션 2는 서로 다른 옵션이어야 합니다.');
        return;
    }

    // Find the gem in the original arrays and update it
    const gemToUpdate = orderGems.find(g => g.id === currentlyEditingGem.id) || chaosGems.find(g => g.id === currentlyEditingGem.id);

    if (gemToUpdate) {
        gemToUpdate.name = currentlyEditingGem.name; // Ensure name is updated for v1 gems
        gemToUpdate.willpower = newWillpower;
        gemToUpdate.point = newPoint;
        gemToUpdate.subOption1 = newSubOption1;
        gemToUpdate.subOption1Level = newSubOption1Level;
        gemToUpdate.subOption2 = newSubOption2;
        gemToUpdate.subOption2Level = newSubOption2Level;
    }

    renderGemLists();
    closeGemEditPopup();
}
