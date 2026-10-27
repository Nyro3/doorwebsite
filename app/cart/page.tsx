import type { Metadata } from "next";
import Header from "../../compomemts/header";
import CtaFooter from "../../compomemts/CtaFooter";
import CartView from "../../compomemts/CartView";
import "../../compomemts/shop.css";

export const metadata: Metadata = {
  title: "السلة | معرض السلام",
};

export default function CartPage() {
  return (
    <>
      <Header />

      <main className="shop" dir="rtl">
        <section className="shop__hero">
          <div className="shop__inner">
            <h1 className="shop__title">السلة</h1>
            <p className="shop__lead">راجع طلبك وابعته لنا للحصول على عرض سعر.</p>
          </div>
        </section>

        <section className="shop__section">
          <div className="shop__inner">
            <CartView />
          </div>
        </section>
      </main>

      <CtaFooter />
    </>
  );
}
