// --- ArkGrid Calculation Worker ---
// 이 파일은 메인 스레드의 UI 멈춤 현상을 방지하기 위해
// 복잡한 조합 계산을 백그라운드에서 처리합니다.

// --- Constants (from arkgrid.js) ---
const MAX_GEMS_PER_CORE = 4;

// --- Main Worker Logic ---
self.onmessage = function(e) {
    const { activeCores, orderGems, chaosGems, ARKGRID_CORE_TYPES, ARKGRID_GRADE_DATA, CALCULATION_TIMEOUT } = e.data;

    /**
     * 사용 가능한 보석과 코어의 조건을 기반으로 모든 가능한 보석 조합을 찾습니다.
     * @param {Object} core 코어의 정보를 포함하는 객체 (willpower)
     * @param {Array} availableGems 사용 가능한 보석 목록
     * @return {Array} 가능한 모든 보석 조합의 배열
     */
    function findAllPossibleCombinations(core, availableGems) {
        let allCombinations = [];

        function find(startIndex, currentGems, currentWillpower, currentPoints) {
            // 현재 조합이 유효한 경우(의지력을 초과하지 않음) 추가
            if (currentWillpower <= core.willpower) {
                allCombinations.push({
                    gems: [...currentGems],
                    points: currentPoints,
                    willpower: currentWillpower
                });
            }

            // 최대 보석 개수에 도달했거나 더 이상 사용할 보석이 없으면 종료
            if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= availableGems.length) {
                return;
            }

            // 재귀적으로 다음 보석을 추가하며 조합 탐색
            for (let i = startIndex; i < availableGems.length; i++) {
                const newGem = availableGems[i];
                if (currentWillpower + newGem.willpower <= core.willpower) {
                    currentGems.push(newGem);
                    find(i + 1, currentGems, currentWillpower + newGem.willpower, currentPoints + newGem.point);
                    currentGems.pop(); // 백트래킹
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
            let combinations = findAllPossibleCombinations(core.coreData, availableGems);
            combinations = combinations.filter(c => c.points >= core.targetPoint);
            combinations.sort((a, b) => b.points - a.points); // 점수 내림차순 정렬 (휴리스틱)
            coreValidCombinations.set(core.id, combinations);
        }

        // 2. 최적화: '미래 예측 가지치기'를 위한 각 코어의 최대 점수 미리 계산
        const maxPointsPerCore = {};
        activeCores.forEach(core => {
            const combinations = coreValidCombinations.get(core.id);
            maxPointsPerCore[core.id] = (combinations && combinations.length > 0) ? combinations[0].points : 0;
        });
        const totalMaxPossibleScore = activeCores.reduce((sum, core) => sum + maxPointsPerCore[core.id], 0);

        // 3. 백트래킹 솔버를 사용하여 최적의 할당 찾기
        let bestAssignment = { score: -1, assignment: {} };
        const startTime = Date.now();
        let timedOut = false;

        function solve(coreIndex, currentAssignment, currentScore, usedGemIds, maxPossibleFutureScore) {
            // 타임아웃 확인
            if (Date.now() - startTime > CALCULATION_TIMEOUT) {
                timedOut = true;
                return;
            }
            if (timedOut) return;

            // '미래 예측 가지치기'
            // 현재 점수와 앞으로 얻을 수 있는 최대 점수의 합이 이미 찾은 최고 점수보다 낮으면, 더 이상 탐색 불필요
            if (currentScore + maxPossibleFutureScore <= bestAssignment.score) {
                return;
            }

            // 모든 코어를 다 확인한 경우
            if (coreIndex === activeCores.length) {
                if (currentScore > bestAssignment.score) {
                    bestAssignment = { score: currentScore, assignment: JSON.parse(JSON.stringify(currentAssignment)) };
                }
                return;
            }

            const core = activeCores[coreIndex];
            const combinations = coreValidCombinations.get(core.id);
            const remainingMaxScore = maxPossibleFutureScore - maxPointsPerCore[core.id];

            // 경로 1: 현재 코어에 조합을 할당하는 경우
            if (combinations && combinations.length > 0) {
                for (const combination of combinations) {
                    const combinationGemIds = combination.gems.map(g => g.id);
                    const hasConflict = combinationGemIds.some(id => usedGemIds.has(id));

                    if (!hasConflict) {
                        const newUsedGemIds = new Set([...usedGemIds, ...combinationGemIds]);
                        currentAssignment[core.id] = combination;
                        solve(coreIndex + 1, currentAssignment, currentScore + combination.points, newUsedGemIds, remainingMaxScore);
                        delete currentAssignment[core.id]; // 백트래킹
                        if (timedOut) return;
                    }
                }
            }

            // 경로 2: 현재 코어를 건너뛰는 경우 (조합을 할당하지 않음)
            solve(coreIndex + 1, currentAssignment, currentScore, usedGemIds, remainingMaxScore);
        }

        solve(0, {}, 0, new Set(), totalMaxPossibleScore);

        // 메인 스레드로 결과 전송
        self.postMessage({
            success: true,
            bestAssignment: bestAssignment,
            timedOut: timedOut
        });

    } catch (error) {
        console.error("Worker Error: ", error);
        self.postMessage({ success: false, error: error.message, stack: error.stack });
    }
};
