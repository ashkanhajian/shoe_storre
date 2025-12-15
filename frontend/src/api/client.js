// src/api/client.js
function getAccess() {
  return localStorage.getItem("access") || "";
}

function getRefresh() {
  return localStorage.getItem("refresh") || "";
}

function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

async function refreshAccessToken() {
  const refresh = getRefresh();
  if (!refresh) return null;

  const r = await fetch("/api/auth/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!r.ok) return null;

  const data = await r.json(); // {access}
  if (!data?.access) return null;

  setTokens({ access: data.access });
  return data.access;
}

/**
 * apiFetch:
 * - Authorization را اگر access موجود باشد می‌زند
 * - اگر 401 گرفت، یک بار refresh می‌کند و همان درخواست را retry می‌کند
 * - خروجی را JSON می‌کند (یا متن)
 */
export async function apiFetch(path, options = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };

  // content-type پیش‌فرض برای body JSON
  if (opts.body && !opts.headers["Content-Type"]) {
    opts.headers["Content-Type"] = "application/json";
  }

  const access = getAccess();
  if (access) {
    opts.headers.Authorization = `Bearer ${access}`;
  }

  let r = await fetch(path, opts);

  // اگر توکن منقضی شد، یک بار refresh و retry
  if (r.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      const retryOpts = { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${newAccess}` } };
      r = await fetch(path, retryOpts);
    }
  }

  // تلاش برای JSON
  const text = await r.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!r.ok) {
    const msg =
      typeof data === "string"
        ? data
        : data?.detail || JSON.stringify(data) || `HTTP ${r.status}`;
    const err = new Error(msg);
    err.status = r.status;
    err.data = data;
    throw err;
  }

  return data;
}
