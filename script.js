import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gridContainer = document.getElementById('grid-container');
const statusDiv = document.getElementById('status');
const categoryButtonsContainer = document.getElementById('category-buttons');
const sortByPriceBtn = document.getElementById('sort-by-price');

let allItems = [];
let selectedCategory = 'all';
let sortDirection = 'desc'; // 'asc' or 'desc'
const gradeOrder = ["일반", "고급", "희귀", "영웅", "전설", "유물", "고대", "에스더"];
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
    sortByPriceBtn.textContent = '가격순';
    const directionIndicator = sortDirection === 'asc' ? '▲' : '▼';
    sortByPriceBtn.textContent += ` ${directionIndicator}`;
}

function renderItems() {
    const filteredItems = allItems.filter(item => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'refining') {
            return item.category_code === 50010 || item.category_code === 50020;
        }
        return item.category_code == selectedCategory;
    });

    // 정렬 로직
    filteredItems.sort((a, b) => {
        return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
    });

    gridContainer.innerHTML = '';

    if (filteredItems.length === 0) {
        statusDiv.innerHTML = '선택한 조건에 맞는 아이템이 없습니다.';
        statusDiv.style.display = 'block';
    } else {
        statusDiv.style.display = 'none';
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const formattedPrice = item.price.toLocaleString('ko-KR');
        const formattedDate = new Date(item.last_updated).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        const itemColor = gradeColors[item.grade] || '#f2f2f7';

        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-top-left">
                    <img class="item-icon" src="${item.icon_path}" alt="${item.item_name} 아이콘" onerror="this.style.display='none'"/>
                    <div class="item-details">
                        <div class="item-name" title="${item.item_name}" style="color: ${itemColor};">${item.item_name}</div>
                    </div>
                </div>
                <div class="item-price">${formattedPrice}</div>
            </div>
            <div class="last-updated">${formattedDate}</div>
        `;
        gridContainer.appendChild(card);
    });
}

async function initialLoad() {
    try {
        const { data, error } = await supabase.rpc('get_latest_prices');
        if (error) throw error;

        allItems = data;

        if (allItems.length === 0) {
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

categoryButtonsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        selectedCategory = event.target.dataset.category;

        // Active 클래스 관리
        const buttons = categoryButtonsContainer.querySelectorAll('button');
        buttons.forEach(button => button.classList.remove('active'));
        event.target.classList.add('active');

        renderItems();
    }
});

sortByPriceBtn.addEventListener('click', () => {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    renderItems();
    updateButtonUI();
});


// DOM is available when a deferred module script runs.
initialLoad();
