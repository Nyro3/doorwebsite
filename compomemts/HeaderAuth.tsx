"use client";

import Link from "next/link";
import { signOut } from "../lib/auth/api";
import { useMyProfile } from "../lib/auth/useMyProfile";
import { SUPABASE_ENABLED } from "../lib/supabase/client";

// منطقة الحساب في الـ header:
//   مش مسجّل  → "تسجيل الدخول"
//   زائر      → الرقم + تسجيل الخروج
//   عميل/أدمن → الاسم (أو الإيميل) + تسجيل الخروج  (والأدمن يظهر له رابط لوحة التحكم)
export default function HeaderAuth() {
  const { profile, loading } = useMyProfile();

  if (!SUPABASE_ENABLED || loading) return null;

  if (!profile) {
    return (
      <div className="account">
        <Link href="/#access" className="link account__login">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  const label =
    profile.role === "guest"
      ? profile.phone || "زائر"
      : profile.fullName || profile.email || profile.phone || "حسابي";

  return (
    <div className="account">
      {profile.role === "admin" && (
        <Link href="/admin" className="link">
          لوحة التحكم
        </Link>
      )}
      <Link href="/account" className="account__name" title={label}>
        <span aria-hidden="true">👤</span>
        <span dir="auto" className="account__label">
          {label}
        </span>
      </Link>
      <button type="button" className="account__logout" onClick={() => void signOut()}>
        تسجيل الخروج
      </button>
    </div>
  );
}
