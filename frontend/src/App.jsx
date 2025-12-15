import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import MockPay from "./pages/MockPay.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyOrders from "./pages/MyOrders.jsx";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { useCart } from "./cart/CartContext.jsx";
import { useAuth } from "./auth/AuthContext.jsx";

import Skeleton from "./ui/Skeleton.jsx";

export default function App() {
  const { items } = useCart();
  const { user, logout } = useAuth();

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
<header
  style={{
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10,
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

        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link to="/">محصولات</Link>
          <Link to="/cart">سبد خرید ({cartCount})</Link>

          {user ? (
            <>
              <Link to="/my-orders">سفارش‌های من</Link>
              <button
                onClick={logout}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                خروج ({user.username})
              </button>
            </>
          ) : (
            <>
              <Link to="/login">ورود</Link>
              <Link to="/register">ثبت‌نام</Link>
            </>
          )}
        </nav>
      </header>

      {/* Routes */}
      <Routes>
        {/* Home / Product List */}
        <Route
          path="/"
          element={
            <div style={{ padding: 24 }}>
              {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

              {loading && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                  }}
                >
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
                    >
                      <Skeleton h={180} r={8} />
                      <div style={{ marginTop: 10 }}>
                        <Skeleton h={16} w="70%" />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Skeleton h={12} w="45%" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !err && products.length === 0 && <p>هیچ محصولی پیدا نشد.</p>}

              {!loading && !err && products.length > 0 && (
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
                      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
                        {p.thumbnail ? (
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
                        ) : (
                          <div style={{ width: "100%", height: 180 }}>
                            <Skeleton h={180} r={8} />
                          </div>
                        )}

                        <h3 style={{ margin: "10px 0 6px" }}>{p.title}</h3>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                          {p.brand} • {p.category}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          }
        />

        {/* Product Detail */}
        <Route path="/products/:slug" element={<ProductDetail />} />

        {/* Cart */}
        <Route path="/cart" element={<Cart />} />

        {/* Payments */}
        <Route path="/pay/mock" element={<MockPay />} />
        <Route path="/pay/result" element={<PaymentResult />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* My Orders (Protected) */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div style={{ padding: 24 }}>
              <h2>صفحه پیدا نشد</h2>
              <Link to="/">بازگشت به خانه</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
