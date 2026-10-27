import AdminGate from "../../compomemts/AdminGate";
import AdminAccounts from "../../compomemts/AdminAccounts";

export const metadata = { title: "الحسابات — لوحة التحكم" };

export default function AdminAccountsPage() {
  return (
    <AdminGate>
      <AdminAccounts />
    </AdminGate>
  );
}
