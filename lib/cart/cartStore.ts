"use client";

// سلة بسيطة محفوظة في localStorage، من غير Provider — أي كومبوننت يقدر يستخدم useCart()
// (من غير ما نحتاج نعدّل layout.tsx).

import { useSyncExternalStore } from "react";

export interface CartItem {
  key: string; // productId|size|color — نفس المنتج بنفس الاختيارات بيتجمّع في سطر واحد
  productId: string;
  name: string;
  image?: string;
  size: string;
  colorName: string;
  colorHex: string;
  qty: number;
}

export type NewCartItem = Omit<CartItem, "key" | "qty">;

const STORAGE_KEY = "alsalam:cart:v1";
const EMPTY: CartItem[] = []; // مرجع ثابت (مهم لـ useSyncExternalStore)

let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };
const listeners = new Set<() => void>();

function read(): CartItem[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cache.items; // التخزين مش متاح — نكمل على الذاكرة
  }
  if (raw === cache.raw) return cache.items;

  let items = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed as CartItem[];
  } catch {
    // بيانات بايظة — نبدأ سلة فاضية
  }
  cache = { raw, items };
  return items;
}

function write(items: CartItem[]): void {
  const raw = JSON.stringify(items);
  cache = { raw, items };
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // مش مشكلة: السلة هتفضل شغالة في الذاكرة لحد ما الصفحة تتقفل
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // تحديث بين التابات
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function addToCart(item: NewCartItem): void {
  const key = `${item.productId}|${item.size}|${item.colorName}`;
  const items = read();
  const exists = items.some((i) => i.key === key);
  write(
    exists
      ? items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      : [...items, { ...item, key, qty: 1 }],
  );
}

export function setQty(key: string, qty: number): void {
  if (qty < 1) return removeFromCart(key);
  write(read().map((i) => (i.key === key ? { ...i, qty } : i)));
}

export function removeFromCart(key: string): void {
  write(read().filter((i) => i.key !== key));
}

export function clearCart(): void {
  write([]);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  return { items, count };
}
