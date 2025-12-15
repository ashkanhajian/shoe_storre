import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useCart } from "../cart/CartContext.jsx";
import Skeleton from "../ui/Skeleton.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [p, setP] = useState(null);
  const [err, setErr] = useState(null);

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    setErr(null);
    setP(null);
    setSize("");
    setColor("");

    fetch(`/api/products/${slug}/`)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => setP(data))
      .catch((e) => setErr(String(e)));
  }, [slug]);

  const sizes = useMemo(() => {
    if (!p?.variants) return [];
    return [...new Set(p.variants.filter((v) => v.is_active).map((v) => v.size))];
  }, [p]);

  const colors = useMemo(() => {
    if (!p?.variants || !size) return [];
    return [
      ...new Set(
        p.variants
          .filter((v) => v.is_active && v.size === size)
          .map((v) => v.color)
      ),
    ];
  }, [p, size]);

  const selectedVariant = useMemo(() => {
    if (!p?.variants || !size || !color) return null;
    return p.variants.find(
      (v) => v.is_active && v.size === size && v.color === color
    );
  }, [p, size, color]);

  const inStock = selectedVariant ? (selectedVariant.quantity ?? 0) > 0 : false;

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>
        <Link to="/">بازگشت</Link>
      </div>
    );
  }

  // Skeleton loading view
  if (!p) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton w={80} h={14} />
          <Skeleton w={120} h={12} />
        </div>

        <div style={{ marginTop: 18 }}>
          <Skeleton h={26} w="55%" />
          <div style={{ marginTop: 10 }}>
            <Skeleton h={14} w="35%" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          <div>
            <Skeleton h={420} r={12} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Skeleton w={84} h={84} r={10} />
              <Skeleton w={84} h={84} r={10} />
              <Skeleton w={84} h={84} r={10} />
            </div>
          </div>

          <div>
            <Skeleton h={14} w="90%" />
            <div style={{ marginTop: 8 }}>
              <Skeleton h={14} w="85%" />
            </div>
            <div style={{ marginTop: 8 }}>
              <Skeleton h={14} w="70%" />
            </div>

            <div style={{ marginTop: 18 }}>
              <Skeleton h={12} w="20%" />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Skeleton w={60} h={34} r={8} />
                <Skeleton w={60} h={34} r={8} />
                <Skeleton w={60} h={34} r={8} />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <Skeleton h={12} w="20%" />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Skeleton w={70} h={34} r={8} />
                <Skeleton w={70} h={34} r={8} />
                <Skeleton w={70} h={34} r={8} />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <Skeleton h={60} r={12} />
            </div>

            <div style={{ marginTop: 16 }}>
              <Skeleton h={44} r={10} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = p.images?.[0]?.image_url;

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← بازگشت
        </Link>
        <div style={{ opacity: 0.7, fontSize: 12 }}>slug: {p.slug}</div>
      </div>

      <h1 style={{ marginBottom: 6 }}>{p.title}</h1>
      <div style={{ opacity: 0.7 }}>
        {p.brand} • {p.category}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <div>
          {mainImage ? (
            <img
              src={mainImage}
              alt={p.title}
              style={{ width: "100%", borderRadius: 10 }}
            />
          ) : (
            <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 24 }}>
              تصویر موجود نیست
            </div>
          )}

          {p.images?.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {p.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img.image_url}
                  alt={img.alt_text || p.title}
                  style={{
                    width: 84,
                    height: 84,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          {p.description ? (
            <p style={{ lineHeight: 1.8 }}>{p.description}</p>
          ) : (
            <p style={{ opacity: 0.7 }}>توضیحی ثبت نشده است.</p>
          )}

          {/* SIZE */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 600 }}>سایز</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setColor("");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    background: size === s ? "#000" : "#fff",
                    color: size === s ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
              {sizes.length === 0 && <div style={{ opacity: 0.7 }}>سایزی موجود نیست</div>}
            </div>
          </div>

          {/* COLOR */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 600 }}>رنگ</div>
            {!size ? (
              <div style={{ marginTop: 8, opacity: 0.7 }}>ابتدا سایز را انتخاب کنید.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      background: color === c ? "#000" : "#fff",
                      color: color === c ? "#fff" : "#000",
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
                {colors.length === 0 && <div style={{ opacity: 0.7 }}>برای این سایز رنگی موجود نیست</div>}
              </div>
            )}
          </div>

          {/* PRICE + STOCK */}
          <div style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
            <div>
              قیمت:{" "}
              <strong>
                {selectedVariant ? selectedVariant.price.toLocaleString() : "—"}
              </strong>
            </div>

            <div style={{ marginTop: 6 }}>
              موجودی:{" "}
              {selectedVariant ? (
                inStock ? (
                  <strong>{selectedVariant.quantity}</strong>
                ) : (
                  <strong>ناموجود</strong>
                )
              ) : (
                "—"
              )}
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            disabled={!selectedVariant || !inStock}
            onClick={() => {
              if (!selectedVariant || !inStock) return;
              addItem(selectedVariant, p);
              toast.success("به سبد خرید اضافه شد");
            }}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: !selectedVariant || !inStock ? "#999" : "#000",
              color: "#fff",
              cursor: !selectedVariant || !inStock ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {!selectedVariant
              ? "ابتدا سایز و رنگ را انتخاب کنید"
              : !inStock
              ? "ناموجود"
              : "افزودن به سبد خرید"}
          </button>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link to="/cart">مشاهده سبد خرید</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
