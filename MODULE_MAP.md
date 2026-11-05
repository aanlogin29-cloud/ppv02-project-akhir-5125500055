# Peta Modul — KostBudget (Sprint 3)

## Arah Impor (Dependensi Satu Jalur)
`main.js` --> `ui.js` --> `state.js` --> `storage.js`

## Tanggung Jawab Modul
1. **`storage.js`**: Satu-satunya modul yang berinteraksi langsung dengan `localStorage` untuk menyimpan dan membaca data.
2. **`state.js`**: Menyimpan variabel state aplikasi (transaksi, profil, filter) secara terpusat tanpa menyentuh DOM.
3. **`ui.js`**: Menangani seluruh manipulasi DOM, render kartu transaksi, modal sambutan, dan integrasi Chart.js.
4. **`main.js`**: Titik masuk utama (*entry point*) yang mendengarkan event pengguna (*event listener*) dan menghubungkan seluruh modul.

## Bagian Belum Dimodulkan
Pustaka eksternal pihak ketiga (seperti **Chart.js** yang dimuat via CDN) tidak dimodulkan secara lokal karena digunakan langsung sebagai pustaka global antarmuka grafik.