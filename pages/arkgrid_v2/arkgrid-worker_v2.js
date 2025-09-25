// --- ArkGrid V2 Calculation Worker ---
// 이 파일은 메인 스레드의 UI 멈춤 현상을 방지하기 위해
// v2의 복잡한 조합 계산을 백그라운드에서 처리합니다.

// --- Constants (from arkgrid_v2.js) ---
const MAX_GEMS_PER_CORE = 4;

// --- Main Worker Logic ---
self.onmessage = function(e) {
    const {
        activeCores,
        orderGems,
        chaosGems,
        selectedCharacterClass,
        ARKGRID_CORE_TYPES,
        ARKGRID_GRADE_DATA,
        GEM_DATA,
        SUB_OPTION_DATA,
        CLASS_EFFECTIVE_OPTIONS,
        CALCULATION_TIMEOUT
    } = e.data;

    function calculateEffectiveness(gem, characterClass) {
        const effectiveOptions = CLASS_EFFECTIVE_OPTIONS[characterClass];
        let score = 0;
        if (!gem.subOption1 || !gem.subOption2) return 0;

        if (effectiveOptions.includes(gem.subOption1)) {
            score += SUB_OPTION_DATA[gem.subOption1][gem.subOption1Level - 1];
        }
        if (effectiveOptions.includes(gem.subOption2)) {
            score += SUB_OPTION_DATA[gem.subOption2][gem.subOption2Level - 1];
        }
        return score;
    }

    function findAllPossibleCombinations(core, availableGems, characterClass) {
        let allCombinations = [];

        function find(startIndex, currentGems, currentWillpower, currentPoints) {
            if (currentWillpower <= core.willpower) {
                allCombinations.push({
                    gems: [...currentGems],
                    points: currentPoints,
                    willpower: currentWillpower,
                    effectivenessScore: currentGems.reduce((acc, gem) => acc + calculateEffectiveness(gem, characterClass), 0)
                });
            }

            if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= availableGems.length) {
                return;
            }

            for (let i = startIndex; i < availableGems.length; i++) {
                const newGem = availableGems[i];
                if (currentWillpower + newGem.willpower <= core.willpower) {
                    currentGems.push(newGem);
                    find(i + 1, currentGems, currentWillpower + newGem.willpower, currentPoints + newGem.point);
                    currentGems.pop();
                }
            }
        }
        find(0, [], 0, 0);
        return allCombinations;
    }

    try {
        // 1. 각 활성 코어에 대해 목표 포인트를 만족하는 모든 유효한 조합 찾기
        const coreValidCombinations = new Map();
        for (const core of activeCores) {
            const availableGems = core.type === 'order' ? orderGems : chaosGems;
            let combinations = findAllPossibleCombinations(core.coreData, availableGems, selectedCharacterClass);
            combinations = combinations.filter(c => c.points >= core.targetPoint);
            combinations.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
            coreValidCombinations.set(core.id, combinations);
        }

        // 2. 최적화: '미래 예측 가지치기'를 위한 각 코어의 최대 효율 점수 미리 계산
        const maxScoresPerCore = {};
        activeCores.forEach(core => {
            const combinations = coreValidCombinations.get(core.id);
            maxScoresPerCore[core.id] = (combinations && combinations.length > 0) ? combinations[0].effectivenessScore : 0;
        });
        const totalMaxPossibleScore = activeCores.reduce((sum, core) => sum + maxScoresPerCore[core.id], 0);

        // 3. 백트래킹 솔버를 사용하여 최적의 할당 찾기
        let bestAssignment = { score: -1, assignment: {} };
        const startTime = Date.now();
        let timedOut = false;

        function solve(coreIndex, currentAssignment, currentScore, usedGemIds, maxPossibleFutureScore) {
            if (Date.now() - startTime > CALCULATION_TIMEOUT) {
                timedOut = true;
                return;
            }
            if (timedOut) return;

            // '미래 예측 가지치기'
            if (currentScore + maxPossibleFutureScore <= bestAssignment.score) {
                return;
            }

            if (coreIndex === activeCores.length) {
                if (currentScore > bestAssignment.score) {
                    bestAssignment = { score: currentScore, assignment: JSON.parse(JSON.stringify(currentAssignment)) };
                }
                return;
            }

            const core = activeCores[coreIndex];
            const combinations = coreValidCombinations.get(core.id);
            const remainingMaxScore = maxPossibleFutureScore - maxScoresPerCore[core.id];

            // 경로 1: 현재 코어에 조합을 할당
            if (combinations && combinations.length > 0) {
                for (const combination of combinations) {
                    const combinationGemIds = combination.gems.map(g => g.id);
                    const hasConflict = combinationGemIds.some(id => usedGemIds.has(id));

                    if (!hasConflict) {
                        const newUsedGemIds = new Set([...usedGemIds, ...combinationGemIds]);
                        currentAssignment[core.id] = combination;
                        solve(coreIndex + 1, currentAssignment, currentScore + combination.effectivenessScore, newUsedGemIds, remainingMaxScore);
                        delete currentAssignment[core.id];
                        if (timedOut) return;
                    }
                }
            }

            // 경로 2: 현재 코어를 건너뜀
            solve(coreIndex + 1, currentAssignment, currentScore, usedGemIds, remainingMaxScore);
        }

        solve(0, {}, 0, new Set(), totalMaxPossibleScore);

        self.postMessage({
            success: true,
            bestAssignment: bestAssignment,
            timedOut: timedOut
        });

    } catch (error) {
        console.error("Worker V2 Error: ", error);
        self.postMessage({ success: false, error: error.message, stack: error.stack });
    }
};
