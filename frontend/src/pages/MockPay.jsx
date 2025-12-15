import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function MockPay() {
  const [sp] = useSearchParams();
  const authority = sp.get("authority") || "";
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!authority) setMsg("authority یافت نشد.");
  }, [authority]);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700, margin: "0 auto" }}>
      <h2>درگاه پرداخت (Mock)</h2>
      <div style={{ opacity: 0.7, fontSize: 12 }}>authority: {authority || "—"}</div>

      <p style={{ marginTop: 16 }}>
        این صفحه شبیه‌سازی درگاه است. یکی از گزینه‌ها را انتخاب کن:
      </p>

      {msg && <pre style={{ whiteSpace: "pre-wrap" }}>{msg}</pre>}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          style={{ padding: "10px 14px" }}
          disabled={!authority}
          onClick={() => {
            window.location.href = `/api/payments/mock-return/?authority=${encodeURIComponent(
              authority
            )}&status=ok`;
          }}
        >
          پرداخت موفق
        </button>

        <button
          style={{ padding: "10px 14px" }}
          disabled={!authority}
          onClick={() => {
            window.location.href = `/api/payments/mock-return/?authority=${encodeURIComponent(
              authority
            )}&status=fail`;
          }}
        >
          پرداخت ناموفق
        </button>

        <Link to="/" style={{ alignSelf: "center" }}>
          بازگشت
        </Link>
      </div>

      <p style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
        بعداً این صفحه را با ریدایرکت واقعی به درگاه (زرین‌پال/…) جایگزین می‌کنیم.
      </p>
    </div>
  );
}
