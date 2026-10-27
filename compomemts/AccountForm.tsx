"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { SUPABASE_ENABLED } from "../lib/supabase/client";
import { signInCustomer, signInGuest, signOut, signUpCustomer } from "../lib/auth/api";
import { useMyProfile } from "../lib/auth/useMyProfile";
import "./SiteForms.css";

type Mode = "guest" | "signup" | "login";

const ROLE_LABEL = { guest: "زائر", customer: "عميل", admin: "أدمن" } as const;

// بوابة الدخول: زائر بالرقم فقط / عميل جديد بالإيميل / عميل راجع.
// مكانها الرئيسي في الصفحة الرئيسية، وكمان بتتعرض في /account.
export default function AccountForm() {
  const { profile, loading } = useMyProfile();
  const [mode, setMode] = useState<Mode>("guest");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!SUPABASE_ENABLED) {
    return (
      <p className="sf__msg sf__msg--err" dir="rtl">
        تسجيل الدخول لسه مش متفعّل على الموقع.
      </p>
    );
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setInfo("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "guest") {
        await signInGuest(phone, fullName);
      } else if (mode === "login") {
        await signInCustomer(email, password);
      } else {
        const { needsConfirmation } = await signUpCustomer({ fullName, phone, email, password });
        if (needsConfirmation) {
          setInfo("تم إنشاء الحساب. افتح إيميلك واضغط على رابط التأكيد، وبعدها سجّل دخول.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p dir="rtl" id="access">
        جاري التحميل...
      </p>
    );
  }

  // ---------- مسجّل دخول ----------
  if (profile) {
    return (
      <div className="sf" dir="rtl" id="access">
        <h2 className="sf__title">أهلًا {profile.fullName || "بيك"} 👋</h2>
        <p className="sf__hint">
          <span className="sf__badge">{ROLE_LABEL[profile.role]}</span>{" "}
          <span dir="ltr">{profile.email || profile.phone}</span>
        </p>
        {profile.role === "guest" && (
          <p className="sf__hint">
            دخولك كزائر مرتبط بالجهاز ده. لو عايز حساب تدخل بيه من أي جهاز، سجّل خروج وأنشئ حساب عميل.
          </p>
        )}
        {profile.role === "admin" && (
          <p>
            <Link href="/admin">الذهاب للوحة التحكم</Link>
          </p>
        )}
        <div className="sf__row">
          <Link href="/doors/wood" className="sf__btn sf__btn--light">
            تصفح المنتجات
          </Link>
          <button type="button" className="sf__btn sf__btn--light" onClick={() => void signOut()}>
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // ---------- مش مسجّل ----------
  return (
    <form className="sf" dir="rtl" id="access" onSubmit={handleSubmit}>
      <div className="sf__tabs" role="tablist" aria-label="طريقة الدخول">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "guest"}
          className={mode === "guest" ? "sf__tab sf__tab--on" : "sf__tab"}
          onClick={() => switchMode("guest")}
        >
          زائر
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "sf__tab sf__tab--on" : "sf__tab"}
          onClick={() => switchMode("signup")}
        >
          حساب جديد
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={mode === "login" ? "sf__tab sf__tab--on" : "sf__tab"}
          onClick={() => switchMode("login")}
        >
          دخول
        </button>
      </div>

      {mode === "guest" && (
        <p className="sf__hint">ادخل برقم تليفونك بس، من غير إيميل ولا باسورد، وابدأ اطلب.</p>
      )}

      {(mode === "guest" || mode === "signup") && (
        <>
          <label className="sf__label" htmlFor="ac-phone">
            رقم التليفون
          </label>
          <input
            id="ac-phone"
            className="sf__input"
            type="tel"
            dir="ltr"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />

          <label className="sf__label" htmlFor="ac-name">
            الاسم {mode === "guest" && "(اختياري)"}
          </label>
          <input
            id="ac-name"
            className="sf__input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required={mode === "signup"}
          />
        </>
      )}

      {(mode === "signup" || mode === "login") && (
        <>
          <label className="sf__label" htmlFor="ac-email">
            الإيميل
          </label>
          <input
            id="ac-email"
            className="sf__input"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="sf__label" htmlFor="ac-pass">
            الباسورد {mode === "signup" && "(8 حروف على الأقل)"}
          </label>
          <input
            id="ac-pass"
            className="sf__input"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
          />
        </>
      )}

      {error && (
        <p className="sf__msg sf__msg--err" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="sf__msg sf__msg--ok" role="status">
          {info}
        </p>
      )}

      <button type="submit" className="sf__btn" disabled={busy}>
        {busy ? "لحظة..." : mode === "guest" ? "ادخل كزائر" : mode === "signup" ? "إنشاء الحساب" : "دخول"}
      </button>
    </form>
  );
}
