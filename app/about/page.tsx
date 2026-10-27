

import type { Metadata } from "next";
import Link from "next/link";
// ⚠️ عدّل مسار الاستيراد حسب مكان ملفات الهيدر والفوتر عندك
// (هنا افترضت إنها في app/components/)
import Header from "../../compomemts/header";
import CtaFooter from "../../compomemts/CtaFooter";
import "./about.css";

export const metadata: Metadata = {
  title: "من نحن | معرض السلام",
  description: "تعرّف على معرض السلام لتجارة الأبواب والشبابيك.",
};

const OFFERS = [
  {
    title: "الأبواب",
    text: "تشكيلة من الأبواب بأنواعها وتصميماتها المختلفة لتناسب كل مساحة.",
    href: "/doors/wood",
    cta: "شاهد الأبواب",
  },
  {
    title: "الشبابيك",
    text: "شبابيك بمقاسات وخامات متعددة، مع إمكانية التفصيل حسب طلبك.",
    href: "/windows",
    cta: "شاهد الشبابيك",
  },
];

const VALUES = [
  { title: "جودة الخامات", text: "نختار خامات تتحمل الاستخدام اليومي لسنين طويلة." },
  { title: "حسب مقاسك", text: "نوفر مقاسات وتصميمات تناسب وحدتك بالظبط." },
  { title: "تركيب بإتقان", text: "اهتمام بالتفاصيل عشان الباب والشباك يشتغلوا بسلاسة." },
  { title: "أسعار واضحة", text: "عرض سعر واضح قبل ما تبدأ، من غير مفاجآت." },
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="about" dir="rtl">
        {/* ===== Hero ===== */}
        <section className="about__hero">
          <div className="about__inner">
            <p className="about__eyebrow">من نحن</p>
            <h1 className="about__title">معرض السلام</h1>
            <p className="about__lead">لتجارة الأبواب والشبابيك</p>
          </div>
        </section>

        {/* ===== القصة ===== */}
        <section className="about__section">
          <div className="about__inner about__story">
            <h2 className="about__heading">قصة المعرض</h2>
            {/* TODO: بدّل الفقرتين دول بقصة المعرض الحقيقية (سنة البداية، الخبرة، الإنجازات) */}
            <p>
              معرض السلام متخصص في تجارة الأبواب والشبابيك، وهدفنا إن كل عميل يلاقي
              اللي يناسب بيته أو مشروعه بجودة محترمة وسعر عادل.
            </p>
            <p>
              بنساعدك تختار النوع والمقاس المناسبين، ونبقى جنبك من عرض السعر لحد ما
              الطلب يوصلك.
            </p>
          </div>
        </section>

        {/* ===== اللي بنقدمه ===== */}
        <section className="about__section about__section--alt">
          <div className="about__inner">
            <h2 className="about__heading">إيه اللي بنقدمه</h2>
            <div className="about__offers">
              {OFFERS.map((o) => (
                <article key={o.href} className="about__card">
                  <h3 className="about__card-title">{o.title}</h3>
                  <p className="about__card-text">{o.text}</p>
                  <Link href={o.href} className="about__btn">
                    {o.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ليه تختارنا ===== */}
        <section className="about__section">
          <div className="about__inner">
            <h2 className="about__heading">ليه تختارنا</h2>
            <ul className="about__values">
              {VALUES.map((v, i) => (
                <li key={v.title} className="about__value">
                  <span className="about__value-num">{i + 1}</span>
                  <h3 className="about__value-title">{v.title}</h3>
                  <p className="about__value-text">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <CtaFooter />
    </>
  );
}
