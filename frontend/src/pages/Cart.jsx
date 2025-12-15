import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useCart } from "../cart/CartContext.jsx";
import { apiFetch } from "../api/client.js";

export default function Cart() {
  const { items, removeItem, changeQty, total, clear } = useCart();

  const [busy, setBusy] = useState(false);

  async function handleCheckout() {
    if (items.length === 0) {
      toast.error("سبد خرید خالی است");
      return;
    }

    setBusy(true);
    toast.loading("در حال ثبت سفارش...", { id: "checkout" });

    try {
      // 1) Create order (backend validates stock & price)
      const orderPayload = {
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      };

      const orderRes = await apiFetch("/api/orders/", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      // انتظار: { order_id, total }
      toast.success(`سفارش ثبت شد (شماره: ${orderRes.order_id})`, { id: "checkout" });

      // 2) Initiate payment (mock gateway)
      toast.loading("انتقال به درگاه...", { id: "checkout" });

      const payRes = await apiFetch("/api/payments/initiate/", {
        method: "POST",
        body: JSON.stringify({ order_id: orderRes.order_id }),
      });

      if (!payRes?.payment_url) {
        throw new Error("payment_url در پاسخ وجود ندارد");
      }

      toast.success("در حال انتقال...", { id: "checkout" });

      // NOTE: سبد را اینجا خالی نکن؛ بهتر است بعد از پرداخت موفق خالی شود.
      // clear();

      window.location.href = payRes.payment_url;
    } catch (e) {
      const msg = String(e?.message || e);
      toast.error(msg, { id: "checkout" });
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
          <button
            onClick={() => {
              if (busy) return;
              clear();
              toast.success("سبد خرید خالی شد");
            }}
            disabled={busy}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            خالی کردن سبد
          </button>

          <Link to="/">ادامه خرید</Link>
        </div>
      </div>

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
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>مبلغ</div>
              <div style={{ fontWeight: 800 }}>{(i.price * i.qty).toLocaleString()}</div>
            </div>

            <button
              onClick={() => {
                if (busy) return;
                removeItem(i.variantId);
                toast.success("از سبد حذف شد");
              }}
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
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {items.length} آیتم
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>جمع کل</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{total.toLocaleString()}</div>
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
          fontWeight: 800,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "در حال انجام..." : "ثبت سفارش و رفتن به پرداخت"}
      </button>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        نکته: سبد خرید بعد از پرداخت موفق خالی می‌شود (مرحله بعدی UX).
      </div>
    </div>
  );
}
