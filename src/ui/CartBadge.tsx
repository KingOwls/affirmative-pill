"use client";

import Link from "next/link";
import { useCart } from "@/src/ui/cart";

export function CartBadge() {
  const { count } = useCart();
  return <Link className="cart-pill" href="/cart">Carrito ({count})</Link>;
}
