"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IS_LOCAL_MODE } from "../lib/products/api";
import { listAccounts } from "../lib/orders/api";
import type { Account, AccountRole } from "../lib/orders/types";

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("ar-EG", { dateStyle: "medium" });

const ROLE_LABEL: Record<AccountRole, string> = { guest: "زائر", customer: "عميل", admin: "أدمن" };
const ROLE_TABS: AccountRole[] = ["customer", "guest", "admin"];

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<AccountRole | "all">("all");

  const load = useCallback(async () => {
    try {
      setAccounts(await listAccounts());
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!IS_LOCAL_MODE) void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: accounts.length };
    for (const a of accounts) c[a.role] = (c[a.role] ?? 0) + 1;
    return c;
  }, [accounts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter(
      (a) =>
        (role === "all" || a.role === role) &&
        (q === "" ||
          a.email.toLowerCase().includes(q) ||
          (a.fullName ?? "").toLowerCase().includes(q) ||
          (a.phone ?? "").includes(q)),
    );
  }, [accounts, query, role]);

  if (IS_LOCAL_MODE) {
    return (
      <div className="ap" dir="rtl">
        <p className="ap__msg ap__msg--err">الحسابات محتاجة ربط Supabase (ضيف المتغيرات في .env.local).</p>
      </div>
    );
  }

  return (
    <div className="ap" dir="rtl">
      <header className="ap__head">
        <h1 className="ap__title">الحسابات ({accounts.length})</h1>
        <button type="button" className="ap__btn ap__btn--light" onClick={() => void load()}>
          تحديث
        </button>
      </header>

      {state === "error" && (
        <p className="ap__msg ap__msg--err" role="alert">
          {error}
        </p>
      )}

      <div className="ap__tools">
        <div className="ap__tabs" role="tablist" aria-label="فلترة بنوع الحساب">
          <button type="button" className={role === "all" ? "ap__tab ap__tab--on" : "ap__tab"} onClick={() => setRole("all")}>
            الكل ({counts.all})
          </button>
          {ROLE_TABS.map((r) => (
            <button
              key={r}
              type="button"
              className={role === r ? "ap__tab ap__tab--on" : "ap__tab"}
              onClick={() => setRole(r)}
            >
              {ROLE_LABEL[r]} ({counts[r] ?? 0})
            </button>
          ))}
        </div>
        <input
          className="ap__input ap__search"
          type="search"
          placeholder="ابحث بالاسم أو الإيميل أو التليفون"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {state === "loading" && <p>جاري التحميل...</p>}
      {state === "ready" && visible.length === 0 && <p>لا توجد حسابات هنا.</p>}

      {visible.length > 0 && (
        <div className="ap__scroll">
          <table className="ap__table ap__table--wide">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التليفون</th>
                <th>الإيميل</th>
                <th>العنوان</th>
                <th>النوع</th>
                <th>الطلبات</th>
                <th>تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>{a.fullName || "—"}</td>
                  <td dir="ltr">{a.phone ? <a href={`tel:${a.phone}`}>{a.phone}</a> : "—"}</td>
                  <td dir="ltr">{a.email || "—"}</td>
                  <td>{a.address || "—"}</td>
                  <td>
                    <span className={a.role === "admin" ? "ap__badge ap__badge--admin" : "ap__badge"}>
                      {ROLE_LABEL[a.role]}
                    </span>
                  </td>
                  <td>{a.ordersCount}</td>
                  <td>{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="ap__small ap__hint">
        الزائر بيدخل برقمه فقط (من غير تحقق)، فلو نفس الرقم دخل من جهازين هيظهر مرتين. لترقية حساب لأدمن شغّل في Supabase SQL
        Editor: <code dir="ltr">update profiles set role = &apos;admin&apos; where email = &apos;user@example.com&apos;;</code>
      </p>
    </div>
  );
}
