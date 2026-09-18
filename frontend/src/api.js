const API_BASE = 'https://script.google.com/macros/s/AKfycbw178DxdVj5OVuAow1UO9iKpjdTUw05Cwj5hre-gK_sJzPdJVXO-gk8DNriNGAuvnGX/exec';

export async function fetchAPI(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  try {
    const res = await fetch(`${API_BASE}?${query}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API Error:", err);
    return { success: false, error: { message: err.message } };
  }
}
