import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);

    if (!username || !password) {
      toast.error("نام کاربری و رمز عبور الزامی است");
      return;
    }
    if (password.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setBusy(true);
    toast.loading("در حال ثبت‌نام...", { id: "register" });

    try {
      const r = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await r.text();
      if (!r.ok) throw new Error(text);

      toast.success("ثبت‌نام انجام شد. وارد شوید.", { id: "register" });
      nav("/login", { replace: true });
    } catch (e2) {
      const msg = String(e2?.message || e2);
      setErr(msg);
      toast.error("ثبت‌نام ناموفق بود", { id: "register" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <h2>ثبت‌نام</h2>

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
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <input
          placeholder="email (اختیاری)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {busy ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>
      </form>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
        حساب داری؟ <Link to="/login">ورود</Link>
      </div>
    </div>
  );
}
