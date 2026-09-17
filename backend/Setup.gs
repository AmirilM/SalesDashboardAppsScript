function setSpreadsheetId() {
  PropertiesService.getScriptProperties()
    .setProperty('SPREADSHEET_ID', '1hAJNsQtuz72InQxFR6yuo7q_grInlFDgG1uGVRQNB9I');
}

function clearDataCache() {
  const cache = CacheService.getScriptCache();
  [
    'raw_store_transaction',
    'raw_staff_transaction',
    'master_targetstore',
    'master_targetstaff',
    'master_datastore'
  ].forEach(sheetName => cache.remove('sheet_objects_v1_' + sheetName));
}
