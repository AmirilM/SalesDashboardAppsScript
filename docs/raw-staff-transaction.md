# Struktur Kolom Sales Staff Transaction

## Identitas Dataset

- **File**: `import_database/sales-staff-transaction.xlsx`
- **Worksheet**: `RAW`
- **Jumlah baris transaksi**: 13.193
- **Jumlah kolom**: 14
- **Grain data**: satu baris merepresentasikan satu item produk pada transaksi.
- **Kunci transaksi**: kombinasi `Sales ID`, `Invoice Transaction`, dan `SAP Article`; validasi duplikasi diperlukan sebelum digunakan sebagai primary key.

## Struktur dan Identitas Kolom

| No. | Kolom | Tipe data | Identitas / fungsi | Contoh |
|---:|---|---|---|---|
| 1 | `Date` | Tanggal | Tanggal transaksi | Nilai serial Excel `46266` |
| 2 | `Sales ID` | ID | ID transaksi atau sesi penjualan yang menghubungkan beberapa item | `25006778` |
| 3 | `Sales Name` | Teks | Nama sales staff yang menangani transaksi | `Juliaman Hia` |
| 4 | `Invoice Transaction` | ID | Nomor invoice untuk identifikasi transaksi penjualan | `100003513` |
| 5 | `SAP Article` | ID produk | Kode artikel produk dari SAP | `MRLXT2533-5CTR` |
| 6 | `SAP Description` | Teks | Deskripsi atau nama produk dari SAP | `MOTOROLA G67 POWER 5G 8/256GB` |
| 7 | `QtyItem` | Numerik | Jumlah unit item pada baris transaksi | `1` |
| 8 | `LocalAmount` | Numerik/mata uang | Nilai penjualan lokal untuk item atau baris transaksi | `3849000` |
| 9 | `Brand Name` | Kategori | Merek produk | `MOTOROLA` |
| 10 | `LOB` | Kategori | Line of Business atau klasifikasi lini produk | `PHONE` |
| 11 | `SubLOB` | Kategori | Subkategori atau model produk | `MOTOROLA G67 POWER 5G` |
| 12 | `Group Category` | Kategori | Kelompok kategori penjualan | `DEVICES` |
| 13 | `KPI Group` | Kategori | Kelompok KPI untuk agregasi performa | `ANDROID` |
| 14 | `Store Code` | ID toko | Kode toko tempat transaksi terjadi | `QF70` |

## Domain Nilai Utama

- `Date`: 16 nilai tanggal berbeda pada file. Nilai disimpan sebagai serial tanggal Excel dan perlu dikonversi saat diproses.
- `Sales ID`: 500 nilai unik.
- `Sales Name`: 502 nilai unik. Perlu normalisasi nama sebelum agregasi karena satu sales dapat memiliki variasi penulisan.
- `Invoice Transaction`: 4.769 nilai unik.
- `SAP Article`: 1.140 nilai unik; 2 baris tidak memiliki nilai.
- `SAP Description`: 1.072 nilai unik; 2 baris tidak memiliki nilai.
- `QtyItem`: memiliki nilai `1`, `2`, dan `3`; mayoritas baris bernilai `1`.
- `LocalAmount`: nilai numerik penjualan; 475 nilai unik.
- `Brand Name`: 61 nilai unik.
- `LOB`: 59 nilai unik.
- `SubLOB`: 189 nilai unik.
- `Group Category`: 4 kategori utama, dengan nilai terbanyak `DEVICES`, `ACCESSORIES`, dan `VAS`.
- `KPI Group`: 4 kategori utama, termasuk `APPLE`, `ACCESSORIES`, dan `ANDROID`.
- `Store Code`: 124 toko unik.

## Relasi Kolom

- `Sales ID` dan `Sales Name` mengidentifikasi aktivitas sales staff.
- `Invoice Transaction` mengidentifikasi dokumen transaksi.
- `SAP Article` dan `SAP Description` mengidentifikasi produk.
- `Brand Name`, `LOB`, `SubLOB`, `Group Category`, dan `KPI Group` membentuk hierarki klasifikasi produk dan KPI.
- `Store Code` menghubungkan transaksi dengan master data toko.
- `LocalAmount` digunakan sebagai nilai revenue; `QtyItem` digunakan untuk analisis volume unit.

## Catatan Identitas Data

- Nama worksheet `RAW` menunjukkan data merupakan data mentah transaksi.
- `Date` wajib dikonversi dari serial Excel ke format tanggal standar sebelum filter periode atau agregasi harian.
- `Sales ID` dapat muncul pada banyak baris karena satu transaksi dapat berisi beberapa item.
- `Invoice Transaction` juga dapat muncul pada banyak baris karena satu invoice dapat berisi beberapa produk.
- Jangan menjumlahkan `LocalAmount` pada data yang sudah digandakan melalui join tanpa memastikan grain tetap satu baris item.
- `Group Category` dan `KPI Group` bukan kolom yang sama; gunakan sesuai kebutuhan metrik masing-masing.
