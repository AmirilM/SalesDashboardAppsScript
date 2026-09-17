const assert = require('node:assert/strict');
const path = require('node:path');
const { loadFunctions } = require('./load-gs');
const transactions = require('./fixtures');
const config = loadFunctions(path.join(__dirname, '..', 'Config.gs'), ['getConfig'], {
  PropertiesService: { getScriptProperties: () => ({ getProperty: () => '' }) }
});
assert.throws(() => config.getConfig(), /Spreadsheet ID is not configured/);
const data = loadFunctions(path.join(__dirname, '..', 'DataService.gs'), ['paginateRows']);
assert.deepEqual(JSON.parse(JSON.stringify(data.paginateRows([0, 1, 2, 3], 2, 2))), {
  rows: [2, 3], total: 4, page: 2, page_size: 2
});
assert.throws(() => data.paginateRows([], 0, 1), /page must be a positive integer/);
assert.throws(() => data.paginateRows([], 1, 101), /page_size must be between 1 and 100/);
const request = loadFunctions(path.join(__dirname, '..', 'RequestService.gs'), ['parseRequest']);
assert.deepEqual(JSON.parse(JSON.stringify(request.parseRequest({ action: 'stores', page: '2', page_size: '25' }))), {
  action: 'stores', page: 2, page_size: 25
});
assert.throws(() => request.parseRequest({ action: 'unknown' }), /Unsupported action/);
assert.throws(() => request.parseRequest({ action: 'stores', page: '0' }), /page must be a positive integer/);
const sales = loadFunctions(path.join(__dirname, '..', 'SalesService.gs'), ['getTransactionsResponse'], {
  paginateRows: data.paginateRows,
  getSheetObjects: () => [0, 1, 2]
});
assert.deepEqual(JSON.parse(JSON.stringify(sales.getTransactionsResponse('sheet', 1, 2))), {
  rows: [0, 1], total: 3, page: 1, page_size: 2
});
const stores = loadFunctions(path.join(__dirname, '..', 'StoreService.gs'), ['getStoresResponse'], {
  CONFIG: { SHEETS: { STORES: 'stores' } },
  getSheetObjects: () => [1, 2, 3],
  paginateRows: data.paginateRows
});
assert.deepEqual(JSON.parse(JSON.stringify(stores.getStoresResponse(1, 2))), {
  rows: [1, 2], total: 3, page: 1, page_size: 2
});
const targets = loadFunctions(path.join(__dirname, '..', 'TargetService.gs'), ['getStoreTargetsResponse', 'getStaffTargetsResponse'], {
  CONFIG: { SHEETS: { STORE_TARGETS: 'store-targets', STAFF_TARGETS: 'staff-targets' } },
  getSheetObjects: sheet => sheet === 'store-targets' ? [1, 2] : [3],
  paginateRows: data.paginateRows
});
assert.equal(targets.getStoreTargetsResponse(1, 1).total, 2);
assert.equal(targets.getStaffTargetsResponse(1, 1).total, 1);
const api = loadFunctions(path.join(__dirname, '..', 'Code.gs'), ['errorResponse'], {
  ContentService: {
    MimeType: { JSON: 'JSON' },
    createTextOutput: value => ({ value, setMimeType: () => ({ value }) })
  }
});
assert.match(api.errorResponse('BAD_REQUEST', 'invalid').value, /BAD_REQUEST/);
const kpi = loadFunctions(path.join(__dirname, '..', 'KPIService.gs'), [
  'buildKpiSummary',
  'calculateTotalRevenue',
  'calculateAppleRevenue',
  'calculateAndroidRevenue',
  'calculateAccessoriesRevenue',
  'calculateVasRevenue',
  'calculateAppleProductLineRevenue',
  'calculateAndroidBrandRevenue'
]);
assert.deepEqual(JSON.parse(JSON.stringify(kpi.buildKpiSummary(transactions))), {
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

assert.equal(kpi.calculateTotalRevenue(transactions), 700);
assert.equal(kpi.calculateAppleRevenue(transactions), 300);
assert.equal(kpi.calculateAndroidRevenue(transactions), 300);
const messyTransactions = [{ localamount: '200', kpi_group: ' apple ', lob: 'iphone', brand_name: 'APPLE' }];
assert.equal(kpi.calculateAppleRevenue(messyTransactions), 200);
assert.equal(kpi.calculateAppleProductLineRevenue(messyTransactions).iphone_revenue, 200);
assert.deepEqual(JSON.parse(JSON.stringify(kpi.calculateAppleProductLineRevenue(transactions))), {
  iphone_revenue: 200,
  ipad_revenue: 100,
  mac_revenue: 0,
  apple_watch_revenue: 0
});
assert.deepEqual(JSON.parse(JSON.stringify(kpi.calculateAndroidBrandRevenue(transactions))), {
  samsung_revenue: 300,
  oppo_revenue: 0,
  xiaomi_revenue: 0,
  huawei_revenue: 0,
  infinix_revenue: 0,
  motorola_revenue: 0,
  amazfit_revenue: 0
});

console.log('backend tests: PASS');
