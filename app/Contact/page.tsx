import type { Metadata } from "next";
// ⚠️ عدّل مسار الاستيراد حسب مكان ملفات الهيدر والفوتر عندك
// (هنا افترضت إنها في app/components/)
import Header from "../../compomemts/header"; 
import CtaFooter from "../../compomemts/CtaFooter";
import "./contact.css";

export const metadata: Metadata = {
  title: "تواصل معنا | معرض السلام",
  description: "تواصل مع معرض السلام للحصول على عرض سعر للأبواب والشبابيك.",
};

// نفس أرقام الفوتر
const PHONES = ["01270469567", "01556009567"];

// TODO: املأهم لما تجهزهم — لو فاضيين مش هيظهروا في الصفحة
const ADDRESS: string = "";
const HOURS: string = "";

// 01270469567 -> https://wa.me/201270469567
const waLink = (phone: string) => `https://wa.me/20${phone.slice(1)}`;

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="contact" dir="rtl">
        {/* ===== Hero ===== */}
        <section className="contact__hero">
          <div className="contact__inner">
            <p className="contact__eyebrow">تواصل معنا</p>
            <h1 className="contact__title">يسعدنا نسمع منك</h1>
            <p className="contact__lead">
              عايز عرض سعر حسب مقاسك وتصميمك؟ كلمنا أو ابعتلنا على واتساب.
            </p>
          </div>
        </section>

        <section className="contact__section">
          <div className="contact__inner contact__grid">
            {/* ===== طرق التواصل ===== */}
            <div className="contact__info">
              <article className="contact__card">
                <h2 className="contact__card-title">اتصل بنا</h2>
                <ul className="contact__list">
                  {PHONES.map((p) => (
                    <li key={p}>
                      <a href={`tel:${p}`} dir="ltr">
                        {p}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="contact__card">
                <h2 className="contact__card-title">واتساب</h2>
                <ul className="contact__list">
                  {PHONES.map((p) => (
                    <li key={p}>
                      <a href={waLink(p)} target="_blank" rel="noopener noreferrer" dir="ltr">
                        {p}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>

              {ADDRESS && (
                <article className="contact__card">
                  <h2 className="contact__card-title">العنوان</h2>
                  <p className="contact__text">{ADDRESS}</p>
                </article>
              )}

              {HOURS && (
                <article className="contact__card">
                  <h2 className="contact__card-title">مواعيد العمل</h2>
                  <p className="contact__text">{HOURS}</p>
                </article>
              )}
            </div>

            {/* ===== الرسالة (بتتبعت على واتساب) ===== */}
            <div className="contact__formbox">
              <h2 className="contact__form-title">ابعتلنا طلبك</h2>
              <p className="contact__text">
                اكتب نوع الباب أو الشباك والمقاسات، وهيفتح لك واتساب برسالة جاهزة.
              </p>

              <form
                className="contact__form"
                action={waLink(PHONES[0])}
                method="get"
                target="_blank"
              >
                <label htmlFor="contact-text" className="contact__label">
                  رسالتك
                </label>
                <textarea
                  id="contact-text"
                  name="text"
                  rows={6}
                  required
                  className="contact__textarea"
                  placeholder="مثال: عايز عرض سعر لـ 3 شبابيك ألومنيوم مقاس 120×150، واسمي ..."
                />
                <button type="submit" className="contact__btn">
                  إرسال عبر واتساب
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <CtaFooter />
    </>
  );
}
