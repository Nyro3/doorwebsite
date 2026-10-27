"use client";

import Link from "next/link";
import { useCart } from "../lib/cart/cartStore";
import { useProducts } from "../lib/products/useProducts";
import type { CategorySlug } from "../lib/products/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ category }: { category: CategorySlug }) {
  const { products, status, reload } = useProducts(category);
  const { count } = useCart();

  return (
    <>
      <div className="shop__toolbar">
        <span>{status === "ready" ? `${products.length} منتج` : ""}</span>
        <Link href="/cart" className="shop__cartlink">
          السلة ({count})
        </Link>
      </div>

      {status === "loading" && <p className="shop__state">جاري التحميل...</p>}

      {status === "error" && (
        <div className="shop__state">
          <p>حصلت مشكلة في تحميل المنتجات.</p>
          <button type="button" className="shop__btn" onClick={reload}>
            حاول تاني
          </button>
        </div>
      )}

      {status === "ready" && products.length === 0 && (
        <p className="shop__state">لا توجد منتجات في هذا القسم حاليًا.</p>
      )}

      {status === "ready" && products.length > 0 && (
        <div className="shop__grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
