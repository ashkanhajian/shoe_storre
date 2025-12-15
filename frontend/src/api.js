export const API_BASE = "http://localhost:8000/api";

export async function fetchProducts() {
  const r = await fetch(`${API_BASE}/products/`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchProductBySlug(slug) {
  const r = await fetch(`${API_BASE}/products/${slug}/`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
