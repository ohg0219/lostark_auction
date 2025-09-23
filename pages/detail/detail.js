import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const itemNameTitle = document.getElementById('item-name-title');
const itemDetailContainer = document.getElementById('item-detail-container');
const backToListBtn = document.getElementById('back-to-list');
const priceChartCanvas = document.getElementById('price-chart');

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

// Corrected and simplified category map
const categoryMap = {
    "40000": "/lostark_auction/pages/engraving/",
    "refining": "/lostark_auction/pages/honing/",
    "210000": "/lostark_auction/pages/jewels/",
    "230000": "/lostark_auction/pages/gems/"
};

function getCategoryPage(categoryCode) {
    if (!categoryCode) return "/";
    return categoryMap[categoryCode] || "/";
}

async function loadItemDetails() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('itemId');
    const category = params.get('category');

    if (!itemId) {
        itemDetailContainer.innerHTML = '<p>아이템 ID를 찾을 수 없습니다.</p>';
        return;
    }

    // Set the "Back to List" button link
    const listPage = getCategoryPage(category);
    backToListBtn.href = listPage;

    try {
        // Fetch item details by ID
        const { data: itemData, error: itemError } = await supabase
            .rpc('get_item_details_by_id', { p_item_id: itemId })
            .single();

        if (itemError) throw itemError;
        if (!itemData) {
            itemDetailContainer.innerHTML = '<p>아이템 정보를 불러오는 데 실패했습니다.</p>';
            return;
        }

        renderItemDetails(itemData);

        // --- Fetch price history (with conditional logic) ---
        const marketHistoryCategories = ['40000', '230000', '50010', '50020'];
        let historyData, historyError;

        if (marketHistoryCategories.includes(category) || category === 'refining') {
            // For new categories, call the new function
            const { data, error } = await supabase
                .rpc('get_market_history_by_item_id', { p_item_id: itemId });

            historyError = error;
            // Transform data to match the chart's expected format
            if (data) {
                historyData = data.map(d => ({
                    history_date: d.date,
                    closing_price: d.avg_price,
                    trade_count: d.trade_count // Keep trade_count for potential future use
                }));
            }
        } else {
            // For old categories, call the original function
            const { data, error } = await supabase
                .rpc('get_item_price_history_by_id', { p_item_id: itemId });
            historyData = data;
            historyError = error;
        }

        if (historyError) throw historyError;

        renderPriceChart(historyData);

    } catch (error) {
        console.error('Error loading item data:', error);
        itemDetailContainer.innerHTML = `<p>데이터 로딩 중 오류 발생: ${error.message}</p>`;
    }
}

function renderItemDetails(item) {
    itemNameTitle.textContent = item.item_name;

    const formattedPrice = item.price.toLocaleString('ko-KR');
    const formattedDate = new Date(item.last_updated).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
    const itemColor = gradeColors[item.grade] || '#f2f2f7';

    itemDetailContainer.innerHTML = `
        <div class="item-card-detail">
            <div class="card-top-row">
                <div class="card-top-left">
                    <img class="item-icon" src="${item.icon_path}" alt="${item.item_name} 아이콘" onerror="this.style.display='none'"/>
                    <div class="item-details">
                        <div class="item-name" title="${item.item_name}" style="color: ${itemColor};">${item.item_name}</div>
                    </div>
                </div>
                <div class="price-container">
                    <div class="item-price">${formattedPrice}</div>
                </div>
            </div>
            <div class="last-updated">${formattedDate}</div>
        </div>
    `;
}

function renderPriceChart(historyData) {
    if (!historyData || historyData.length === 0) {
        priceChartCanvas.style.display = 'none';
        return;
    }

    const labels = historyData.map(d => new Date(d.history_date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }));
    const prices = historyData.map(d => d.closing_price);
    // Check if trade_count data is available
    const tradeCounts = historyData[0].trade_count !== undefined ? historyData.map(d => d.trade_count) : [];

    // Register the datalabels plugin if not already registered
    if (!Chart.registry.plugins.get('datalabels')) {
        Chart.register(ChartDataLabels);
    }

    const datasets = [{
        type: 'line',
        label: '평균가',
        data: prices,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.1,
        yAxisID: 'y-axis-price',
        datalabels: {
            align: 'end',
            anchor: 'end',
            color: '#e0e0e0',
            font: { weight: 'bold' },
            formatter: (value) => value.toLocaleString('ko-KR'),
        }
    }];

    // Only add the trade volume dataset if data is available
    if (tradeCounts.length > 0) {
        datasets.push({
            type: 'bar',
            label: '거래량',
            data: tradeCounts,
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            yAxisID: 'y-axis-volume',
            datalabels: {
                display: false // Hide datalabels for bars to avoid clutter
            }
        });
    }

    new Chart(priceChartCanvas, {
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                'y-axis-price': {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        callback: (value) => value.toLocaleString('ko-KR') + ' G',
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                'y-axis-volume': {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        callback: (value) => value.toLocaleString('ko-KR'),
                        color: '#e0e0e0'
                    },
                    grid: {
                        drawOnChartArea: false, // Don't show grid lines for the volume axis
                    },
                    display: tradeCounts.length > 0 // Only display if there is data
                },
                x: {
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('ko-KR');
                                if (context.dataset.type === 'line') {
                                    label += ' G';
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

loadItemDetails();
