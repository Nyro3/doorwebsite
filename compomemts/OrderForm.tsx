"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createOrder, getMyProfile } from "../lib/orders/api";
import { SUPABASE_ENABLED } from "../lib/supabase/client";
import "./SiteForms.css";

interface CartLine {
  name: string;
  size: string;
  colorName: string;
  qty: number;
}

// نموذج "أرسل الطلب" في صفحة السلة — بيحفظ الطلب في القاعدة (الأدمن يشوفه في /admin/orders)
export default function OrderForm({ items, onSent }: { items: CartLine[]; onSent: (orderId: number) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // لو العميل مسجّل دخول: نملا بياناته تلقائيًا
  useEffect(() => {
    let cancelled = false;
    getMyProfile().then((p) => {
      if (cancelled || !p) return;
      setLoggedIn(true);
      setName((v) => v || p.fullName || "");
      setPhone((v) => v || p.phone || "");
      setAddress((v) => v || p.address || "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!SUPABASE_ENABLED) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return setError("اكتب اسمك.");
    if (phone.replace(/\D/g, "").length < 8) return setError("اكتب رقم تليفون صحيح.");

    setBusy(true);
    setError("");
    try {
      const id = await createOrder({
        customerName: name,
        phone,
        address: address || undefined,
        notes: notes || undefined,
        items: items.map((i) => ({ name: i.name, size: i.size, colorName: i.colorName, qty: i.qty })),
      });
      onSent(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="sf" dir="rtl" onSubmit={handleSubmit}>
      <h3 className="sf__title">أرسل طلبك لنا</h3>
      {!loggedIn && (
        <p className="sf__hint">
          تقدر تبعت الطلب من غير حساب، أو <Link href="/account">سجّل دخول / أنشئ حساب</Link> عشان بياناتك تتملي لوحدها.
        </p>
      )}

      <label className="sf__label" htmlFor="of-name">
        الاسم
      </label>
      <input id="of-name" className="sf__input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

      <label className="sf__label" htmlFor="of-phone">
        رقم التليفون
      </label>
      <input
        id="of-phone"
        className="sf__input"
        type="tel"
        dir="ltr"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
      />

      <label className="sf__label" htmlFor="of-address">
        العنوان (اختياري)
      </label>
      <input
        id="of-address"
        className="sf__input"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        autoComplete="street-address"
      />

      <label className="sf__label" htmlFor="of-notes">
        ملاحظات (اختياري)
      </label>
      <textarea id="of-notes" className="sf__input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && (
        <p className="sf__msg sf__msg--err" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="sf__btn" disabled={busy}>
        {busy ? "جاري الإرسال..." : "إرسال الطلب"}
      </button>
    </form>
  );
}
