import AccountForm from "../../compomemts/AccountForm";

export const metadata = { title: "حسابي — معرض السلام" };

export default function AccountPage() {
  return (
    <main style={{ padding: "2rem 1rem", minHeight: "60vh", background: "#f2ebdc" }}>
      <AccountForm />
    </main>
  );
}
