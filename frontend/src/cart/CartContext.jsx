import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function addItem(variant, product) {
    setItems((prev) => {
      const found = prev.find((i) => i.variantId === variant.id);
      if (found) {
        return prev.map((i) =>
          i.variantId === variant.id
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          sku: variant.sku,
          title: product.title,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          qty: 1,
        },
      ];
    });
  }

  function removeItem(variantId) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function changeQty(variantId, qty) {
    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId ? { ...i, qty } : i
      )
    );
  }

function clear() {
  setItems((prev) => (prev.length === 0 ? prev : []));
}

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, changeQty, clear, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
