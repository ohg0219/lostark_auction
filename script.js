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
    // ... (existing code for category pages)
}

// New auction calculator logic
const resultTable = document.getElementById('result-table');
if (resultTable) {
    const marketPriceInput = document.getElementById('market-price');
    const partySizeRadios = document.querySelectorAll('input[name="party-size"]');
    const tableBody = resultTable.querySelector('tbody');

    const PROFIT_MARGINS = [
        { label: '손익분기점', value: 0 },
        { label: '10% 이익', value: 10 },
        { label: '25% 이익', value: 25 },
        { label: '50% 이익', value: 50 },
    ];

    function calculateAndDisplay() {
        const marketPrice = parseFloat(marketPriceInput.value);
        const partySize = document.querySelector('input[name="party-size"]:checked').value;

        tableBody.innerHTML = '';

        if (isNaN(marketPrice) || marketPrice <= 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = '시장가를 입력해주세요.';
            return;
        }

        const actualCostMultiplier = 1 - (0.95 / partySize);
        const netMarketValue = marketPrice * 0.95;

        PROFIT_MARGINS.forEach(margin => {
            const desiredCost = netMarketValue / (1 + (margin.value / 100));
            const recommendedBid = desiredCost / actualCostMultiplier;

            const row = tableBody.insertRow();
            row.insertCell().textContent = margin.label;
            row.insertCell().textContent = `${Math.floor(recommendedBid).toLocaleString()} 골드`;
        });
    }

    marketPriceInput.addEventListener('input', calculateAndDisplay);
    partySizeRadios.forEach(radio => radio.addEventListener('change', calculateAndDisplay));

    // Initial calculation on page load
    calculateAndDisplay();
}
