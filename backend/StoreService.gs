function getStores() {
  return getSheetObjects(CONFIG.SHEETS.STORES);
}

function getStoresResponse(page, pageSize) {
  return paginateRows(getStores(), page, pageSize);
}