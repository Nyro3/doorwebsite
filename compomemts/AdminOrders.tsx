"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IS_LOCAL_MODE } from "../lib/products/api";
import { deleteOrder, listOrders, setOrderAdminNotes, setOrderStatus } from "../lib/orders/api";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from "../lib/orders/types";

type Message = { type: "ok" | "error"; text: string } | null;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      setOrders(await listOrders());
      setState("ready");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "حصل خطأ." });
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!IS_LOCAL_MODE) void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (q === "" || o.customerName.toLowerCase().includes(q) || o.phone.includes(q) || o.id === q),
    );
  }, [orders, filter, query]);

  async function changeStatus(o: Order, status: OrderStatus) {
    const prev = orders;
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status } : x)));
    try {
      await setOrderStatus(o.id, status);
      setMessage({ type: "ok", text: `طلب #${o.id}: ${ORDER_STATUS_LABELS[status]}` });
    } catch (err) {
      setOrders(prev);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "فشل التحديث." });
    }
  }

  async function saveNotes(o: Order) {
    const text = notes[o.id] ?? o.adminNotes ?? "";
    try {
      await setOrderAdminNotes(o.id, text);
      setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, adminNotes: text.trim() || undefined } : x)));
      setMessage({ type: "ok", text: "تم حفظ الملاحظة." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "فشل الحفظ." });
    }
  }

  async function handleDelete(o: Order) {
    if (!window.confirm(`حذف طلب #${o.id} (${o.customerName}) نهائيًا؟`)) return;
    try {
      await deleteOrder(o.id);
      setOrders((list) => list.filter((x) => x.id !== o.id));
      setMessage({ type: "ok", text: "تم حذف الطلب." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "فشل الحذف." });
    }
  }

  if (IS_LOCAL_MODE) {
    return (
      <div className="ap" dir="rtl">
        <p className="ap__msg ap__msg--err">الطلبات محتاجة ربط Supabase (ضيف المتغيرات في .env.local).</p>
      </div>
    );
  }

  return (
    <div className="ap" dir="rtl">
      <header className="ap__head">
        <h1 className="ap__title">الطلبات ({orders.length})</h1>
        <button type="button" className="ap__btn ap__btn--light" onClick={() => void load()}>
          تحديث
        </button>
      </header>

      {message && (
        <p
          className={message.type === "ok" ? "ap__msg ap__msg--ok" : "ap__msg ap__msg--err"}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      )}

      <div className="ap__tools">
        <div className="ap__tabs" role="tablist" aria-label="فلترة بالحالة">
          <button
            type="button"
            className={filter === "all" ? "ap__tab ap__tab--on" : "ap__tab"}
            onClick={() => setFilter("all")}
          >
            الكل ({counts.all})
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={filter === s ? "ap__tab ap__tab--on" : "ap__tab"}
              onClick={() => setFilter(s)}
            >
              {ORDER_STATUS_LABELS[s]} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
        <input
          className="ap__input ap__search"
          type="search"
          placeholder="ابحث بالاسم أو رقم التليفون أو رقم الطلب"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {state === "loading" && <p>جاري التحميل...</p>}
      {state === "ready" && visible.length === 0 && <p>لا توجد طلبات هنا.</p>}

      <ul className="ap__list">
        {visible.map((o) => {
          const open = openId === o.id;
          const totalQty = o.items.reduce((n, i) => n + i.qty, 0);
          return (
            <li key={o.id} className={`ap__card ap__card--${o.status}`}>
              <div className="ap__row">
                <div className="ap__main">
                  <strong>
                    #{o.id} — {o.customerName}
                  </strong>
                  <a href={`tel:${o.phone}`} dir="ltr" className="ap__phone">
                    {o.phone}
                  </a>
                  <span className="ap__small">
                    {fmtDate(o.createdAt)} · {totalQty} قطعة · {o.userId ? "عميل بحساب" : "زائر"}
                  </span>
                </div>

                <select
                  className="ap__input ap__status"
                  value={o.status}
                  onChange={(e) => void changeStatus(o, e.target.value as OrderStatus)}
                  aria-label={`حالة الطلب ${o.id}`}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>

                <button type="button" className="ap__btn ap__btn--light" onClick={() => setOpenId(open ? null : o.id)}>
                  {open ? "إخفاء" : "التفاصيل"}
                </button>
              </div>

              {open && (
                <div className="ap__details">
                  <table className="ap__table">
                    <thead>
                      <tr>
                        <th>المنتج</th>
                        <th>المقاس</th>
                        <th>اللون</th>
                        <th>الكمية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.items.map((i) => (
                        <tr key={i.id}>
                          <td>{i.name}</td>
                          <td dir="ltr">{i.size}</td>
                          <td>{i.colorName}</td>
                          <td>{i.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {o.address && <p>📍 {o.address}</p>}
                  {o.notes && <p>📝 ملاحظات العميل: {o.notes}</p>}

                  <label className="ap__label" htmlFor={`notes-${o.id}`}>
                    ملاحظاتك الداخلية (العميل مش بيشوفها)
                  </label>
                  <textarea
                    id={`notes-${o.id}`}
                    className="ap__input"
                    rows={2}
                    value={notes[o.id] ?? o.adminNotes ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [o.id]: e.target.value }))}
                  />
                  <div className="ap__actions">
                    <button type="button" className="ap__btn" onClick={() => void saveNotes(o)}>
                      حفظ الملاحظة
                    </button>
                    <button type="button" className="ap__btn ap__btn--danger" onClick={() => void handleDelete(o)}>
                      حذف الطلب
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
