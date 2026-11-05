import { getUserProfile, setUserProfile, addTransaction, setTransactions, setChartPeriodState, setCategoryFilterState } from './state.js';
import { updateAppUI, renderTransactionsUI, renderChartUI, formatNumberInput, parseCleanNumber, checkModalUI } from './ui.js';
import { resetStorage } from './storage.js';

// Set Tanggal Hari Ini
const dateEl = document.getElementById('date');
if (dateEl) dateEl.valueAsDate = new Date();

// Auto-format input currency
document.querySelectorAll('.input-currency').forEach(input => {
  input.addEventListener('input', function(e) {
    e.target.value = formatNumberInput(e.target.value);
  });
});

// Setup Form Pertama Kali (Modal Welcome)
const setupForm = document.getElementById('setup-form');
if (setupForm) {
  setupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('setup-name').value;
    const initialBalance = parseCleanNumber(document.getElementById('setup-balance').value);
    const target = parseCleanNumber(document.getElementById('setup-target').value);

    setUserProfile({ name, target });

    if (initialBalance > 0) {
      const initialTx = [{
        id: Date.now(),
        type: 'income',
        description: 'Saldo Awal Uang Kos',
        amount: initialBalance,
        date: new Date().toISOString().split('T')[0],
        category: 'Lainnya'
      }];
      setTransactions(initialTx);
    }

    document.getElementById('welcome-modal').style.display = 'none';
    updateAppUI();
  });
}

// Tambah Transaksi Form
const transactionForm = document.getElementById('transaction-form');
if (transactionForm) {
  transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseCleanNumber(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    addTransaction({ id: Date.now(), type, description, amount, date, category });
    updateAppUI();

    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').valueAsDate = new Date();
  });
}

// Update Profil Form
const profileEditForm = document.getElementById('profile-edit-form');
if (profileEditForm) {
  profileEditForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const currentProfile = getUserProfile() || {};
    currentProfile.name = document.getElementById('edit-name').value;
    currentProfile.target = parseCleanNumber(document.getElementById('edit-target').value);

    setUserProfile(currentProfile);
    updateAppUI();
    alert('Profil berhasil di-update!');
  });
}

// Pencarian Transaksi
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => renderTransactionsUI());
}

// --- FUNGSI GLOBAL AGAR TERHUBUNG DENGAN ONCLICK DI HTML ---

window.switchTab = function(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');

  if (tabId === 'tab-riwayat') {
    renderChartUI();
    renderTransactionsUI();
  }
};

window.setCategoryFilter = function(cat, btn) {
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  setCategoryFilterState(cat);
  renderTransactionsUI();
};

window.setChartPeriod = function(period, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  setChartPeriodState(period);
  renderChartUI();
};

window.resetAllData = function() {
  if (confirm("Apakah Anda yakin ingin menghapus profil dan seluruh data transaksi?")) {
    resetStorage();
    location.reload();
  }
};

// Jalankan Pengecekan Modal Awal
checkModalUI();