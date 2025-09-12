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

// Auction calculator logic
const calculateBtn = document.getElementById('calculate-btn');
if (calculateBtn) {
    const marketPriceInput = document.getElementById('market-price');
    const auctionPriceInput = document.getElementById('auction-price');
    const profitMarginInput = document.getElementById('profit-margin');
    const resultDiv = document.getElementById('result');
    const bidAnalysisDiv = document.getElementById('bid-analysis');
    const biddingSuggestionDiv = document.getElementById('bidding-suggestion');

    calculateBtn.addEventListener('click', () => {
        const marketPrice = parseFloat(marketPriceInput.value);
        const auctionPrice = parseFloat(auctionPriceInput.value);
        const profitMargin = parseFloat(profitMarginInput.value) || 0;
        const partySize = document.querySelector('input[name="party-size"]:checked').value;

        const actualCostMultiplier = 1 - (0.95 / partySize);

        // --- Bidding Suggestion ---
        if (isNaN(marketPrice) || marketPrice <= 0) {
            biddingSuggestionDiv.innerHTML = '<p>유효한 시장가를 입력해주세요.</p>';
        } else {
            const netMarketValue = marketPrice * 0.95;

            const breakEvenBid = netMarketValue / actualCostMultiplier;

            const desiredCost = netMarketValue / (1 + (profitMargin / 100));
            const recommendedBid = desiredCost / actualCostMultiplier;

            biddingSuggestionDiv.innerHTML = `
                <p>손익분기점 입찰가: <strong>${Math.floor(breakEvenBid).toLocaleString()}</strong> 골드</p>
                <p>${profitMargin}% 이익을 위한 추천 입찰가: <strong>${Math.floor(recommendedBid).toLocaleString()}</strong> 골드</p>
            `;
        }

        // --- Bid Analysis ---
        if (isNaN(auctionPrice) || auctionPrice <= 0) {
            bidAnalysisDiv.innerHTML = '<p>입찰가를 입력하면 상세 분석을 볼 수 있습니다.</p>';
        } else {
            const perPersonDistribution = (auctionPrice * 0.95) / partySize;
            const actualCost = auctionPrice * actualCostMultiplier;

            let profitAnalysis = '';
            if (!isNaN(marketPrice) && marketPrice > 0) {
                const netMarketValue = marketPrice * 0.95;
                const profit = netMarketValue - actualCost;
                const profitPercentage = (profit / actualCost) * 100;
                profitAnalysis = `
                    <p>예상 이익 (시장 수수료 5% 제외): <strong class="${profit > 0 ? 'text-profit' : 'text-loss'}">${Math.floor(profit).toLocaleString()}</strong> 골드</p>
                    <p>예상 이익률: <strong class="${profit > 0 ? 'text-profit' : 'text-loss'}">${profitPercentage.toFixed(2)}%</strong></p>
                `;
            }

            bidAnalysisDiv.innerHTML = `
                <p>인당 분배금: <strong>${Math.floor(perPersonDistribution).toLocaleString()}</strong> 골드</p>
                <p>낙찰자 실 부담금: <strong>${Math.ceil(actualCost).toLocaleString()}</strong> 골드</p>
                ${profitAnalysis}
            `;
        }

        resultDiv.style.display = 'block';
    });
}
