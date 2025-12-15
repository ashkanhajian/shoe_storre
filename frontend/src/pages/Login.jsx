import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { setTokens } = useAuth();

  const from = loc.state?.from || "/my-orders";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);

    if (!username || !password) {
      toast.error("نام کاربری و رمز عبور را وارد کنید");
      return;
    }

    setBusy(true);
    toast.loading("در حال ورود...", { id: "login" });

    try {
      const r = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await r.text();
      if (!r.ok) throw new Error(text);

      const data = JSON.parse(text); // {access, refresh}
      if (!data.access || !data.refresh) {
        throw new Error("Invalid token response");
      }

      setTokens(data);
      toast.success("با موفقیت وارد شدید", { id: "login" });
      nav(from, { replace: true });
    } catch (e2) {
      const msg = String(e2?.message || e2);
      setErr(msg);
      toast.error("ورود ناموفق بود", { id: "login" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <h2>ورود</h2>

      {err && (
        <pre
          style={{
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

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <button
          disabled={busy}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: busy ? "#777" : "#000",
            color: "#fff",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {busy ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
        حساب نداری؟ <Link to="/register">ثبت‌نام</Link>
      </div>
    </div>
  );
}
