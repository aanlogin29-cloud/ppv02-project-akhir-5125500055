const KUNCI_TRANSAKSI = 'kostbudget_transactions';
const KUNCI_PROFIL = 'kostbudget_profile';

export function muatTransaksi() {
  return JSON.parse(localStorage.getItem(KUNCI_TRANSAKSI)) || [];
}

export function simpanTransaksi(transactions) {
  localStorage.setItem(KUNCI_TRANSAKSI, JSON.stringify(transactions));
}

export function muatProfil() {
  return JSON.parse(localStorage.getItem(KUNCI_PROFIL)) || null;
}

export function simpanProfil(profile) {
  localStorage.setItem(KUNCI_PROFIL, JSON.stringify(profile));
}

export function resetStorage() {
  localStorage.clear();
}