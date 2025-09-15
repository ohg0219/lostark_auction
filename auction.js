// 경매 계산기 로직
const resultTable = document.getElementById('result-table');
if (resultTable) {
    const marketPriceInput = document.getElementById('market-price');
    const partySizeRadios = document.querySelectorAll('input[name="party-size"]');
    const tableBody = resultTable.querySelector('tbody');

    function calculateAndDisplay() {
        const marketPrice = parseFloat(marketPriceInput.value);
        const numPeople = parseInt(document.querySelector('input[name="party-size"]:checked').value, 10);

        tableBody.innerHTML = '';

        if (isNaN(marketPrice) || marketPrice <= 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = '유효한 시장가를 입력해주세요.';
            cell.style.textAlign = 'center';
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

        // auction.html의 aF테이블 헤더("이익률", "추천 입찰가")에 맞춰 결과 표시
        results.forEach(result => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = result.label;
            const valueCell = row.insertCell();
            valueCell.textContent = `${Math.floor(result.value).toLocaleString()} G`;
        });
    }

    // 입력 및 변경 시 다시 계산
    marketPriceInput.addEventListener('input', calculateAndDisplay);
    partySizeRadios.forEach(radio => radio.addEventListener('change', calculateAndDisplay));

    // 페이지 로드 시 기본값으로 초기 계산 실행
    // auction.html에 기본값이 설정되어 있으므로, 페이지가 로드될 때 바로 계산 결과를 표시합니다.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', calculateAndDisplay);
    } else {
        calculateAndDisplay();
    }
}
