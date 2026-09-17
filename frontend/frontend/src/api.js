const API_BASE = 'https://script.google.com/macros/s/AKfycbw178DxdVj5OVuAow1UO9iKpjdTUw05Cwj5hre-gK_sJzPdJVXO-gk8DNriNGAuvnGX/exec';

export async function fetchAPI(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${API_BASE}?${query}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'API error');
  return data.data;
}

export const api = {
  health: () => fetchAPI('health'),
  kpi: () => fetchAPI('kpi'),
  stores: (page = 1, pageSize = 50) => fetchAPI('stores', { page, page_size: pageSize }),
  storeTargets: (page = 1, pageSize = 50) => fetchAPI('store-targets', { page, page_size: pageSize }),
  staffTargets: (page = 1, pageSize = 50) => fetchAPI('staff-targets', { page, page_size: pageSize }),
  storeTransactions: (page = 1, pageSize = 50) => fetchAPI('store-transactions', { page, page_size: pageSize }),
  staffTransactions: (page = 1, pageSize = 50) => fetchAPI('staff-transactions', { page, page_size: pageSize }),
};
