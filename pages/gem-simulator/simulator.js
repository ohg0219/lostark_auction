document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsDisplay = document.getElementById('results-display');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // --- Constants and Data ---
    const GEM_SETTINGS = {
        order: {
            name: '질서의 젬',
            subTypes: {
                stable: { name: '안정', effects: ['공격력', '추가피해', '낙인력', '아군피해강화'] },
                solid: { name: '견고', effects: ['공격력', '보스피해', '아군피해강화', '아군공격강화'] },
                immutable: { name: '불변', effects: ['추가피해', '보스피해', '낙인력', '아군공격강화'] },
            }
        },
        chaos: {
            name: '혼돈의 젬',
            subTypes: {
                erosion: { name: '침식', effects: ['공격력', '추가피해', '낙인력', '아군피해강화'] },
                distortion: { name: '왜곡', effects: ['공격력', '보스피해', '아군피해강화', '아군공격강화'] },
                collapse: { name: '붕괴', effects: ['추가피해', '보스피해', '낙인력', '아군공격강화'] },
            }
        }
    };
    const GRADE_SETTINGS = {
        advanced: { name: '고급', attempts: 5, rerolls: 0 },
        rare: { name: '희귀', attempts: 7, rerolls: 1 },
        heroic: { name: '영웅', attempts: 9, rerolls: 2 },
    };
    const PROCESSING_OPTIONS = [
        { name: '의지력 효율 +1 증가', prob: 11.65, effect: { willpower: 1 }, condition: s => s.willpower >= 5 },
        { name: '의지력 효율 +2 증가', prob: 4.40, effect: { willpower: 2 }, condition: s => s.willpower >= 4 },
        { name: '의지력 효율 +3 증가', prob: 1.75, effect: { willpower: 3 }, condition: s => s.willpower >= 3 },
        { name: '의지력 효율 +4 증가', prob: 0.45, effect: { willpower: 4 }, condition: s => s.willpower >= 2 },
        { name: '의지력 효율 -1 감소', prob: 3.00, effect: { willpower: -1 }, condition: s => s.willpower <= 1 },
        { name: '질서/혼돈 포인트 +1 증가', prob: 11.65, effect: { points: 1 }, condition: s => s.points >= 5 },
        { name: '질서/혼돈 포인트 +2 증가', prob: 4.40, effect: { points: 2 }, condition: s => s.points >= 4 },
        { name: '질서/혼돈 포인트 +3 증가', prob: 1.75, effect: { points: 3 }, condition: s => s.points >= 3 },
        { name: '질서/혼돈 포인트 +4 증가', prob: 0.45, effect: { points: 4 }, condition: s => s.points >= 2 },
        { name: '질서/혼돈 포인트 -1 감소', prob: 3.00, effect: { points: -1 }, condition: s => s.points <= 1 },
        { name: '첫번째 효과 Lv. 1 증가', prob: 11.65, effect: { effect1_level: 1 }, condition: s => s.effect1_level >= 5 },
        { name: '첫번째 효과 Lv. 2 증가', prob: 4.40, effect: { effect1_level: 2 }, condition: s => s.effect1_level >= 4 },
        { name: '첫번째 효과 Lv. 3 증가', prob: 1.75, effect: { effect1_level: 3 }, condition: s => s.effect1_level >= 3 },
        { name: '첫번째 효과 Lv. 4 증가', prob: 0.45, effect: { effect1_level: 4 }, condition: s => s.effect1_level >= 2 },
        { name: '첫번째 효과 Lv. 1 감소', prob: 3.00, effect: { effect1_level: -1 }, condition: s => s.effect1_level <= 1 },
        { name: '두번째 효과 Lv. 1 증가', prob: 11.65, effect: { effect2_level: 1 }, condition: s => s.effect2_level >= 5 },
        { name: '두번째 효과 Lv. 2 증가', prob: 4.40, effect: { effect2_level: 2 }, condition: s => s.effect2_level >= 4 },
        { name: '두번째 효과 Lv. 3 증가', prob: 1.75, effect: { effect2_level: 3 }, condition: s => s.effect2_level >= 3 },
        { name: '두번째 효과 Lv. 4 증가', prob: 0.45, effect: { effect2_level: 4 }, condition: s => s.effect2_level >= 2 },
        { name: '두번째 효과 Lv. 1 감소', prob: 3.00, effect: { effect2_level: -1 }, condition: s => s.effect2_level <= 1 },
        { name: '첫번째 효과 변경', prob: 3.25, effect: {}, condition: () => false },
        { name: '두번째 효과 변경', prob: 3.25, effect: {}, condition: () => false },
        { name: '가공 비용 +100% 증가', prob: 1.75, effect: {}, condition: s => s.attemptsLeft <= 1 },
        { name: '가공 비용 -100% 감소', prob: 1.75, effect: {}, condition: s => s.attemptsLeft <= 1 },
        { name: '가공 상태 유지', prob: 1.75, effect: {}, condition: () => false },
        { name: '다른 항목 보기 +1회 증가', prob: 2.50, effect: { rerolls: 1 }, condition: s => s.attemptsLeft <= 1 },
        { name: '다른 항목 보기 +2회 증가', prob: 0.75, effect: { rerolls: 2 }, condition: s => s.attemptsLeft <= 1 },
    ];

    // --- Custom Dropdown Logic ---
    function setupCustomDropdowns() {
        const dropdowns = document.querySelectorAll('.custom-dropdown');
        dropdowns.forEach(dropdown => {
            const selected = dropdown.querySelector('.dropdown-selected');
            const optionsContainer = dropdown.querySelector('.dropdown-options');
            const hiddenInput = document.getElementById(dropdown.dataset.inputId);

            selected.addEventListener('click', () => {
                closeAllDropdowns(dropdown);
                dropdown.classList.toggle('open');
            });

            optionsContainer.addEventListener('click', e => {
                if (e.target.classList.contains('dropdown-option') && !e.target.classList.contains('disabled')) {
                    const newValue = e.target.dataset.value;
                    const newText = e.target.textContent;

                    if (hiddenInput.value !== newValue) {
                        selected.querySelector('.selected-value').textContent = newText;
                        optionsContainer.querySelector('.selected')?.classList.remove('selected');
                        e.target.classList.add('selected');
                        hiddenInput.value = newValue;
                        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    dropdown.classList.remove('open');
                }
            });
        });
        window.addEventListener('click', e => { if (!e.target.closest('.custom-dropdown')) closeAllDropdowns(); });
    }

    function closeAllDropdowns(exceptThisOne = null) {
        document.querySelectorAll('.custom-dropdown.open').forEach(d => { if (d !== exceptThisOne) d.classList.remove('open'); });
    }

    function updateDropdownValue(inputId, value, text) {
        const hiddenInput = document.getElementById(inputId);
        const dropdown = document.querySelector(`.custom-dropdown[data-input-id="${inputId}"]`);
        if (hiddenInput && dropdown) {
            hiddenInput.value = value;
            dropdown.querySelector('.selected-value').textContent = text;
            const optionsContainer = dropdown.querySelector('.dropdown-options');
            optionsContainer.querySelector('.selected')?.classList.remove('selected');
            optionsContainer.querySelector(`[data-value="${value}"]`)?.classList.add('selected');
        }
    }

    // --- UI Update Functions ---
    function updatePointLabel() {
        const gemType = document.getElementById('gem-type').value;
        const label = document.querySelector('[data-input-id="current-points"]').previousElementSibling;
        label.textContent = gemType === 'order' ? '현재 질서 포인트' : '현재 혼돈 포인트';
    }

    function updateSubTypeOptions() {
        const gemType = document.getElementById('gem-type').value;
        const subTypes = GEM_SETTINGS[gemType].subTypes;
        const container = document.getElementById('gem-sub-type-options');
        container.innerHTML = '';
        Object.entries(subTypes).forEach(([key, value], index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = key;
            optionDiv.textContent = value.name;
            if (index === 0) {
                updateDropdownValue('gem-sub-type', key, value.name);
                optionDiv.classList.add('selected');
            }
            container.appendChild(optionDiv);
        });
        updateAdditionalOptions();
    }

    function updateAdditionalOptions() {
        const gemType = document.getElementById('gem-type').value;
        const subType = document.getElementById('gem-sub-type').value;
        if (!gemType || !subType) return;
        const effects = GEM_SETTINGS[gemType].subTypes[subType].effects;

        const effect1Type = document.getElementById('effect1-type').value;
        const effect2Type = document.getElementById('effect2-type').value;

        // Populate options for effect 1
        const container1 = document.getElementById('effect1-type-options');
        container1.innerHTML = '';
        effects.forEach((effect, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = effect;
            optionDiv.textContent = effect;
            if (effect === effect2Type) optionDiv.classList.add('disabled');
            if (index === 0 && (!effect1Type || !effects.includes(effect1Type))) {
                updateDropdownValue('effect1-type', effect, effect);
                optionDiv.classList.add('selected');
            } else if (effect === effect1Type) {
                optionDiv.classList.add('selected');
            }
            container1.appendChild(optionDiv);
        });

        // Populate options for effect 2
        const container2 = document.getElementById('effect2-type-options');
        container2.innerHTML = '';
        effects.forEach((effect, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = effect;
            optionDiv.textContent = effect;
            if (effect === document.getElementById('effect1-type').value) optionDiv.classList.add('disabled');

            let defaultEffect2 = effects.find(e => e !== document.getElementById('effect1-type').value);
            if (effect === defaultEffect2 && (!effect2Type || !effects.includes(effect2Type) || effect1Type === effect2Type)) {
                 updateDropdownValue('effect2-type', effect, effect);
                 optionDiv.classList.add('selected');
            } else if (effect === effect2Type) {
                optionDiv.classList.add('selected');
            }
            container2.appendChild(optionDiv);
        });
    }

    function updateDefaultsByGrade() {
        const grade = document.getElementById('gem-grade').value;
        const settings = GRADE_SETTINGS[grade];
        if (settings) {
            updateDropdownValue('attempts-left', settings.attempts, settings.attempts);
            updateDropdownValue('rerolls-left', settings.rerolls, settings.rerolls);
        }
    }

    // --- Simulation Core ---
    function getProcessingOptions(currentState) {
        const availableOptions = PROCESSING_OPTIONS.filter(opt => !opt.condition(currentState));
        let chosenOptions = [];
        let pool = availableOptions.map(o => ({...o}));
        for (let i = 0; i < 4 && pool.length > 0; i++) {
            let totalWeight = pool.reduce((sum, opt) => sum + opt.prob, 0);
            let rand = Math.random() * totalWeight;
            let cumulativeWeight = 0;
            for (let j = 0; j < pool.length; j++) {
                cumulativeWeight += pool[j].prob;
                if (rand <= cumulativeWeight) { chosenOptions.push(pool.splice(j, 1)[0]); break; }
            }
        }
        return chosenOptions;
    }

    function runSingleSimulation(initialState) {
        let state = { ...initialState };
        while (state.attemptsLeft > 0) {
            let options = getProcessingOptions(state);
            const isGoodOption = opt => (opt.effect.willpower && opt.effect.willpower > 0) || (opt.effect.points && opt.effect.points > 0);
            while (state.rerolls > 0 && !options.some(isGoodOption)) {
                state.rerolls--;
                options = getProcessingOptions(state);
            }
            if (options.length > 0) {
                const chosenOption = options[Math.floor(Math.random() * options.length)];
                for (const key in chosenOption.effect) {
                    state[key] += chosenOption.effect[key];
                    if (['willpower', 'points', 'effect1_level', 'effect2_level'].includes(key)) {
                        state[key] = Math.max(1, Math.min(5, state[key]));
                    }
                }
            }
            state.attemptsLeft--;
        }
        return state;
    }

    async function startSimulation() {
        calculateBtn.disabled = true;
        resultsDisplay.innerHTML = '시뮬레이션 진행 중...';
        progressText.textContent = `0%`;
        progressBar.style.width = `0%`;

        const initialState = {
            willpower: parseInt(document.getElementById('current-willpower').value),
            points: parseInt(document.getElementById('current-points').value),
            effect1_level: parseInt(document.getElementById('effect1-level').value),
            effect2_level: parseInt(document.getElementById('effect2-level').value),
            attemptsLeft: parseInt(document.getElementById('attempts-left').value),
            rerolls: parseInt(document.getElementById('rerolls-left').value),
        };

        const simulationCount = parseInt(document.getElementById('simulation-count').value);
        let outcomes = { count45: 0, count55: 0, legendary: 0, relic: 0, ancient: 0 };

        for (let i = 0; i < simulationCount; i++) {
            const finalState = runSingleSimulation(initialState);
            const is45 = (finalState.willpower === 4 && finalState.points === 5) || (finalState.willpower === 5 && finalState.points === 4);
            const is55 = finalState.willpower === 5 && finalState.points === 5;
            if (is45) outcomes.count45++;
            if (is55) outcomes.count55++;
            const totalPoints = finalState.willpower + finalState.points + finalState.effect1_level + finalState.effect2_level;
            if (totalPoints >= 4 && totalPoints <= 15) outcomes.legendary++;
            else if (totalPoints >= 16 && totalPoints <= 18) outcomes.relic++;
            else if (totalPoints >= 19 && totalPoints <= 20) outcomes.ancient++;

            if ((i + 1) % (simulationCount / 100) === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
                const percentComplete = Math.round(((i + 1) / simulationCount) * 100);
                progressText.textContent = `${percentComplete}%`;
                progressBar.style.width = `${percentComplete}%`;
            }
        }

        displayResults(outcomes, simulationCount);
        calculateBtn.disabled = false;
    }

    function displayResults(outcomes, simulationCount) {
        const toPercent = (count) => ((count / simulationCount) * 100).toFixed(2);
        resultsDisplay.innerHTML = `
            <h3>시뮬레이션 결과 (${simulationCount.toLocaleString()}회)</h3>
            <p>45 발사대 확률: <strong>${toPercent(outcomes.count45)}%</strong></p>
            <p>55 발사대 확률: <strong>${toPercent(outcomes.count55)}%</strong></p>
            <hr>
            <p>전설 등급 확률: <strong>${toPercent(outcomes.legendary)}%</strong></p>
            <p>유물 등급 확률: <strong>${toPercent(outcomes.relic)}%</strong></p>
            <p>고대 등급 확률: <strong>${toPercent(outcomes.ancient)}%</strong></p>
        `;
    }

    // --- Initial Setup ---
    document.getElementById('gem-type').addEventListener('change', () => {
        updatePointLabel();
        updateSubTypeOptions();
    });
    document.getElementById('gem-sub-type').addEventListener('change', updateAdditionalOptions);
    document.getElementById('gem-grade').addEventListener('change', updateDefaultsByGrade);
    document.getElementById('effect1-type').addEventListener('change', updateAdditionalOptions);
    document.getElementById('effect2-type').addEventListener('change', updateAdditionalOptions);
    calculateBtn.addEventListener('click', startSimulation);

    setupCustomDropdowns();
    updatePointLabel();
    updateSubTypeOptions();
    updateDefaultsByGrade();
});
