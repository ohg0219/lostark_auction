import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gridContainer = document.getElementById('grid-container');
const statusDiv = document.getElementById('status');
const sortByPriceBtn = document.getElementById('sort-by-price');

// This script will run on index.html and the category pages.
// On index.html, gridContainer will be null.
if (gridContainer) {
    // ... (existing grid page logic)
}

// Final auction calculator logic
const resultTable = document.getElementById('result-table');
if (resultTable) {
    const marketPriceInput = document.getElementById('market-price');
    const partySizeRadios = document.querySelectorAll('input[name="party-size"]');
    const tableBody = resultTable.querySelector('tbody');

    const FEE = 0.05;
    const SCENARIOS = [
        { label: '직접 사용', r: 0.25 },
        { label: '손익분기점', r: 0 },
        { label: '25% 이익', r: -0.25 },
        { label: '50% 이익', r: -0.5 },
        { label: '75% 이익', r: -0.75 },
        { label: '선점', r: -1 },
    ];

    function calculateAndDisplay() {
        const marketPrice = parseFloat(marketPriceInput.value);
        const n = document.querySelector('input[name="party-size"]:checked').value;

        tableBody.innerHTML = '';

        if (isNaN(marketPrice) || marketPrice <= 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = '시장가를 입력해주세요.';
            return;
        }

        SCENARIOS.forEach(scenario => {
            const r = scenario.r;

            // TargetCost = (MarketPrice * 0.95) / (1 - r)
            const targetCost = (marketPrice * (1 - FEE)) / (1 - r);

            // Denominator = (1 - ( ((1 - fee) / n) * (1 + r) ) )
            const denominator = 1 - (((1 - FEE) / n) * (1 + r));

            let recommendedBid = 0;
            if (denominator > 0) {
                 recommendedBid = targetCost / denominator;
            }

            const row = tableBody.insertRow();
            row.insertCell().textContent = scenario.label;
            row.insertCell().textContent = `${Math.floor(recommendedBid).toLocaleString()} 골드`;
        });
    }

    // Add multiple event listeners for better compatibility (especially for Safari)
    marketPriceInput.addEventListener('input', calculateAndDisplay);
    marketPriceInput.addEventListener('change', calculateAndDisplay);
    partySizeRadios.forEach(radio => radio.addEventListener('change', calculateAndDisplay));

    // Initial calculation on page load
    calculateAndDisplay();
}
