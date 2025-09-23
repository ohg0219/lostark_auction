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
            const pageCategory = document.body.dataset.pageCategory;

            const link = document.createElement('a');
            link.className = 'item-link';
            link.href = `../detail/?itemId=${item.item_id}&category=${pageCategory}`;

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
            link.appendChild(card);
            gridContainer.appendChild(link);
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

            const marketHistoryCategories = ['40000', '230000', '50010', '50020'];
            const isMarketHistoryCategory = marketHistoryCategories.includes(pageCategory) || pageCategory === 'refining';

            let data, error;

            if (isMarketHistoryCategory) {
                let categoryCodes;
                if (pageCategory === 'refining') {
                    categoryCodes = [50010, 50020];
                } else {
                    categoryCodes = [parseInt(pageCategory, 10)];
                }

                // Call the new, improved function for market history categories
                const { data: marketData, error: marketError } = await supabase.rpc('get_latest_market_prices_by_category', { p_category_codes: categoryCodes });

                error = marketError;
                if (marketData) {
                    // Adapt the data structure to what renderItems expects
                    currentItems = marketData.map(item => ({
                        ...item,
                        price: item.avg_price, // map avg_price to price
                        last_updated: new Date().toISOString() // The new function doesn't return a timestamp, so use current time
                    }));
                }
            } else {
                // For all other categories, use the old function
                let categoryCodes;
                const numericCategory = parseInt(pageCategory, 10);
                if (isNaN(numericCategory)) {
                    throw new Error("Invalid category code: " + pageCategory);
                }
                categoryCodes = [numericCategory];
                const { data: legacyData, error: legacyError } = await supabase.rpc('get_latest_prices_by_category', { p_category_codes: categoryCodes });
                error = legacyError;
                currentItems = legacyData;
            }

            if (error) throw error;

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

// The auction calculator logic has been moved to auction.js
