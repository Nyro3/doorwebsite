// طبقة بيانات الطلبات والحسابات (Supabase فقط — مفيش وضع محلي للطلبات)

import { getSupabase, SUPABASE_ENABLED } from "../supabase/client";
import type { Account, AccountRole, Order, OrderInput, OrderStatus } from "./types";

function requireSupabase() {
  if (!SUPABASE_ENABLED) {
    throw new Error("الطلبات والحسابات محتاجة ربط Supabase (ضيف المتغيرات في .env.local).");
  }
  return getSupabase();
}

function fail(error: { code?: string; message?: string }, fallback: string): Error {
  if (error.code === "42501") return new Error("مش مسموح لك بالعملية دي — سجّل دخول بحساب أدمن.");
  return new Error(fallback);
}

// ---------------------------------------------------------------------------
// الطلبات
// ---------------------------------------------------------------------------

/** إنشاء طلب جديد (للزائر والعميل) — بيرجّع رقم الطلب */
export async function createOrder(input: OrderInput): Promise<number> {
  const { data, error } = await requireSupabase().rpc("create_order", {
    p_name: input.customerName,
    p_phone: input.phone,
    p_address: input.address ?? null,
    p_notes: input.notes ?? null,
    p_items: input.items.map((i) => ({
      name: i.name,
      size: i.size,
      color_name: i.colorName,
      qty: i.qty,
    })),
  });
  if (error) throw new Error("تعذر إرسال الطلب، اتأكد من الاسم ورقم التليفون وحاول تاني.");
  return data as number;
}

interface OrderRow {
  id: number | string;
  customer_name: string;
  phone: string;
  address: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: OrderStatus;
  user_id: string | null;
  created_at: string;
  quote_items: { id: number | string; name: string; size: string; color_name: string; qty: number }[];
}

const ORDER_SELECT =
  "id, customer_name, phone, address, notes, admin_notes, status, user_id, created_at, " +
  "quote_items(id, name, size, color_name, qty)";

function toOrder(row: OrderRow): Order {
  return {
    id: String(row.id),
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    status: row.status,
    userId: row.user_id ?? undefined,
    createdAt: row.created_at,
    items: [...row.quote_items]
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((i) => ({
        id: String(i.id),
        name: i.name,
        size: i.size,
        colorName: i.color_name,
        qty: i.qty,
      })),
  };
}

/** كل الطلبات (للأدمن) — الأحدث أولًا */
export async function listOrders(): Promise<Order[]> {
  const { data, error } = await requireSupabase()
    .from("quote_requests")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw fail(error, "تعذر تحميل الطلبات.");
  return ((data ?? []) as unknown as OrderRow[]).map(toOrder);
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { data, error } = await requireSupabase()
    .from("quote_requests")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) throw fail(error, "تعذر تحديث حالة الطلب.");
  if (!data || data.length === 0) throw new Error("مش مسموح لك بتعديل الطلب — سجّل دخول بحساب أدمن.");
}

export async function setOrderAdminNotes(id: string, adminNotes: string): Promise<void> {
  const { data, error } = await requireSupabase()
    .from("quote_requests")
    .update({ admin_notes: adminNotes.trim() || null })
    .eq("id", id)
    .select("id");
  if (error) throw fail(error, "تعذر حفظ الملاحظة.");
  if (!data || data.length === 0) throw new Error("مش مسموح لك بتعديل الطلب — سجّل دخول بحساب أدمن.");
}

export async function deleteOrder(id: string): Promise<void> {
  const { data, error } = await requireSupabase().from("quote_requests").delete().eq("id", id).select("id");
  if (error) throw fail(error, "فشل حذف الطلب.");
  if (!data || data.length === 0) throw new Error("مش مسموح لك بحذف الطلب — سجّل دخول بحساب أدمن.");
}

// ---------------------------------------------------------------------------
// الحسابات
// ---------------------------------------------------------------------------

interface AccountRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: AccountRole;
  created_at: string;
  quote_requests: { count: number }[];
}

/** كل الحسابات (للأدمن) مع عدد طلبات كل حساب */
export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id, email, full_name, phone, address, role, created_at, quote_requests(count)")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw fail(error, "تعذر تحميل الحسابات.");
  return ((data ?? []) as unknown as AccountRow[]).map((r) => ({
    id: r.id,
    email: r.email ?? "",
    fullName: r.full_name ?? undefined,
    phone: r.phone ?? undefined,
    address: r.address ?? undefined,
    role: r.role,
    createdAt: r.created_at,
    ordersCount: r.quote_requests?.[0]?.count ?? 0,
  }));
}

/** بيانات الحساب الحالي (لتعبئة نموذج الطلب تلقائيًا) */
export async function getMyProfile(): Promise<Pick<Account, "id" | "email" | "fullName" | "phone" | "address" | "role"> | null> {
  if (!SUPABASE_ENABLED) return null;
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data } = await sb
    .from("profiles")
    .select("id, email, full_name, phone, address, role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    email: data.email ?? "",
    fullName: data.full_name ?? undefined,
    phone: data.phone ?? undefined,
    address: data.address ?? undefined,
    role: data.role as AccountRole,
  };
}
