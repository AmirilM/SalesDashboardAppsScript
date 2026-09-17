function getStoreTransactions() {
  return getSheetObjects(CONFIG.SHEETS.STORE_TRANSACTIONS);
}

function getStaffTransactions() {
  return getSheetObjects(CONFIG.SHEETS.STAFF_TRANSACTIONS);
}

function getTransactionsResponse(sheetName, page, pageSize) {
  return paginateRows(getSheetObjects(sheetName), page, pageSize);
}