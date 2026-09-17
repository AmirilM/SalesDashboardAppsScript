# Informasi Data Stores

## Sumber Data
- **File**: `import_database/data-stores.xlsx`
- **Worksheet**: `Stores`
- **Jumlah data**: 229 toko
- **Jumlah kolom**: 12

## Struktur Kolom

| Kolom | Tipe informasi | Keterangan | Kelengkapan |
|---|---|---|---:|
| `Store Code` | ID toko | Kode unik toko | 229/229 |
| `Cost Center` | ID keuangan | Kode cost center | 229/229 |
| `Store Name` | Identitas toko | Nama toko | 229/229 |
| `Concept` | Kategori | Konsep atau format toko | 229/229 |
| `Area (sqm)` | Numerik | Luas toko dalam meter persegi | 212/229 |
| `Opening Date` | Tanggal | Tanggal pembukaan toko | 225/229 |
| `Email Stores` | Kontak | Email toko | 225/229 |
| `City` | Geografi | Kota atau lokasi toko | 221/229 |
| `Province` | Geografi | Provinsi toko | 221/229 |
| `Region` | Organisasi | Region operasional | 150/229 |
| `RH` | Organisasi | Regional Head | 227/229 |
| `AM` | Organisasi | Area Manager | 228/229 |

## Ringkasan Nilai

- `Store Code`, `Cost Center`, dan `Store Name` terisi penuh serta memiliki nilai unik per toko.
- `Concept` memiliki 6 kategori: `Multibrand` (104), `AAR` (84), `APP` (17), `Samsung` (10), `Shop in Shop` (8), dan `Apple Zone` (6).
- Total luas toko yang terisi: **19.936,66 m²**.
- Luas toko terisi berada pada rentang **8–734,5 m²**, dengan rata-rata sekitar **94,04 m²**.
- Terdapat data pada **29 provinsi**; provinsi terbanyak adalah `DKI Jakarta` (45), `Jawa Barat` (42), `Jawa Timur` (27), dan `Jawa Tengah` (22).
- Kota terbanyak adalah `Jakarta Selatan` (16), `Surabaya` (14), `Bandung` (10), dan `Jakarta Pusat` (10).
- Terdapat **4 Regional Head** utama: `Zikri Rahmadanor` (75), `Desmon Guries` (70), `Alex Fransisco` (52), dan `Andy Sawito` (30).
- `AM` memiliki 18 nama berbeda. Satu data tidak memiliki `AM`.

## Catatan Kualitas Data

- Nilai kosong terdapat pada `Area (sqm)` (17), `Opening Date` (4), `Email Stores` (4), `City` (8), `Province` (8), `Region` (79), `RH` (2), dan `AM` (1).
- Kolom `Region` memiliki kelengkapan paling rendah, yaitu 150 dari 229 baris.
- Format `Opening Date` perlu dinormalisasi karena workbook menggunakan kombinasi serial tanggal Excel dan teks tanggal, contohnya `22-Des-25`.
- Penulisan nama `AM` belum seragam, contohnya `SUHARTONO` dan `Suhartono`; normalisasi kapitalisasi disarankan sebelum agregasi.
- Nilai kosong sebaiknya dipertahankan sebagai `NULL` atau label khusus, bukan dianggap sebagai kategori valid.

## Pemanfaatan Data

Data dapat digunakan untuk:

1. Menampilkan daftar dan identitas toko.
2. Menganalisis persebaran toko berdasarkan konsep, kota, provinsi, dan region.
3. Menghitung total serta rata-rata luas toko.
4. Mengelompokkan toko berdasarkan `RH` dan `AM`.
5. Menghubungkan data toko dengan data transaksi menggunakan `Store Code` atau `Cost Center`.
