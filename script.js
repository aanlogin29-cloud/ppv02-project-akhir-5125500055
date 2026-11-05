let transactions = JSON.parse(localStorage.getItem('kostbudget_transactions')) || [];
let userProfile = JSON.parse(localStorage.getItem('kostbudget_profile')) || null;

let currentChartPeriod = 'daily';
let activeCategoryFilter = 'Semua';
let expenseChart = null;

// Set Tanggal Hari Ini
const dateEl = document.getElementById('date');
if (dateEl) dateEl.valueAsDate = new Date();

// --- FUNGSI FORMAT ANGKA & TITIK RIBUAN ---
function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format input teks menjadi ada titik ribuan saat diketik
function formatNumberInput(value) {
  const cleanNum = value.replace(/\D/g, ''); // Hapus semua karakter non-angka
  if (!cleanNum) return '';
  return new Intl.NumberFormat('id-ID').format(cleanNum);
}

// Unformat titik balik ke angka asli (nomor murni) untuk perhitungan
function parseCleanNumber(value) {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '')) || 0;
}

// Pasang Auto-Format Titik pada semua input berkelas "input-currency"
document.querySelectorAll('.input-currency').forEach(input => {
  input.addEventListener('input', function(e) {
    const formatted = formatNumberInput(e.target.value);
    e.target.value = formatted;
  });
});

// FUNGSI PERPINDAHAN TAB
function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');

  if (tabId === 'tab-riwayat') {
    renderChart();
    renderTransactions();
  }
}

// CEK USER BARU (MODAL PILIHAN A)
function checkFirstTimeUser() {
  const modal = document.getElementById('welcome-modal');
  if (!userProfile) {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
    updateApp();
  }
}

// SUBMIT SETUP PERTAMA KALI
document.getElementById('setup-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('setup-name').value;
  const initialBalance = parseCleanNumber(document.getElementById('setup-balance').value);
  const target = parseCleanNumber(document.getElementById('setup-target').value);

  userProfile = { name, target };
  localStorage.setItem('kostbudget_profile', JSON.stringify(userProfile));

  // Simpan Saldo Awal sebagai Transaksi Pemasukan Pertama
  if (initialBalance > 0) {
    transactions = [{
      id: Date.now(),
      type: 'income',
      description: 'Saldo Awal Uang Kos',
      amount: initialBalance,
      date: new Date().toISOString().split('T')[0],
      category: 'Lainnya'
    }];
    localStorage.setItem('kostbudget_transactions', JSON.stringify(transactions));
  }

  document.getElementById('welcome-modal').style.display = 'none';
  updateApp();
});

// UPDATE APP & CALC
function updateApp() {
  calculateBalance();
  renderTransactions();
  renderProfile();
  renderChart();
}

function calculateBalance() {
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
}

function renderTransactions() {
  const grid = document.getElementById('transaction-grid');
  grid.innerHTML = '';

  let filtered = [...transactions];
  if (activeCategoryFilter !== 'Semua') {
    filtered = filtered.filter(t => t.category === activeCategoryFilter);
  }

  const query = document.getElementById('search-input').value.toLowerCase();
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

function renderProfile() {
  if (userProfile) {
    document.getElementById('profile-display-name').innerText = userProfile.name;
    document.getElementById('profile-display-target').innerText = formatRupiah(userProfile.target);
    document.getElementById('edit-name').value = userProfile.name;
    document.getElementById('edit-target').value = formatNumberInput(userProfile.target.toString());
  }
}

// SUBMIT TAMBAH TRANSAKSI
document.getElementById('transaction-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value;
  const amount = parseCleanNumber(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;

  transactions.push({ id: Date.now(), type, description, amount, date, category });
  localStorage.setItem('kostbudget_transactions', JSON.stringify(transactions));
  updateApp();

  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('date').valueAsDate = new Date();
});

// UPDATE PROFIL
document.getElementById('profile-edit-form').addEventListener('submit', function(e) {
  e.preventDefault();
  userProfile.name = document.getElementById('edit-name').value;
  userProfile.target = parseCleanNumber(document.getElementById('edit-target').value);

  localStorage.setItem('kostbudget_profile', JSON.stringify(userProfile));
  renderProfile();
  alert('Profil berhasil di-update!');
});

function setCategoryFilter(cat, btn) {
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategoryFilter = cat;
  renderTransactions();
}

function setChartPeriod(period, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentChartPeriod = period;
  renderChart();
}

function renderChart() {
  const ctx = document.getElementById('expenseChart');
  if (!ctx) return;

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

// JALANKAN SAAT AWAL
checkFirstTimeUser();
// FUNGSI UNTUK MENGHAPUS PROFIL & RESET SEMUA DATA
function resetAllData() {
  const confirmReset = confirm("Apakah Anda yakin ingin menghapus profil dan seluruh data transaksi? Semua catatan akan bersih kembali ke awal.");
  if (confirmReset) {
    localStorage.clear();
    location.reload();
  }
}