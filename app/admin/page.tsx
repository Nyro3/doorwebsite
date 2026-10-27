import type { Metadata } from "next";
import AdminPanel from "../../compomemts/AdminPanel";  
import AdminGate from "../../compomemts/AdminGate";

import "./admin.css";

export const metadata: Metadata = {
  title: "لوحة التحكم | معرض السلام",
  robots: { index: false, follow: false }, // مايظهرش في جوجل
};

// TODO(auth): لما الـ Backend يتوصل، احمِ المسار ده (تسجيل دخول / proxy.ts) قبل النشر.
export default function AdminPage() {
  return  <AdminGate><AdminPanel /></AdminGate>;
}
