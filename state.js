import { muatTransaksi, simpanTransaksi, muatProfil, simpanProfil } from './storage.js';

let transactions = muatTransaksi();
let userProfile = muatProfil();
let currentChartPeriod = 'daily';
let activeCategoryFilter = 'Semua';

export function getTransactions() {
  return transactions;
}

export function setTransactions(newTransactions) {
  transactions = newTransactions;
  simpanTransaksi(transactions);
}

export function addTransaction(tx) {
  transactions.push(tx);
  simpanTransaksi(transactions);
}

export function getUserProfile() {
  return userProfile;
}

export function setUserProfile(profile) {
  userProfile = profile;
  simpanProfil(userProfile);
}

export function getChartPeriod() {
  return currentChartPeriod;
}

export function setChartPeriodState(period) {
  currentChartPeriod = period;
}

export function getCategoryFilter() {
  return activeCategoryFilter;
}

export function setCategoryFilterState(cat) {
  activeCategoryFilter = cat;
}