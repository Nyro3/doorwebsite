"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IS_LOCAL_MODE } from "../lib/products/api";
import { getSupabase } from "../lib/supabase/client";
import "./AdminPages.css";

const NAV = [
  { href: "/admin", label: "المنتجات" },
  { href: "/orders", label: "الطلبات" },
  { href: "/accounts", label: "الحسابات" },
];

// بيحمي كل صفحات الأدمن: لازم تسجيل دخول + الحساب دوره admin في جدول profiles.
// الاستخدام:  <AdminGate><AdminPanel /></AdminGate>
export default function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // undefined = لسه بنتحقق، null = مش مسجّل دخول
  const [userId, setUserId] = useState<string | null | undefined>(IS_LOCAL_MODE ? null : undefined);
  const [role, setRole] = useState<"loading" | "admin" | "other">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (IS_LOCAL_MODE) return;
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data } = sb.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (IS_LOCAL_MODE || !userId) return;
    let cancelled = false;
    setRole("loading");
    getSupabase()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRole(data?.role === "admin" ? "admin" : "other");
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("الإيميل أو الباسورد غلط.");
    setBusy(false);
  }

  // الوضع المحلي (من غير Supabase): نعرض الصفحة بس من غير نافبار
  if (IS_LOCAL_MODE) return <>{children}</>;

  if (userId === undefined || (userId && role === "loading")) {
    return (
      <p dir="rtl" className="ap__center">
        جاري التحميل...
      </p>
    );
  }

  if (userId === null) {
    return (
      <form onSubmit={handleLogin} dir="rtl" className="ap__login">
        <h1>دخول الأدمن</h1>
        <input
          className="ap__input"
          type="email"
          placeholder="الإيميل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          dir="ltr"
        />
        <input
          className="ap__input"
          type="password"
          placeholder="الباسورد"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          dir="ltr"
        />
        {error && (
          <p className="ap__msg ap__msg--err" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="ap__btn" disabled={busy}>
          {busy ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    );
  }

  if (role !== "admin") {
    return (
      <div dir="rtl" className="ap__login">
        <h1>مفيش صلاحية</h1>
        <p>الحساب ده مش حساب أدمن.</p>
        <button type="button" className="ap__btn ap__btn--light" onClick={() => getSupabase().auth.signOut()}>
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <>
      <nav dir="rtl" className="ap__nav" aria-label="تنقل لوحة التحكم">
        {NAV.map((n) => {
          const path = pathname ?? "";
          const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={active ? "ap__nav-link ap__nav-link--on" : "ap__nav-link"}>
              {n.label}
            </Link>
          );
        })}
        <button type="button" className="ap__btn ap__btn--light ap__nav-out" onClick={() => getSupabase().auth.signOut()}>
          تسجيل الخروج
        </button>
      </nav>
      {children}
    </>
  );
}
