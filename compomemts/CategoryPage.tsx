import Link from "next/link";
import Header from "./header";
import CtaFooter from "./CtaFooter";
import ProductGrid from "./ProductGrid";
import { CATEGORIES, CATEGORY_BY_SLUG } from "../lib/products/categories";
import type { CategorySlug } from "../lib/products/types";
import "./shop.css";

// القالب المشترك لصفحات الأقسام الأربعة
export default function CategoryPage({ category }: { category: CategorySlug }) {
  const meta = CATEGORY_BY_SLUG[category];

  return (
    <>
      <Header />

      <main className="shop" dir="rtl">
        <section className="shop__hero">
          <div className="shop__inner">
            <h1 className="shop__title">{meta.title}</h1>
            <p className="shop__lead">{meta.description}</p>

            <nav className="shop__tabs" aria-label="أقسام المنتجات">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className={c.slug === category ? "shop__tab shop__tab--active" : "shop__tab"}
                  aria-current={c.slug === category ? "page" : undefined}
                >
                  {c.title}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="shop__section">
          <div className="shop__inner">
            <ProductGrid category={category} />
          </div>
        </section>
      </main>

      <CtaFooter />
    </>
  );
}
