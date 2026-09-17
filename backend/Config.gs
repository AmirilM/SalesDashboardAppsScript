const CONFIG = {
  SHEETS: {
    STORE_TRANSACTIONS: 'raw-store-transaction',
    STAFF_TRANSACTIONS: 'raw-staff-transaction',
    STORE_TARGETS: 'master-targetstore',   // actual sheet name in Google Sheet
    STAFF_TARGETS: 'master-targetstaff',   // actual sheet name
    STORES: 'master-datastore'             // actual sheet name
  }
};

function getConfig() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Spreadsheet ID is not configured');
  return { SPREADSHEET_ID: id, SHEETS: CONFIG.SHEETS };
}
