export default function apiFetch(path, options = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const prefix = base ? base.replace(/\/$/, '') : '';
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(prefix + urlPath, options);
}

/**
 * Fetch JSON data from the API and throw an error if the response is not OK.
 *
 * @param {string} path - API endpoint path
 * @param {RequestInit} [options] - fetch options
 * @returns {Promise<any>} - parsed JSON body
 */
export async function fetchJson(path, options = {}) {
  const res = await apiFetch(path, options);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid JSON response');
  }
  if (!res.ok) {
    throw new Error(data.detail || res.statusText);
  }
  return data;
}
