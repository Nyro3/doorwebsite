// أنواع الطلبات والحسابات (بتطابق الجداول quote_requests / quote_items / profiles)

export type OrderStatus = "new" | "contacted" | "quoted" | "accepted" | "done" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["new", "contacted", "quoted", "accepted", "done", "cancelled"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  quoted: "تم إرسال السعر",
  accepted: "تم الاتفاق",
  done: "مكتمل",
  cancelled: "ملغي",
};

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  colorName: string;
  qty: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address?: string;
  notes?: string;
  adminNotes?: string;
  status: OrderStatus;
  userId?: string; // فاضي = طلب من زائر من غير حساب
  createdAt: string; // ISO
  items: OrderItem[];
}

// اللي العميل بيبعته عند إرسال الطلب
export interface OrderInput {
  customerName: string;
  phone: string;
  address?: string;
  notes?: string;
  items: { name: string; size: string; colorName: string; qty: number }[];
}

// guest = زائر دخل بالرقم فقط، customer = عميل بالإيميل والباسورد، admin = من قاعدة البيانات فقط
export type AccountRole = "guest" | "customer" | "admin";

export interface Account {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role: AccountRole;
  createdAt: string; // ISO
  ordersCount: number;
}
