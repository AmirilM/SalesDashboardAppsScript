function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(getConfig().SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  return sheet.getDataRange().getValues();
}

function getSheetObjects(sheetName) {
  const cache = CacheService.getScriptCache();
  const key = 'sheet_objects_v1_' + normalizeKey(sheetName);
  const cached = cache.get(key);

  if (cached) return JSON.parse(cached);

  const data = getSheetData(sheetName);
  const objects = data.length < 2 ? [] : data.slice(1)
    .filter(row => row.some(value => value !== '' && value !== null))
    .map(row => data[0].map(header => normalizeKey(header)).reduce((object, header, index) => {
      object[header] = row[index];
      return object;
    }, {}));

  try {
    cache.put(key, JSON.stringify(objects), 60);
  } catch (error) {
    // Cache is optional; keep request successful when payload exceeds cache limits.
  }

  return objects;
}

function normalizeKey(header) {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function paginateRows(rows, page, pageSize) {
  if (!Number.isInteger(page) || page < 1) throw new Error('page must be a positive integer');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error('page_size must be between 1 and 100');
  }
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length, page, page_size: pageSize };
}