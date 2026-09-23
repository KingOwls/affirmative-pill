"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  medicineId: string;
  name: string;
  priceCents: number;
  quantity: number;
  requiresPrescription: boolean;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  setQuantity: (medicineId: string, quantity: number) => void;
  remove: (medicineId: string) => void;
  clear: () => void;
  count: number;
  totalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("affirmative-cart");
      if (raw) setItems(JSON.parse(raw));
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("affirmative-cart", JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    add(item) {
      setItems((current) => {
        const found = current.find((x) => x.medicineId === item.medicineId);
        return found
          ? current.map((x) => x.medicineId === item.medicineId ? { ...x, quantity: x.quantity + 1 } : x)
          : [...current, { ...item, quantity: 1 }];
      });
    },
    setQuantity(medicineId, quantity) {
      setItems((current) => current.map((x) => x.medicineId === medicineId ? { ...x, quantity: Math.max(1, quantity) } : x));
    },
    remove(medicineId) { setItems((current) => current.filter((x) => x.medicineId !== medicineId)); },
    clear() { setItems([]); },
    count: items.reduce((sum, x) => sum + x.quantity, 0),
    totalCents: items.reduce((sum, x) => sum + x.quantity * x.priceCents, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
