# Struktur Kolom Sales Stores Transaction

## Identitas Dataset

- **File**: `import_database/sales-stores-transaction.xlsx`
- **Worksheet**: `RAW`
- **Jumlah baris**: 13.241
- **Jumlah kolom**: 23
- **Grain data**: satu baris merepresentasikan satu item produk pada transaksi toko.
- **Kunci transaksi potensial**: kombinasi `Date`, `Store Code`, `SAP Article`, dan identitas transaksi bila tersedia; file tidak memiliki nomor invoice atau transaction ID.

## Struktur dan Identitas Kolom

| No. | Kolom | Tipe data | Identitas / fungsi | Contoh |
|---:|---|---|---|---|
| 1 | `Brand Name` | Kategori | Merek produk | `APPLE` |
| 2 | `Product Division` | Kategori | Divisi produk | `HEALTH EQUIPMENT` |
| 3 | `Product Group` | Kategori | Kelompok produk | `ACCESSORIES` |
| 4 | `Product Category` | Kategori | Kategori produk yang lebih spesifik | `CHARGER` |
| 5 | `Date` | Tanggal | Tanggal transaksi | Nilai serial Excel `46266` |
| 6 | `Item` | Teks | Gabungan kode artikel dan deskripsi item | `APPMD3J4ZA/A / 20W USB-C POWER ADAPTER` |
| 7 | `QtyItem` | Numerik | Jumlah unit item | `1` |
| 8 | `DiscPrice` | Numerik/mata uang | Nilai diskon atau harga diskon pada item | `0` |
| 9 | `LocalAmount` | Numerik/mata uang | Nilai penjualan lokal | `450000` |
| 10 | `Store Code` | ID toko | Kode toko tempat transaksi terjadi | `QF70` |
| 11 | `Month` | Periode | Nama bulan transaksi | `September` |
| 12 | `Year` | Periode | Tahun transaksi | `2026` |
| 13 | `SAP Article` | ID produk | Kode artikel produk dari SAP | `APPMD3J4ZA/A` |
| 14 | `SAP Description` | Teks | Deskripsi produk dari SAP | `20W USB-C POWER ADAPTER` |
| 15 | `Brand Code` | ID/kategori | Kode singkat merek | `APP` |
| 16 | `LOB` | Kategori | Line of Business produk | `CHARGER` |
| 17 | `SubLOB` | Kategori | Subkategori atau model produk | `0` |
| 18 | `KPI Group` | Kategori | Kelompok KPI untuk agregasi performa | `ACCESSORIES` |
| 19 | `Store Name` | Teks | Nama toko transaksi | `DIGIPLUS MEGA MALL BATAM CENTRE` |
| 20 | `Concept` | Kategori | Konsep atau format toko | `Multibrand` |
| 21 | `Week Apple` | Periode | Label minggu versi kalender Apple | `W10` |
| 22 | `Quarter Apple` | Periode | Label kuartal versi kalender Apple | `Q4` |
| 23 | `Week SF` | Periode | Label minggu versi SF | `W36` |

## Domain Nilai Utama

- `Date`: 16 nilai tanggal berbeda; disimpan sebagai serial tanggal Excel.
- `Brand Name`: 57 nilai unik pada baris terisi.
- `Product Division`: 1 nilai utama, yaitu `HEALTH EQUIPMENT`; sebagian baris kosong.
- `Product Group`: 7 nilai kategori pada baris terisi, dengan nilai utama `DEVICES` dan `ACCESSORIES`.
- `Product Category`: 37 kategori pada baris terisi; `PHONE` dan `CHARGER` paling dominan.
- `QtyItem`: mayoritas bernilai `1`, dengan beberapa baris bernilai lebih besar.
- `Store Code`: 127 kode toko pada baris terisi.
- `Store Name`: 127 nama toko pada baris terisi.
- `Month`: seluruh baris terisi bernilai `September`.
- `Year`: seluruh baris terisi bernilai `2026`.
- `SAP Article` dan `SAP Description`: masing-masing 1.174 nilai pada baris terisi.
- `Brand Code`: 58 kode pada baris terisi.
- `LOB`: 58 nilai kategori pada baris terisi.
- `SubLOB`: 202 nilai pada baris terisi; nilai `0` sering digunakan sebagai placeholder.
- `KPI Group`: 4 kategori utama, termasuk `ACCESSORIES`, `APPLE`, dan `ANDROID`.
- `Concept`: 4 kategori pada baris terisi, dengan `Multibrand` sebagai kategori dominan.
- `Week Apple`: menggunakan label `W10` sampai `W13`.
- `Quarter Apple`: seluruh baris terisi bernilai `Q4`.
- `Week SF`: menggunakan label `W36` sampai `W39`.

## Relasi Kolom

- `Brand Name`, `Brand Code`, dan `SAP Article` mengidentifikasi merek serta produk.
- `Product Division`, `Product Group`, `Product Category`, `LOB`, dan `SubLOB` membentuk klasifikasi produk bertingkat.
- `Store Code` menghubungkan transaksi dengan master data toko; `Store Name` menjadi label tampilan toko.
- `Date`, `Month`, `Year`, `Week Apple`, `Quarter Apple`, dan `Week SF` membentuk dimensi waktu dengan kalender yang berbeda.
- `LocalAmount` digunakan untuk revenue; `QtyItem` digunakan untuk volume unit; `DiscPrice` digunakan untuk analisis diskon atau harga setelah diskon.
- `KPI Group` digunakan sebagai dimensi agregasi KPI, bukan pengganti `Product Group` atau `Product Category`.

## Catatan Identitas Data

- File tidak memiliki `Sales ID` atau `Invoice Transaction`, sehingga identitas transaksi individual tidak tersedia secara eksplisit.
- `Date` wajib dikonversi dari serial Excel ke tanggal standar.
- Terdapat baris kosong pada beberapa kolom inti; perlakukan sebagai `NULL`, bukan kategori valid.
- `Month` dan `Year` tampak sebagai kolom turunan dari `Date`; validasi konsistensinya sebelum dipakai sebagai filter.
- `Week Apple` dan `Week SF` memakai sistem minggu berbeda; jangan mencampur keduanya dalam satu metrik tanpa aturan kalender yang jelas.
- Jangan menjumlahkan `LocalAmount` setelah join yang menggandakan baris; pertahankan grain satu baris item.
