const ALLOWED_ACTIONS = [
  'health', 'stores', 'store-targets', 'staff-targets',
  'store-transactions', 'staff-transactions', 'store-transactions-count',
  'staff-transactions-count', 'kpi', 'debug-sheets'
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

  return { action, page, page_size };
}
