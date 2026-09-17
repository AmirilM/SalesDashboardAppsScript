# Sales Dashboard GAS Backend

Read-only Google Apps Script Web App backed by Google Sheets.

## Setup

1. Set Script Property `SPREADSHEET_ID` to actual Google Spreadsheet ID.
2. Verify these sheets exist:
   - `raw-store-transaction`
   - `raw-staff-transaction`
   - `master-targetstore`
   - `master-targetstaff`
   - `master-datastore`
3. Run `clearDataCache()` after spreadsheet headers or rows change.
4. Review Web App access before deployment. `ANYONE_ANONYMOUS` exposes every endpoint to anyone with URL.

## API

Base URL: deployed Apps Script Web App URL.

Query parameters:

- `action=health`
- `action=stores&page=1&page_size=50`
- `action=store-targets&page=1&page_size=50`
- `action=staff-targets&page=1&page_size=50`
- `action=store-transactions&page=1&page_size=50`
- `action=staff-transactions&page=1&page_size=50`
- `action=kpi`
- Legacy: `action=store-transactions-count`, `action=staff-transactions-count`

`page` starts at `1`. `page_size` accepts `1` through `100`.

Paginated endpoints return:

```json
{
  "success": true,
  "data": {
    "rows": [],
    "total": 0,
    "page": 1,
    "page_size": 50
  }
}
```

KPI endpoint returns `success: true` plus `data` containing total, group, product-line, and Android brand revenue fields.

Errors return:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "..."
  }
}
```

Internal failures return `INTERNAL_ERROR` without exposing Spreadsheet details.

## Verification

```bash
npm run test:backend
npx clasp status
npx clasp push
```

Expected:

- `npm run test:backend` prints `backend tests: PASS` and exits `0`.
- `npx clasp status` shows connected Apps Script project.
- `npx clasp push` uploads without error.

Runtime smoke test, after setting `WEB_APP_URL` locally:

```bash
curl -fsS "$WEB_APP_URL?action=health"
curl -fsS "$WEB_APP_URL?action=stores&page=1&page_size=1"
curl -fsS "$WEB_APP_URL?action=kpi"
```

Do not put deployment URLs, Spreadsheet IDs, credentials, or transaction data in this repository.
