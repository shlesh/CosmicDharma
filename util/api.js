export default function apiFetch(path, options = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const prefix = base ? base.replace(/\/$/, '') : '';
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(prefix + urlPath, options);
}
