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
    let currentItems = [];
    let sortDirection = 'desc';
    const gradeColors = {
        "일반": "#a5a5a5",
        "고급": "#6bbd00",
        "희귀": "#00b0fa",
        "영웅": "#ba00f9",
        "전설": "#f99200",
        "유물": "#fa5d00",
        "고대": "#B3956C",
        "에스더": "#14c5b9"
    };

    function updateButtonUI() {
        if (!sortByPriceBtn) return;
        sortByPriceBtn.textContent = '가격순';
        const directionIndicator = sortDirection === 'asc' ? '▲' : '▼';
        sortByPriceBtn.textContent += ` ${directionIndicator}`;
    }

    function renderItems() {
        // Sort the current items
        currentItems.sort((a, b) => {
            return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
        });

        gridContainer.innerHTML = '';

        if (currentItems.length === 0) {
            statusDiv.innerHTML = '표시할 아이템이 없습니다.';
            statusDiv.style.display = 'block';
        } else {
            statusDiv.style.display = 'none';
        }

        currentItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';

            const formattedPrice = item.price.toLocaleString('ko-KR');
            const formattedDate = new Date(item.last_updated).toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            });
            const itemColor = gradeColors[item.grade] || '#f2f2f7';

            let priceChangeHTML = '';
            if (item.price_change !== 0) {
                const direction = item.change_direction;
                const sign = direction === 'up' ? '+' : '';
                const arrow = direction === 'up' ? '▲' : '▼';
                const formattedChange = item.price_change.toLocaleString('ko-KR');
                priceChangeHTML = `<div class="price-change ${direction}">(${sign}${formattedChange} ${arrow})</div>`;
            }

            card.innerHTML = `
                <div class="card-top-row">
                    <div class="card-top-left">
                        <img class="item-icon" src="${item.icon_path}" alt="${item.item_name} 아이콘" onerror="this.style.display='none'"/>
                        <div class="item-details">
                            <div class="item-name" title="${item.item_name}" style="color: ${itemColor};">${item.item_name}</div>
                        </div>
                    </div>
                    <div class="price-container">
                        <div class="item-price">${formattedPrice}</div>
                        ${priceChangeHTML}
                    </div>
                </div>
                <div class="last-updated">${formattedDate}</div>
            `;
            gridContainer.appendChild(card);
        });
    }

    async function initialLoad() {
        const pageCategory = document.body.dataset.pageCategory;
        if (!pageCategory) {
            // Should not happen on category pages
            statusDiv.innerHTML = '카테고리를 찾을 수 없습니다.';
            return;
        }

        try {
            statusDiv.innerHTML = '데이터를 불러오는 중...';

            let categoryCodes;
            if (pageCategory === 'refining') {
                categoryCodes = [50010, 50020];
            } else {
                // The pageCategory from body.dataset is a string, but the database function expects integers.
                const numericCategory = parseInt(pageCategory, 10);
                if (isNaN(numericCategory)) {
                    throw new Error("Invalid category code: " + pageCategory);
                }
                categoryCodes = [numericCategory];
            }

            const { data, error } = await supabase.rpc('get_latest_prices_by_category', { p_category_codes: categoryCodes });
            if (error) throw error;

            currentItems = data;

            if (currentItems.length === 0) {
                statusDiv.innerHTML = '표시할 데이터가 없습니다. Edge Function을 먼저 실행하여 데이터를 수집해주세요.';
                return;
            }

            renderItems();
            updateButtonUI();

        } catch (error) {
            console.error('데이터를 불러오는 데 실패했습니다:', error);
            statusDiv.innerHTML = `데이터 로딩 실패: ${error.message}`;
        }
    }

    sortByPriceBtn.addEventListener('click', () => {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        renderItems();
        updateButtonUI();
    });

    initialLoad();
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

// PWA installation logic
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });

  let deferredPrompt;
  const addToHomeScreenBtn = document.getElementById('add-to-home-screen-btn');

  if (addToHomeScreenBtn) {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI to notify the user they can add to home screen
      addToHomeScreenBtn.style.display = 'block';

      addToHomeScreenBtn.addEventListener('click', (e) => {
        // hide our user interface that shows our A2HS button
        addToHomeScreenBtn.style.display = 'none';
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
      });
    });
  }
}
