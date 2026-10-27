import type { Metadata } from "next";

import Header from "../compomemts/header";
import Intro from "../compomemts/home_compoments/intro";
import Shopshow from "../compomemts/home_compoments/shopshow";
import AccountForm from "../compomemts/AccountForm";
import CtaFooter from "../compomemts/CtaFooter";

export const metadata: Metadata = {
  title: "معرض السلام | لتجارة الأبواب والشبابيك",
  description: "باب يليق ببيتك وشباك يدخل النور — أبواب خشب ومصفحة وداخلية وشبابيك.",
};

export default function HomePage() {
  return (
    <>
      
      <Intro />

      <section aria-label="تسجيل الدخول" style={{ padding: "2rem 1rem", background: "#f2ebdc" }}>
        <AccountForm />
      </section>

      <CtaFooter />
    </>
  );
}