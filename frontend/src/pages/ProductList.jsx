import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api";

export default function ProductList() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchProducts().then(setItems).catch((e) => setErr(String(e)));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Shoe Store</h1>
      {err && <pre>{err}</pre>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              {p.thumbnail && (
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6 }}
                />
              )}
              <h3 style={{ margin: "10px 0 6px" }}>{p.title}</h3>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {p.brand} • {p.category}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
