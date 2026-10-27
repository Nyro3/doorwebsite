"use client";

import { useState } from "react";
import Link from "next/link";
import { clearCart, removeFromCart, setQty, useCart } from "../lib/cart/cartStore";
import { CATEGORIES } from "../lib/products/categories";
import { PHONES, waLink } from "../lib/contact";
import OrderForm from "./OrderForm";

export default function CartView() {
  const { items, count } = useCart();
  const [orderId, setOrderId] = useState<number | null>(null);

  // بعد إرسال الطلب بنجاح
  if (orderId !== null) {
    return (
      <div className="cart__empty">
        <p>✅ تم استلام طلبك (رقم {orderId}). هنتواصل معاك قريبًا.</p>
        <div className="cart__links">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={c.href} className="shop__btn shop__btn--light">
              {c.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart__empty">
        <p>السلة فاضية.</p>
        <div className="cart__links">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={c.href} className="shop__btn shop__btn--light">
              {c.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // رسالة واتساب جاهزة بالطلب (بديل لإرسال الطلب من الموقع)
  const message = [
    "السلام عليكم، عايز عرض سعر للطلبات دي:",
    "",
    ...items.map(
      (i) => `• ${i.name} | المقاس: ${i.size} | اللون: ${i.colorName} | الكمية: ${i.qty}`,
    ),
  ].join("\n");

  return (
    <div className="cart">
      <ul className="cart__list">
        {items.map((item) => (
          <li key={item.key} className="cart__item">
            {item.image ? (
              <img src={item.image} alt={item.name} className="cart__thumb" />
            ) : (
              <div className="cart__thumb cart__thumb--empty" aria-hidden />
            )}

            <div className="cart__info">
              <h3 className="cart__name">{item.name}</h3>
              <p className="cart__meta">
                المقاس: <span dir="ltr">{item.size}</span>
              </p>
              <p className="cart__meta">
                اللون:{" "}
                <span className="cart__dot" style={{ backgroundColor: item.colorHex }} aria-hidden />{" "}
                {item.colorName}
              </p>
            </div>

            <div className="cart__qty" role="group" aria-label={`كمية ${item.name}`}>
              <button type="button" onClick={() => setQty(item.key, item.qty + 1)} aria-label="زيادة">
                +
              </button>
              <span>{item.qty}</span>
              <button type="button" onClick={() => setQty(item.key, item.qty - 1)} aria-label="نقص">
                −
              </button>
            </div>

            <button type="button" className="cart__remove" onClick={() => removeFromCart(item.key)}>
              حذف
            </button>
          </li>
        ))}
      </ul>

      <div className="cart__footer">
        <p className="cart__total">إجمالي القطع: {count}</p>
        <div className="cart__actions">
          <a
            className="shop__btn"
            href={waLink(PHONES[0], message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            اطلب عرض سعر عبر واتساب
          </a>
          <button type="button" className="shop__btn shop__btn--light" onClick={clearCart}>
            تفريغ السلة
          </button>
        </div>
      </div>

      <OrderForm
        items={items}
        onSent={(id) => {
          clearCart();
          setOrderId(id);
        }}
      />
    </div>
  );
}
