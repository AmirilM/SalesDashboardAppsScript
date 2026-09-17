function normalizeText(value) {
  return String(value == null ? '' : value).trim().toUpperCase();
}

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function buildKpiSummary(transactions) {
  return Object.assign({
    total_revenue: calculateTotalRevenue(transactions),
    apple_revenue: calculateAppleRevenue(transactions),
    android_revenue: calculateAndroidRevenue(transactions),
    accessories_revenue: calculateAccessoriesRevenue(transactions),
    vas_revenue: calculateVasRevenue(transactions)
  }, calculateAppleProductLineRevenue(transactions), calculateAndroidBrandRevenue(transactions));
}

function calculateTotalRevenue(transactions) {
  return transactions.reduce((total, row) => {
    return total + toAmount(row.localamount);
  }, 0);
}

function calculateAppleRevenue(transactions) {
  return transactions.reduce((total, row) => {
    if (normalizeText(row.kpi_group) === 'APPLE') {
      return total + toAmount(row.localamount);
    }

    return total;
  }, 0);
}

function calculateAndroidRevenue(transactions) {
  return transactions.reduce((total, row) => {
    if (normalizeText(row.kpi_group) === 'ANDROID') {
      return total + toAmount(row.localamount);
    }

    return total;
  }, 0);
}

function calculateAccessoriesRevenue(transactions) {
  return transactions.reduce((total, row) => {
    if (normalizeText(row.kpi_group) === 'ACCESSORIES') {
      return total + toAmount(row.localamount);
    }

    return total;
  }, 0);
}

function calculateVasRevenue(transactions) {
  return transactions.reduce((total, row) => {
    if (normalizeText(row.kpi_group) === 'VAS') {
      return total + toAmount(row.localamount);
    }

    return total;
  }, 0);
}

function calculateAppleProductLineRevenue(transactions) {
  const result = {
    iphone_revenue: 0,
    ipad_revenue: 0,
    mac_revenue: 0,
    apple_watch_revenue: 0
  };

  transactions.forEach(row => {
    if (normalizeText(row.kpi_group) !== 'APPLE') return;

    const revenue = toAmount(row.localamount);

    switch (normalizeText(row.lob)) {
      case 'IPHONE':
        result.iphone_revenue += revenue;
        break;

      case 'IPAD':
        result.ipad_revenue += revenue;
        break;

      case 'MAC':
        result.mac_revenue += revenue;
        break;

      case 'APPLE WATCH':
        result.apple_watch_revenue += revenue;
        break;
    }
  });

  return result;
}

function calculateAndroidBrandRevenue(transactions) {
  const result = {
    samsung_revenue: 0,
    oppo_revenue: 0,
    xiaomi_revenue: 0,
    huawei_revenue: 0,
    infinix_revenue: 0,
    motorola_revenue: 0,
    amazfit_revenue: 0
  };

  transactions.forEach(row => {
    if (normalizeText(row.kpi_group) !== 'ANDROID') return;

    const revenue = toAmount(row.localamount);

    switch (normalizeText(row.brand_name)) {
      case 'SAMSUNG':
        result.samsung_revenue += revenue;
        break;

      case 'OPPO':
        result.oppo_revenue += revenue;
        break;

      case 'XIAOMI':
        result.xiaomi_revenue += revenue;
        break;

      case 'HUAWEI':
        result.huawei_revenue += revenue;
        break;

      case 'INFINIX':
        result.infinix_revenue += revenue;
        break;

      case 'MOTOROLA':
        result.motorola_revenue += revenue;
        break;

      case 'AMAZFIT':
        result.amazfit_revenue += revenue;
        break;
    }
  });

  return result;
}
