import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";

export default function Cart() {
  const { items, removeItem, changeQty, total, clear } = useCart();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState(null);

  async function handleCheckout() {
    setErr(null);
    setInfo(null);

    if (items.length === 0) {
      setErr("سبد خرید خالی است.");
      return;
    }

    setBusy(true);
    try {
      // 1) ساخت سفارش
      const orderPayload = {
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      };

      const orderResp = await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderText = await orderResp.text();
      if (!orderResp.ok) {
        throw new Error(`Order failed: HTTP ${orderResp.status}\n${orderText}`);
      }

      const orderData = JSON.parse(orderText);
      // انتظار: { order_id, total }
      setInfo(`Order created. order_id=${orderData.order_id} total=${orderData.total}`);

      // 2) initiate payment
      const payResp = await fetch("/api/payments/initiate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderData.order_id }),
      });

      const payText = await payResp.text();
      if (!payResp.ok) {
        throw new Error(`Payment initiate failed: HTTP ${payResp.status}\n${payText}`);
      }

      const payData = JSON.parse(payText);
      // انتظار: { payment_url, authority, transaction_id }
      if (!payData.payment_url) {
        throw new Error(`Payment initiate returned no payment_url:\n${payText}`);
      }

      // 3) رفتن به درگاه mock
      window.location.href = payData.payment_url;
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h2>سبد خرید خالی است</h2>
        <Link to="/">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>سبد خرید</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={clear} disabled={busy} style={{ padding: "8px 12px" }}>
            خالی کردن سبد
          </button>
          <Link to="/">ادامه خرید</Link>
        </div>
      </div>

      {err && (
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #f5c2c7",
            background: "#f8d7da",
            borderRadius: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </pre>
      )}

      {info && (
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #b6d4fe",
            background: "#cfe2ff",
            borderRadius: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {info}
        </pre>
      )}

      <div style={{ marginTop: 16 }}>
        {items.map((i) => (
          <div
            key={i.variantId}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 160px 44px",
              gap: 10,
              alignItems: "center",
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{i.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                SKU: {i.sku} • سایز {i.size} • رنگ {i.color}
              </div>
            </div>

            <input
              type="number"
              min="1"
              value={i.qty}
              disabled={busy}
              onChange={(e) => {
                const q = Number(e.target.value);
                if (Number.isFinite(q) && q >= 1) changeQty(i.variantId, q);
              }}
              style={{ padding: 8 }}
            />

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>مبلغ</div>
              <div style={{ fontWeight: 700 }}>{(i.price * i.qty).toLocaleString()}</div>
            </div>

            <button
              onClick={() => removeItem(i.variantId)}
              disabled={busy}
              title="حذف"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{items.length} آیتم</div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>جمع کل</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{total.toLocaleString()}</div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={busy}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 16px",
          borderRadius: 10,
          border: "none",
          background: busy ? "#777" : "#000",
          color: "#fff",
          fontWeight: 700,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "در حال انجام..." : "ثبت سفارش و رفتن به پرداخت"}
      </button>
    </div>
  );
}
