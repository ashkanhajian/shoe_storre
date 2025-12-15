import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import MockPay from "./pages/MockPay.jsx";
import { useCart } from "./cart/CartContext.jsx";

export default function App() {
  const { items } = useCart();

  const [products, setProducts] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products/")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        setProducts(data);
        setErr(null);
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #eee",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Shoe Store</div>
        </Link>

        <nav style={{ display: "flex", gap: 16 }}>
          <Link to="/">محصولات</Link>
          <Link to="/cart">سبد خرید ({cartCount})</Link>
        </nav>
      </div>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: 24 }}>
              {loading && <p>Loading products...</p>}
              {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {products.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      {p.thumbnail && (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <h3>{p.title}</h3>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {p.brand} • {p.category}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          }
        />

        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/pay/mock" element={<MockPay />} />

        <Route
          path="*"
          element={
            <div style={{ padding: 24 }}>
              <h2>صفحه پیدا نشد</h2>
              <Link to="/">بازگشت</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
