function doGet(e) {
  try {
    const request = parseRequest((e && e.parameter) || {});

    if (request.action === 'health') {
      return jsonResponse({ success: true, status: 'ok' });
    }

    if (request.action === 'debug-sheets') {
      const ss = SpreadsheetApp.openById(getConfig().SPREADSHEET_ID);
      const sheets = ss.getSheets().map(s => s.getName());
      return jsonResponse({ success: true, sheets: sheets });
    }

    if (request.action === 'stores') {
      return jsonResponse({ success: true, data: getStoresResponse(request.page, request.page_size) });
    }

    if (request.action === 'store-targets' || request.action === 'targets') {
      return jsonResponse({ success: true, data: getStoreTargetsResponse(request.page, request.page_size) });
    }

    if (request.action === 'staff-targets') {
      return jsonResponse({ success: true, data: getStaffTargetsResponse(request.page, request.page_size) });
    }

    if (request.action === 'store-transactions') {
      return jsonResponse({ success: true, data: getTransactionsResponse(CONFIG.SHEETS.STORE_TRANSACTIONS, request.page, request.page_size) });
    }

    if (request.action === 'staff-transactions') {
      return jsonResponse({ success: true, data: getTransactionsResponse(CONFIG.SHEETS.STAFF_TRANSACTIONS, request.page, request.page_size) });
    }

    if (request.action === 'kpi') {
      return jsonResponse({ success: true, data: buildKpiSummary(getStoreTransactions()) });
    }

    if (request.action === 'store-transactions-count') {
      return jsonResponse({ success: true, rows: getStoreTransactions().length });
    }

    if (request.action === 'staff-transactions-count') {
      return jsonResponse({ success: true, rows: getStaffTransactions().length });
    }

    return jsonResponse({
      success: true,
      message: 'Database Project API is running',
      sheets: CONFIG.SHEETS
    });
  } catch (error) {
    const badRequest = /^(Unsupported action|page must be|page_size must be)/.test(error.message);
    return errorResponse(badRequest ? 'BAD_REQUEST' : 'INTERNAL_ERROR', error.message);
  }
}

function errorResponse(code, message) {
  return jsonResponse({ success: false, error: { code: code, message: message } });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}