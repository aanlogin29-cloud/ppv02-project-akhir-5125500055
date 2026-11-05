import { getTransactions, getUserProfile, getCategoryFilter } from './state.js';
let expenseChart = null;

export function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatNumberInput(value) {
  const cleanNum = value.replace(/\D/g, '');
  if (!cleanNum) return '';
  return new Intl.NumberFormat('id-ID').format(cleanNum);
}

export function parseCleanNumber(value) {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '')) || 0;
}

export function updateAppUI() {
  const transactions = getTransactions();
  const userProfile = getUserProfile();

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  document.getElementById('total-balance').innerText = formatRupiah(balance);
  document.getElementById('total-income').innerText = formatRupiah(income);
  document.getElementById('total-expense').innerText = formatRupiah(expense);

  const latestEl = document.getElementById('latest-transaction');
  if (transactions.length > 0) {
    const last = transactions[transactions.length - 1];
    const sign = last.type === 'income' ? '+' : '-';
    latestEl.innerText = `${last.description} (${sign}${formatRupiah(last.amount)}) - ${formatDate(last.date)}`;
  } else {
    latestEl.innerText = 'Belum Ada Catatan Baru';
  }

  renderTransactionsUI();
  renderProfileUI();
  renderChartUI();
}

export function renderTransactionsUI() {
  const transactions = getTransactions();
  const activeCategoryFilter = getCategoryFilter();
  const grid = document.getElementById('transaction-grid');
  if (!grid) return;
  grid.innerHTML = '';

  let filtered = [...transactions];
  if (activeCategoryFilter !== 'Semua') {
    filtered = filtered.filter(t => t.category === activeCategoryFilter);
  }

  const searchInputEl = document.getElementById('search-input');
  const query = searchInputEl ? searchInputEl.value.toLowerCase() : '';
  if (query) {
    filtered = filtered.filter(t => t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#6c7a89;">Belum Ada Catatan Transaksi.</p>';
    return;
  }

  filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
    const card = document.createElement('div');
    card.className = `tx-card ${t.type}`;
    const sign = t.type === 'income' ? '+' : '-';
    card.innerHTML = `
      <h5>${t.description}</h5>
      <span class="tx-card-tag">${t.category} • ${formatDate(t.date)}</span>
      <div class="tx-card-amount ${t.type}">${sign} ${formatRupiah(t.amount)}</div>
    `;
    grid.appendChild(card);
  });
}

export function renderProfileUI() {
  const userProfile = getUserProfile();
  if (userProfile) {
    document.getElementById('profile-display-name').innerText = userProfile.name;
    document.getElementById('profile-display-target').innerText = formatRupiah(userProfile.target);
    document.getElementById('edit-name').value = userProfile.name;
    document.getElementById('edit-target').value = formatNumberInput(userProfile.target.toString());
  }
}

export function renderChartUI() {
  const ctx = document.getElementById('expenseChart');
  if (!ctx) return;

  const transactions = getTransactions();
  const expenses = transactions.filter(t => t.type === 'expense');
  const groupedData = {};

  expenses.forEach(t => {
    let key = formatDate(t.date);
    groupedData[key] = (groupedData[key] || 0) + t.amount;
  });

  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Belum Ada Data'],
      datasets: [{
        label: 'Pengeluaran',
        data: data.length ? data : [0],
        backgroundColor: '#7FA8D6',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

export function checkModalUI() {
  const userProfile = getUserProfile();
  const modal = document.getElementById('welcome-modal');
  if (!userProfile) {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
    updateAppUI();
  }
}