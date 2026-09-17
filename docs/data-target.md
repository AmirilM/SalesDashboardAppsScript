# Informasi Data Target

## Sumber Data

- **File**: `import_database/data-target.xlsx`
- **Worksheet**: `Target`
- **Jumlah data**: 130 toko/site
- **Jumlah kolom**: 15
- **Periode**: tidak tercantum pada worksheet
- **Satuan nilai**: diasumsikan Rupiah berdasarkan nama kolom revenue; konfirmasi sumber diperlukan sebelum pelaporan resmi.

## Struktur Kolom

| Kolom | Tipe informasi | Keterangan | Kelengkapan |
|---|---|---|---:|
| `Site` | ID site | Kode unik site | 130/130 |
| `Cost Center` | ID keuangan | Kode cost center | 130/130 |
| `Store` | Identitas toko | Nama toko/site | 130/130 |
| `Concept` | Kategori | Konsep atau format toko | 130/130 |
| `Target Revenue` | Numerik | Target revenue total per site | 130/130 |
| `Apple Revenue` | Numerik | Target revenue kategori Apple | 130/130 |
| `Android Revenue` | Numerik | Target revenue kategori Android | 130/130 |
| `Samsung Revenue` | Numerik | Target revenue brand Samsung | 130/130 |
| `Xiaomi Revenue` | Numerik | Target revenue brand Xiaomi | 130/130 |
| `Huawei Revenue` | Numerik | Target revenue brand Huawei | 130/130 |
| `Motorola Revenue` | Numerik | Target revenue brand Motorola | 130/130 |
| `Oppo Revenue` | Numerik | Target revenue brand Oppo | 130/130 |
| `Infinix Revenue` | Numerik | Target revenue brand Infinix | 130/130 |
| `Accessories Revenue` | Numerik | Target revenue accessories | 130/130 |
| `VAS Revenue` | Numerik | Target revenue VAS | 130/130 |

## Ringkasan Nilai

- Total `Target Revenue`: **Rp187.195.449.483,83**.
- Total target `Apple Revenue`: **Rp120.399.752.810,09**.
- Total target `Android Revenue`: **Rp59.656.310.879,80**.
- Total target `Accessories Revenue`: **Rp5.891.583.994,64**.
- Total target `VAS Revenue`: **Rp1.247.801.798,86**.
- `Concept` memiliki 5 kategori:
  - `Digiplus`: 107 site, target **Rp162.752.449.483,83**
  - `Samsung`: 10 site, target **Rp11.738.000.000,00**
  - `SHOP IN SHOP`: 7 site, target **Rp8.805.000.000,00**
  - `APPLE ZONE`: 4 site, target **Rp2.600.000.000,00**
  - `DIGIPLUS SIS`: 2 site, target **Rp1.300.000.000,00**
- Semua kolom terisi penuh dan `Site` serta `Cost Center` memiliki nilai unik.

## Relasi Nilai Revenue

Kolom revenue memuat target berdasarkan kategori dan brand. `Target Revenue` merupakan target utama per site, sedangkan kolom kategori menjelaskan pembagian target berdasarkan lini bisnis atau brand. Sebelum agregasi, cek apakah jumlah seluruh komponen revenue harus sama dengan `Target Revenue`, karena struktur kolom dapat memiliki aturan bisnis yang berbeda.

## Catatan Kualitas Data

- Tidak ada nilai kosong pada 130 baris yang dianalisis.
- Nama konsep menggunakan kapitalisasi yang belum seragam, contohnya `Digiplus`, `DIGIPLUS SIS`, `SHOP IN SHOP`, dan `APPLE ZONE`.
- Tidak ada kolom periode atau tanggal target. Periode pelaporan perlu ditambahkan atau didokumentasikan dari sumber lain.
- Nilai numerik tersimpan dengan banyak angka desimal; pembulatan ke Rupiah sebaiknya dilakukan hanya pada tampilan atau tahap pelaporan.
- Pastikan `Site` dan `Cost Center` memakai format yang sama dengan file master toko dan file transaksi sebelum melakukan penggabungan data.

## Pemanfaatan Data

1. Membandingkan realisasi revenue dengan target per site.
2. Menghitung pencapaian target total dan berdasarkan kategori revenue.
3. Membuat peringkat site berdasarkan target revenue.
4. Menganalisis komposisi target Apple, Android, brand Android, accessories, dan VAS.
5. Menghubungkan target dengan master toko melalui `Site`, `Cost Center`, atau nama toko setelah validasi kunci.
