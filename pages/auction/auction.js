// 경매 계산기 로직
const resultTable = document.getElementById('result-table');
if (resultTable) {
    const marketPriceInput = document.getElementById('market-price');
    const partySizeRadios = document.querySelectorAll('input[name="party-size"]');
    const tableBody = resultTable.querySelector('tbody');
    const toastPopup = document.getElementById('toast-popup');
    let toastTimer;

    function showToast() {
        // Clear any existing timer
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastPopup.classList.add('show');
        toastTimer = setTimeout(() => {
            toastPopup.classList.remove('show');
        }, 2000); // Hide after 2 seconds
    }

    function calculateAndDisplay() {
        const marketPrice = parseFloat(marketPriceInput.value);
        const numPeople = parseInt(document.querySelector('input[name="party-size"]:checked').value, 10);

        tableBody.innerHTML = '';

        if (isNaN(marketPrice) || marketPrice <= 0) {
            const row = tableBody.insertRow();
            return;
        }

        if (isNaN(numPeople) || numPeople < 2) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = '인원수를 선택해주세요.';
            cell.style.textAlign = 'center';
            return;
        }

        // 사용자가 제공한 계산식
        const optimalBid = (marketPrice / numPeople) * (numPeople - 1);
        const breakEven = Math.floor(optimalBid * 0.95);
        const p25 = Math.floor(breakEven / 1.025);
        const p50 = Math.floor(breakEven / 1.050);
        const p75 = Math.floor(breakEven / 1.075);
        const preemption = Math.floor(breakEven / 1.1);

        const results = [
            { label: '직접사용', value: optimalBid },
            { label: '손익분기점', value: breakEven },
            { label: '25%', value: p25 },
            { label: '50%', value: p50 },
            { label: '75%', value: p75 },
            { label: '선점', value: preemption }
        ];

        // 결과 표시 및 클립보드 복사 이벤트 추가
        results.forEach(result => {
            const row = tableBody.insertRow();
            row.style.cursor = 'pointer'; // Make it look clickable

            row.insertCell().textContent = result.label;
            const valueCell = row.insertCell();
            const value = Math.floor(result.value);
            valueCell.textContent = `${value.toLocaleString()} G`;

            row.addEventListener('click', () => {
                // 클립보드 복사를 시도하고, 실패하더라도 에러만 콘솔에 기록합니다.
                navigator.clipboard.writeText(value).catch(err => {
                    console.error('클립보드 복사 실패:', err);
                    // 사용자에게는 실패 피드백을 주지 않지만, 개발자는 알 수 있습니다.
                });
                // 사용자의 클릭에 대한 피드백으로 토스트 팝업을 즉시 표시합니다.
                showToast();
            });
        });
    }

    // 입력 및 변경 시 다시 계산
    marketPriceInput.addEventListener('input', calculateAndDisplay);
    partySizeRadios.forEach(radio => radio.addEventListener('change', calculateAndDisplay));

    // 페이지 로드 시 기본값으로 초기 계산 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', calculateAndDisplay);
    } else {
        calculateAndDisplay();
    }
}
