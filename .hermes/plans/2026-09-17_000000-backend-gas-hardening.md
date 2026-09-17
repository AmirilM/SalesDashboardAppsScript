# Backend GAS Hardening Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Ubah `backend/` dari API read-only prototype menjadi backend Google Apps Script yang aman, tervalidasi, hemat pembacaan Spreadsheet, dan menyediakan data KPI dashboard yang benar-benar dapat dipakai.

**Architecture:** Pertahankan Google Apps Script Web App sebagai satu entry point di `backend/Code.gs`. Pisahkan routing/validasi di `Code.gs`, pembacaan dan cache data di `backend/DataService.gs`, kalkulasi KPI di `backend/KPIService.gs`, dan fungsi domain tetap di service masing-masing; jangan tambah framework atau dependency. Untuk kompatibilitas Apps Script, test fungsi murni memakai Node.js bawaan dengan shim minimal, lalu verifikasi endpoint nyata memakai `clasp` dan URL deployment setelah kredensial/deployment tersedia.

**Tech Stack:** Google Apps Script V8, Google Sheets `SpreadsheetApp`, `CacheService`, `PropertiesService`, Node.js bawaan, `@google/clasp`.

---

## Current context / assumptions

- `backend/Code.gs:1-43` hanya memiliki `doGet(e)` dan routing berdasarkan `e.parameter.action`.
- `backend/Config.gs:1-10` menyimpan Spreadsheet ID hardcoded dan nama lima sheet.
- `backend/DataService.gs:1-34` membaca seluruh `getDataRange()` setiap request dan memetakan header melalui `normalizeKey()`.
- `backend/KPIService.gs:1-130` memiliki kalkulasi revenue, tetapi belum dipanggil endpoint mana pun.
- `backend/SalesService.gs:1-7`, `backend/StoreService.gs:1-3`, dan `backend/TargetService.gs:1-11` hanya wrapper pembacaan sheet.
- `backend/appsscript.json:1-10` memakai V8, timezone `Asia/Jakarta`, dan `ANYONE_ANONYMOUS`.
- `package.json:1-14` hanya menyediakan command `clasp`; belum ada test runner.
- Nama field hasil `normalizeKey()` menjadi snake_case; KPI bergantung pada `localamount`, `kpi_group`, `lob`, dan `brand_name`.
- Tidak boleh menambah write endpoint sebelum ownership, schema input, dan aturan otorisasi jelas. Rencana ini fokus pada read API dashboard.
- `ANYONE_ANONYMOUS` dianggap risiko default. Deployment final harus menggunakan akses terbatas bila dashboard tidak memang publik.

## Architecture / proposed approach

Tambahkan kontrak API read-only yang eksplisit: `health`, `stores`, `store-targets`, `staff-targets`, `store-transactions`, `staff-transactions`, dan `kpi`. Semua request melewati validasi action, parameter tanggal/ID/pagination, serta response JSON seragam. Cache hasil sheet dengan `CacheService`, tetapi tetap sediakan fallback langsung ke Spreadsheet saat cache miss dan jangan cache error.

KPI dihitung dari transaksi yang sudah difilter di server agar dashboard tidak mengunduh seluruh raw data tanpa kebutuhan. Nilai numerik dan enum dinormalisasi sekali di data layer; fungsi KPI tetap murni dan diuji dengan fixture kecil. Konfigurasi non-secret dipindah ke `PropertiesService` dengan fallback yang aman untuk migrasi, tanpa mencetak Spreadsheet ID atau data transaksi ke log.

## Step-by-step tasks

### Task 1: Tetapkan fixture dan harness test fungsi murni

**Objective:** Buat test tanpa dependency tambahan untuk mengunci perilaku normalisasi dan KPI sebelum mengubah production code.

**Files:**
- Create: `backend/tests/fixtures.js`
- Create: `backend/tests/run-tests.js`
- Modify: `package.json:4-10`

**Step 1: Write failing test**

Buat `backend/tests/run-tests.js` dengan assert untuk fixture transaksi berikut:

```js
const assert = require('node:assert/strict');
const {
  calculateTotalRevenue,
  calculateAppleRevenue,
  calculateAndroidRevenue,
  calculateAppleProductLineRevenue,
  calculateAndroidBrandRevenue
} = require('../KPIService');

const transactions = require('./fixtures');

assert.equal(calculateTotalRevenue(transactions), 700);
assert.equal(calculateAppleRevenue(transactions), 300);
assert.equal(calculateAndroidRevenue(transactions), 300);
assert.deepEqual(calculateAppleProductLineRevenue(transactions), {
  iphone_revenue: 200,
  ipad_revenue: 100,
  mac_revenue: 0,
  apple_watch_revenue: 0
});
assert.deepEqual(calculateAndroidBrandRevenue(transactions), {
  samsung_revenue: 300,
  oppo_revenue: 0,
  xiaomi_revenue: 0,
  huawei_revenue: 0,
  infinix_revenue: 0,
  motorola_revenue: 0,
  amazfit_revenue: 0
});

console.log('backend tests: PASS');
```

Buat `backend/tests/fixtures.js`:

```js
module.exports = [
  { localamount: 200, kpi_group: 'APPLE', lob: 'IPHONE', brand_name: 'APPLE' },
  { localamount: 100, kpi_group: 'APPLE', lob: 'IPAD', brand_name: 'APPLE' },
  { localamount: 300, kpi_group: 'ANDROID', lob: 'PHONE', brand_name: 'SAMSUNG' },
  { localamount: 50, kpi_group: 'ACCESSORIES', lob: 'CASE', brand_name: 'OTHER' },
  { localamount: 50, kpi_group: 'VAS', lob: 'SERVICE', brand_name: 'OTHER' }
];
```

Sebelum test dapat dijalankan di Node, `KPIService.gs` perlu diekspor saat test atau dimuat lewat harness. Gunakan adapter test, bukan `module.exports` di production Apps Script.

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`

Expected: FAIL — `Cannot find module '../KPIService'`.

**Step 3: Write minimal test adapter**

Buat `backend/tests/load-gs.js` yang membaca source `.gs`, menghapus/menangani deklarasi Apps Script yang tidak diperlukan, menjalankan source dalam `vm`, lalu mengembalikan fungsi yang diminta. Adapter hanya untuk test dan tidak di-deploy.

**Step 4: Run test to verify pass**

Ubah `run-tests.js` memakai adapter, lalu run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/tests package.json
git commit -m "test: add backend KPI harness"
```

### Task 2: Pindahkan konfigurasi spreadsheet ke PropertiesService

**Objective:** Hentikan ketergantungan production pada Spreadsheet ID hardcoded dan beri error jelas bila property belum diset.

**Files:**
- Modify: `backend/Config.gs:1-10`
- Create: `backend/Setup.gs`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Test `getConfig()` dengan shim `PropertiesService`:

```js
assert.throws(
  () => getConfig({ SPREADSHEET_ID: '' }),
  /Spreadsheet ID is not configured/
);
```

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — `getConfig is not defined`.

**Step 3: Write minimal implementation**

`backend/Config.gs` harus menggunakan pola ini:

```js
const CONFIG = {
  SHEETS: {
    STORE_TRANSACTIONS: 'raw-store-transaction',
    STAFF_TRANSACTIONS: 'raw-staff-transaction',
    STORE_TARGETS: 'master-targetstore',
    STAFF_TARGETS: 'master-targetstaff',
    STORES: 'master-datastore'
  }
};

function getConfig() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Spreadsheet ID is not configured');
  return { SPREADSHEET_ID: id, SHEETS: CONFIG.SHEETS };
}
```

`backend/Setup.gs` menyediakan fungsi manual sekali jalan:

```js
function setSpreadsheetId() {
  PropertiesService.getScriptProperties()
    .setProperty('SPREADSHEET_ID', '1hAJNsQtuz72InQxFR6yuo7q_grInlFDgG1uGVRQNB9I');
}
```

Implementer wajib mengganti placeholder di Apps Script editor atau memakai `clasp` hanya setelah ID disediakan operator; jangan menaruh ID nyata di repository.

Update `DataService.gs` agar memakai `getConfig().SPREADSHEET_ID`.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/Config.gs backend/Setup.gs backend/DataService.gs backend/tests
 git commit -m "refactor: load spreadsheet configuration from properties"
```

### Task 3: Tambahkan data access cache dan pembatasan ukuran hasil

**Objective:** Kurangi pembacaan Spreadsheet berulang dan cegah endpoint mengembalikan dataset tak terbatas.

**Files:**
- Modify: `backend/DataService.gs:1-34`
- Modify: `backend/Config.gs:1-14`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan test bahwa `paginateRows(rows, 2, 1)` mengembalikan dua row mulai index satu, dan parameter invalid melempar error:

```js
assert.deepEqual(paginateRows([0, 1, 2, 3], 2, 1), { rows: [1, 2], total: 4, page: 2, page_size: 2 });
assert.throws(() => paginateRows([], 0, 1), /page must be a positive integer/);
assert.throws(() => paginateRows([], 1, 101), /page_size must be between 1 and 100/);
```

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — `paginateRows is not defined`.

**Step 3: Write minimal implementation**

Tambahkan fungsi murni di `backend/DataService.gs`:

```js
function paginateRows(rows, page, pageSize) {
  if (!Number.isInteger(page) || page < 1) throw new Error('page must be a positive integer');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error('page_size must be between 1 and 100');
  }
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length, page, page_size: pageSize };
}
```

Tambahkan `CacheService` cache untuk `getSheetObjects(sheetName)`, dengan key hash-safe dari nama sheet, TTL 60 detik, dan fallback bila cache gagal. Jangan cache hasil lebih besar dari batas Apps Script cache; bila serialisasi terlalu besar, kembalikan data langsung.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/DataService.gs backend/Config.gs backend/tests
git commit -m "perf: cache sheet reads and paginate results"
```

### Task 4: Validasi action dan parameter request

**Objective:** Pastikan request invalid tidak membaca Spreadsheet dan selalu menerima response error yang konsisten.

**Files:**
- Modify: `backend/Code.gs:1-43`
- Create: `backend/RequestService.gs`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan test:

```js
assert.deepEqual(parseRequest({ action: 'stores', page: '2', page_size: '25' }), {
  action: 'stores', page: 2, page_size: 25
});
assert.throws(() => parseRequest({ action: 'unknown' }), /Unsupported action/);
assert.throws(() => parseRequest({ action: 'stores', page: '0' }), /page must be a positive integer/);
```

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — `parseRequest is not defined`.

**Step 3: Write minimal implementation**

`backend/RequestService.gs` harus memiliki allowlist dan parser berikut:

```js
const ALLOWED_ACTIONS = [
  'health', 'stores', 'store-targets', 'staff-targets',
  'store-transactions', 'staff-transactions', 'kpi'
];

function parseRequest(parameter) {
  const action = String(parameter.action || 'health');
  if (ALLOWED_ACTIONS.indexOf(action) === -1) throw new Error('Unsupported action: ' + action);
  const page = parameter.page === undefined ? 1 : Number(parameter.page);
  const page_size = parameter.page_size === undefined ? 50 : Number(parameter.page_size);
  if (!Number.isInteger(page) || page < 1) throw new Error('page must be a positive integer');
  if (!Number.isInteger(page_size) || page_size < 1 || page_size > 100) {
    throw new Error('page_size must be between 1 and 100');
  }
  return { action, page, page_size: page_size };
}
```

Refactor `Code.gs` to call `parseRequest(e && e.parameter || {})` before service calls, and return `{ success: false, error: { code: 'BAD_REQUEST', message: error.message } }` on validation failure.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/Code.gs backend/RequestService.gs backend/tests
git commit -m "feat: validate API actions and pagination"
```

### Task 5: Expose paginated transaction endpoints

**Objective:** Sediakan data transaksi toko/staff untuk dashboard tanpa mengirim seluruh sheet setiap request.

**Files:**
- Modify: `backend/Code.gs:1-43`
- Modify: `backend/SalesService.gs:1-7`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan test bahwa `getTransactionsResponse(rows, 1, 2)` mengembalikan envelope `{ rows, total, page, page_size }`.

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — `getTransactionsResponse is not defined`.

**Step 3: Write minimal implementation**

`backend/SalesService.gs` harus menambahkan:

```js
function getTransactionsResponse(sheetName, page, pageSize) {
  return paginateRows(getSheetObjects(sheetName), page, pageSize);
}
```

`Code.gs` harus memetakan:

```js
if (request.action === 'store-transactions') {
  return jsonResponse({ success: true, data: getTransactionsResponse(CONFIG.SHEETS.STORE_TRANSACTIONS, request.page, request.page_size) });
}
if (request.action === 'staff-transactions') {
  return jsonResponse({ success: true, data: getTransactionsResponse(CONFIG.SHEETS.STAFF_TRANSACTIONS, request.page, request.page_size) });
}
```

Pertahankan endpoint count lama hanya bila frontend masih memakainya; jangan duplikasi pembacaan data bila count dapat dihitung dari response paginated.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/Code.gs backend/SalesService.gs backend/tests
git commit -m "feat: expose paginated transaction endpoints"
```

### Task 6: Tambahkan endpoint KPI yang memakai fungsi KPI existing

**Objective:** Hubungkan `KPIService.gs` ke API dan hasilkan satu payload KPI dashboard dari transaksi terfilter.

**Files:**
- Modify: `backend/KPIService.gs:1-130`
- Modify: `backend/Code.gs:1-43`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan test:

```js
assert.deepEqual(buildKpiSummary(transactions), {
  total_revenue: 700,
  apple_revenue: 300,
  android_revenue: 300,
  accessories_revenue: 50,
  vas_revenue: 50,
  iphone_revenue: 200,
  ipad_revenue: 100,
  mac_revenue: 0,
  apple_watch_revenue: 0,
  samsung_revenue: 300,
  oppo_revenue: 0,
  xiaomi_revenue: 0,
  huawei_revenue: 0,
  infinix_revenue: 0,
  motorola_revenue: 0,
  amazfit_revenue: 0
});
```

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — `buildKpiSummary is not defined`.

**Step 3: Write minimal implementation**

Tambahkan di `backend/KPIService.gs`:

```js
function buildKpiSummary(transactions) {
  return Object.assign(
    {
      total_revenue: calculateTotalRevenue(transactions),
      apple_revenue: calculateAppleRevenue(transactions),
      android_revenue: calculateAndroidRevenue(transactions),
      accessories_revenue: calculateAccessoriesRevenue(transactions),
      vas_revenue: calculateVasRevenue(transactions)
    },
    calculateAppleProductLineRevenue(transactions),
    calculateAndroidBrandRevenue(transactions)
  );
}
```

Tambahkan routing `kpi` di `Code.gs`. Untuk versi minimum, KPI membaca transaksi toko; dokumentasikan bahwa KPI staff perlu action/parameter terpisah bila definisi bisnis berbeda. Jangan mencampur store dan staff tanpa requirement eksplisit.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/Code.gs backend/KPIService.gs backend/tests
git commit -m "feat: expose dashboard KPI summary"
```

### Task 7: Normalisasi nilai input KPI dan filter sederhana

**Objective:** Cegah KPI salah karena perbedaan kapitalisasi, whitespace, atau amount non-numeric dari Spreadsheet.

**Files:**
- Modify: `backend/DataService.gs:12-34`
- Modify: `backend/KPIService.gs:1-130`
- Modify: `backend/RequestService.gs`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan fixture row dengan `kpi_group: ' apple '`, `lob: 'iphone'`, dan `localamount: '200'`; test harus menghasilkan Apple/iPhone revenue 200. Tambahkan test `filterTransactions(rows, { store_id: 'S1' })` hanya mengembalikan row `store_id === 'S1'`.

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — nilai lowercase/whitespace belum dihitung atau `filterTransactions` belum ada.

**Step 3: Write minimal implementation**

Tambahkan helper murni di `DataService.gs`:

```js
function normalizeText(value) {
  return String(value == null ? '' : value).trim().toUpperCase();
}

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}
```

Gunakan helper ini di KPI, bukan mengubah schema output. Tambahkan filter allowlist hanya untuk field yang benar-benar ada di spreadsheet (`store_id`, `staff_id`, `date` atau nama kolom yang diverifikasi dari fixture/Spreadsheet). Jangan mengarang nama kolom; bila schema aktual berbeda, sesuaikan setelah inspeksi header.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/DataService.gs backend/KPIService.gs backend/RequestService.gs backend/tests
git commit -m "fix: normalize KPI values and filter transactions"
```

### Task 8: Perjelas service store dan target tanpa duplikasi

**Objective:** Beri envelope pagination konsisten untuk stores/targets dan hapus wrapper yang tidak dipakai atau pertahankan alias dengan alasan kompatibilitas.

**Files:**
- Modify: `backend/StoreService.gs:1-3`
- Modify: `backend/TargetService.gs:1-11`
- Modify: `backend/Code.gs:1-43`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan test bahwa `getStoresResponse(1, 50)` dan target response memakai envelope yang sama dengan transaksi. Stub `getSheetObjects` pada harness agar tidak menyentuh Spreadsheet.

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — response masih berupa array tanpa metadata pagination.

**Step 3: Write minimal implementation**

Tambahkan wrapper berikut:

```js
function getStoresResponse(page, pageSize) {
  return paginateRows(getStores(), page, pageSize);
}

function getStoreTargetsResponse(page, pageSize) {
  return paginateRows(getStoreTargets(), page, pageSize);
}

function getStaffTargetsResponse(page, pageSize) {
  return paginateRows(getStaffTargets(), page, pageSize);
}
```

Update `Code.gs` agar `stores`, `store-targets`, `staff-targets` memakai response envelope. Pertahankan `getTargets()` hanya sebagai alias legacy bila ada caller; tandai komentar `legacy alias` dan jangan tambahkan alias baru.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/StoreService.gs backend/TargetService.gs backend/Code.gs backend/tests
git commit -m "refactor: standardize store and target responses"
```

### Task 9: Standarkan error response, logging, dan cache invalidation

**Objective:** Beri error code stabil kepada frontend tanpa membocorkan detail internal, dan sediakan invalidasi cache manual untuk perubahan Spreadsheet.

**Files:**
- Modify: `backend/Code.gs:1-43`
- Modify: `backend/DataService.gs:1-34`
- Modify: `backend/Setup.gs`
- Modify: `backend/tests/run-tests.js`

**Step 1: Write failing test**

Tambahkan test bahwa error internal menjadi `{ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }`, sedangkan bad request mempertahankan `BAD_REQUEST`.

**Step 2: Run test to verify failure**

Run: `node backend/tests/run-tests.js`.

Expected: FAIL — error response masih memakai string mentah.

**Step 3: Write minimal implementation**

Tambahkan di `Code.gs`:

```js
function errorResponse(code, message) {
  return jsonResponse({ success: false, error: { code: code, message: message } });
}
```

Di `doGet`, gunakan `BAD_REQUEST` untuk validation error dan `INTERNAL_ERROR` untuk error lain. Log hanya `error.message` dan action; jangan log row data, token, atau Spreadsheet ID. Tambahkan di `Setup.gs`:

```js
function clearDataCache() {
  CacheService.getScriptCache().removeAll(['sheet_objects_v1']);
}
```

Sesuaikan key cache agar invalidation benar-benar menghapus key yang digunakan; jika `removeAll` tidak cocok dengan API/cache design, buat daftar key tetap dari lima sheet. Jangan mengklaim cache cleared sebelum fungsi diuji di deployment.

**Step 4: Run test to verify pass**

Run: `node backend/tests/run-tests.js`.

Expected: `backend tests: PASS`.

**Step 5: Commit**

```bash
git add backend/Code.gs backend/DataService.gs backend/Setup.gs backend/tests
git commit -m "fix: standardize API errors and cache maintenance"
```

### Task 10: Amankan deployment dan dokumentasikan kontrak API

**Objective:** Hindari deployment anonymous tanpa keputusan eksplisit dan beri operator dokumentasi setup/verifikasi.

**Files:**
- Modify: `backend/appsscript.json:6-9`
- Create: `backend/README.md`
- Modify: `package.json:4-10`

**Step 1: Write failing documentation check**

Buat checklist manual di `backend/README.md` yang menyebut action, query parameter, response envelope, Script Property `SPREADSHEET_ID`, dan status deployment. Tambahkan command package:

```json
"test:backend": "node backend/tests/run-tests.js"
```

**Step 2: Run test to verify failure**

Run: `npm run test:backend`.

Expected: FAIL sampai harness dan semua perubahan sebelumnya selesai; setelah task sebelumnya selesai, expected `backend tests: PASS`.

**Step 3: Write minimal implementation**

Ubah `backend/appsscript.json` dari `ANYONE_ANONYMOUS` ke akses terbatas yang dipilih pemilik project, kecuali requirement bisnis memang public. Jika deployment anonymous wajib, tulis risiko dan tambahkan authentication/token sebagai follow-up blocker; jangan berpura-pura anonymous aman.

README wajib memuat command verifikasi:

```bash
npm run test:backend
npx clasp status
npx clasp push
```

Expected:
- `npm run test:backend` → `backend tests: PASS`
- `npx clasp status` → project terhubung dan file backend terdeteksi
- `npx clasp push` → upload berhasil tanpa error

**Step 4: Run test to verify pass**

Run: `npm run test:backend`.

Expected: `backend tests: PASS`.

Jika akun/deployment tersedia, jalankan smoke test read-only memakai URL Web App:

```bash
curl -fsS "$WEB_APP_URL?action=health"
curl -fsS "$WEB_APP_URL?action=stores&page=1&page_size=1"
curl -fsS "$WEB_APP_URL?action=kpi"
```

Expected: JSON dengan `success: true`; jangan menaruh URL deployment atau data response sensitif ke repository.

**Step 5: Commit**

```bash
git add backend/appsscript.json backend/README.md package.json
git commit -m "docs: document and verify GAS backend deployment"
```

## Tests / validation

- Per task, jalankan `node backend/tests/run-tests.js` atau `npm run test:backend`; setiap perubahan production code harus punya test gagal sebelum implementasi dan test lulus sesudahnya.
- Final static check: `npm run test:backend` harus mencetak `backend tests: PASS` dan exit code `0`.
- Final repository check: `git status --short` harus hanya menampilkan perubahan yang memang direncanakan; file credential, `.clasp.json`, `.env`, dan Script ID nyata tidak boleh masuk commit.
- Deployment check: `npx clasp status` lalu `npx clasp push`; expected tanpa error upload.
- Runtime smoke check: `health`, `stores`, `store-transactions`, `kpi` dengan `curl`; validasi JSON dan `success` field.
- Spreadsheet integration check: verifikasi lima sheet ada, header menghasilkan key yang diharapkan, dan `localamount` berisi angka yang valid. Bila nama kolom aktual berbeda, ubah mapping berdasarkan header nyata, bukan tebakan.
- TDD commit sequence wajib dipakai setelah tiap task: failing test, minimal implementation, passing test, commit.

## Risks, tradeoffs, and open questions

- `ANYONE_ANONYMOUS` dapat mengekspos data penjualan. Keputusan akses harus datang dari pemilik project; jangan menganggap URL sulit ditebak sebagai authentication.
- `CacheService` punya batas ukuran dan TTL. Cache hanya optimasi; endpoint harus tetap benar saat cache miss atau cache gagal.
- `getDataRange()` masih membaca semua row sebelum filter/pagination. Ini acceptable untuk dataset kecil; bila sheet besar, upgrade berikutnya memakai range terbatas, sheet agregat, atau database. Jangan menambah database sekarang.
- KPI saat ini memakai `localamount` dan enum uppercase tertentu. Header dan nilai Spreadsheet nyata harus diverifikasi sebelum implementasi normalisasi/filter.
- Belum ada definisi apakah KPI dashboard harus memakai transaksi toko, staff, atau gabungan. Rencana memakai transaksi toko untuk `kpi`; minta keputusan bisnis sebelum menambah mode gabungan.
- Belum ada aturan timezone/filter tanggal. `Asia/Jakarta` sudah ada, tetapi nama kolom tanggal dan format tanggal harus dikonfirmasi sebelum filter tanggal diaktifkan.
- `doPost`, write transaction, update target, rate limiting, dan user-level authorization sengaja tidak dibuat: requirement dan threat model belum tersedia.
- Apps Script tidak menjalankan CommonJS `require`; test harness wajib tetap berada di `backend/tests/` dan tidak boleh di-push sebagai runtime code bila konfigurasi `clasp` memasukkan seluruh folder backend. Exclude test folder dari `.claspignore` bila diperlukan.
