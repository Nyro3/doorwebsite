import AdminGate from "../../compomemts/AdminGate";
import AdminOrders from "../../compomemts/AdminOrders";

export const metadata = { title: "الطلبات — لوحة التحكم" };

export default function AdminOrdersPage() {
  return (
    <AdminGate>
      <AdminOrders />
    </AdminGate>
  );
}
