function getStoreTargets() {
  return getSheetObjects(CONFIG.SHEETS.STORE_TARGETS);
}

function getStaffTargets() {
  return getSheetObjects(CONFIG.SHEETS.STAFF_TARGETS);
}

function getStoreTargetsResponse(page, pageSize) {
  return paginateRows(getStoreTargets(), page, pageSize);
}

function getStaffTargetsResponse(page, pageSize) {
  return paginateRows(getStaffTargets(), page, pageSize);
}

function getTargets() {
  return getStoreTargets();
}