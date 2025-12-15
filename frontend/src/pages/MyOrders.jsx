import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { apiFetch } from "../api/client.js";

export default function MyOrders() {
  const { access } = useAuth();
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
  apiFetch("/api/orders/my/")
    .then((data) => {
      setOrders(data);
      setErr(null);
    })
    .catch((e) => setErr(String(e?.message || e)))
    .finally(() => setLoading(false));
}, []);


  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h2>سفارش‌های من</h2>

      {loading && <p>Loading...</p>}
      {err && (
        <pre style={{ whiteSpace: "pre-wrap", background: "#f8d7da", padding: 12, borderRadius: 10 }}>
          {err}
        </pre>
      )}

      {!loading && !err && orders.length === 0 && <p>هنوز سفارشی ندارید.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {orders.map((o) => (
          <div key={o.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <strong>Order #{o.id}</strong>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  status: {o.status} • {new Date(o.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>total</div>
                <div style={{ fontWeight: 800 }}>{Number(o.total_amount).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {o.items?.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {it.title} — {it.sku} — سایز {it.size} — رنگ {it.color} × {it.quantity}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    {Number(it.line_total).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
