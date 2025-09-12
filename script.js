import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ojyiduiquzldbnimulvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWlkdWlxdXpsZGJuaW11bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzkxMTIsImV4cCI6MjA3MzIxNTExMn0.VRNMrbQSXZtWLPNuW-Sn522G1pmhT4AkhX0RJgANqZ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gridContainer = document.getElementById('grid-container');
const statusDiv = document.getElementById('status');
const categoryFilter = document.getElementById('category-filter');
const gradeFilter = document.getElementById('grade-filter');

let allItems = [];
const gradeOrder = ["일반", "고급", "희귀", "영웅", "전설", "유물", "고대", "에스더"];

function updateGradeFilter() {
    const selectedCategory = categoryFilter.value;
    const relevantItems = selectedCategory === 'all'
        ? allItems
        : allItems.filter(item => item.category_code == selectedCategory);

    const availableGrades = [...new Set(relevantItems.map(item => item.grade).filter(Boolean))];
    availableGrades.sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));

    const currentGrade = gradeFilter.value;
    gradeFilter.innerHTML = '<option value="all">모든 등급</option>';

    availableGrades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeFilter.appendChild(option);
    });

    // 이전 선택을 유지하려고 시도
    if (availableGrades.includes(currentGrade)) {
        gradeFilter.value = currentGrade;
    } else {
        gradeFilter.value = 'all';
    }
}

function renderItems() {
    const selectedCategory = categoryFilter.value;
    const selectedGrade = gradeFilter.value;

    const filteredItems = allItems.filter(item => {
        const categoryMatch = selectedCategory === 'all' || item.category_code == selectedCategory;
        const gradeMatch = selectedGrade === 'all' || item.grade === selectedGrade;
        return categoryMatch && gradeMatch;
    });

    // Sort items by price in descending order
    filteredItems.sort((a, b) => b.price - a.price);

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
        const formattedDate = new Date(item.last_updated).toLocaleString('ko-KR');

        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-top-left">
                    <img class="item-icon" src="${item.icon_path}" alt="${item.item_name} 아이콘" onerror="this.style.display='none'"/>
                    <div class="item-details">
                        <div class="item-name" title="${item.item_name}">${item.item_name}</div>
                        <div class="item-grade">등급: ${item.grade || '정보 없음'}</div>
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

        updateGradeFilter();
        renderItems();

    } catch (error) {
        console.error('데이터를 불러오는 데 실패했습니다:', error);
        statusDiv.innerHTML = `데이터 로딩 실패: ${error.message}`;
    }
}

categoryFilter.addEventListener('change', () => {
    updateGradeFilter();
    renderItems();
});
gradeFilter.addEventListener('change', renderItems);

// DOM is available when a deferred module script runs.
initialLoad();
