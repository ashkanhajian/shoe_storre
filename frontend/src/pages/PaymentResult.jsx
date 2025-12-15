import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { apiFetch } from "../api/client.js";
import { useCart } from "../cart/CartContext.jsx";

export default function PaymentResult() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { clear } = useCart();

  const authority = sp.get("authority") || "";
  const statusParam = sp.get("status") || "ok"; // ok | fail

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);

  // جلوگیری از اجرای چندباره verify (مثلاً به‌خاطر re-render یا StrictMode)
  const ran = useRef(false);

  useEffect(() => {
    // فقط یک بار اجرا شود
    if (ran.current) return;
    ran.current = true;

    if (!authority) {
      setErr("authority یافت نشد.");
      setLoading(false);
      toast.error("authority یافت نشد", { id: "payresult" });
      return;
    }

    setLoading(true);
    setErr(null);
    setRes(null);

    toast.loading("در حال بررسی پرداخت...", { id: "payresult" });

    const url = `/api/payments/mock-return/?authority=${encodeURIComponent(
      authority
    )}&status=${encodeURIComponent(statusParam)}`;

    apiFetch(url)
      .then((data) => {
        setRes(data);
        setErr(null);

        if (data?.ok) {
          // خالی کردن سبد فقط در پرداخت موفق
          // (پیشنهاد: clear در CartContext طوری باشد که اگر خالی بود دوباره set نکند)
          clear();
          toast.success("پرداخت موفق بود. سبد خرید خالی شد.", { id: "payresult" });
        } else {
          toast.error("پرداخت ناموفق بود. سبد خرید حفظ شد.", { id: "payresult" });
        }
      })
      .catch((e) => {
        const msg = String(e?.message || e);
        setErr(msg);
        toast.error("خطا در بررسی پرداخت", { id: "payresult" });
      })
      .finally(() => setLoading(false));
  }, [authority, statusParam]); // clear را عمداً dependency نذاشتیم

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700, margin: "0 auto" }}>
      <h2>نتیجه پرداخت</h2>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        authority: {authority || "—"} | status: {statusParam}
      </div>

      {loading && <p style={{ marginTop: 12 }}>در حال بررسی...</p>}

      {err && (
        <pre
          style={{
            marginTop: 12,
            whiteSpace: "pre-wrap",
            background: "#f8d7da",
            border: "1px solid #f5c2c7",
            padding: 12,
            borderRadius: 10,
          }}
        >
          {err}
        </pre>
      )}

      {!loading && !err && res && (
        <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          {res.ok ? (
            <>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>پرداخت موفق</div>
              <div>
                شماره سفارش: <strong>{res.order_id}</strong>
              </div>
              <div>
                Ref ID: <strong>{res.ref_id}</strong>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  onClick={() => nav("/my-orders")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#000",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  مشاهده سفارش‌ها
                </button>
                <Link to="/">بازگشت به فروشگاه</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>پرداخت ناموفق</div>
              <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <Link to="/cart">بازگشت به سبد خرید</Link>
                <Link to="/">بازگشت به فروشگاه</Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
