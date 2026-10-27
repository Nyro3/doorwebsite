"use client";

import { useEffect, useId, useState } from "react";
import { addToCart } from "../lib/cart/cartStore";
import type { Product } from "../lib/products/types";

// كارت المنتج: اختيار المقاس واللون، وزرار السلة بيتفتح بعد الاختيار.
export default function ProductCard({ product }: { product: Product }) {
  const uid = useId();
  const [size, setSize] = useState("");
  const [colorName, setColorName] = useState("");
  const [added, setAdded] = useState(false);

  const needsSize = product.sizes.length > 0;
  const needsColor = product.colors.length > 0;
  const color = product.colors.find((c) => c.name === colorName);
  const ready = (!needsSize || size !== "") && (!needsColor || color !== undefined);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  function handleAdd() {
    if (!ready) return;
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      size,
      colorName: color?.name ?? "",
      colorHex: color?.hex ?? "",
    });
    setAdded(true);
  }

  const missing = [needsSize && !size ? "المقاس" : "", needsColor && !color ? "اللون" : ""]
    .filter(Boolean)
    .join(" و");

  return (
    <article className="shop__card">
      <div className="shop__media">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- ممكن تكون data URL لحد ما يتوصل الـ Backend
          <img src={product.image} alt={product.name} className="shop__img" loading="lazy" />
        ) : (
          <div className="shop__placeholder" role="img" aria-label={product.name}>
            <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              {product.category === "windows" ? (
                <>
                  <rect x="8" y="10" width="48" height="44" rx="2" />
                  <path d="M32 10v44M8 32h48" />
                </>
              ) : (
                <>
                  <rect x="16" y="6" width="32" height="52" rx="2" />
                  <rect x="22" y="12" width="20" height="16" rx="1" />
                  <rect x="22" y="33" width="20" height="18" rx="1" />
                  <circle cx="42" cy="34" r="1.5" fill="currentColor" />
                </>
              )}
            </svg>
          </div>
        )}
      </div>

      <div className="shop__body">
        <h3 className="shop__name">{product.name}</h3>
        {product.description && <p className="shop__desc">{product.description}</p>}

        {needsSize && (
          <fieldset className="shop__field">
            <legend className="shop__legend">المقاس</legend>
            <div className="shop__chips">
              {product.sizes.map((s) => (
                <label key={s} className="shop__chip">
                  <input
                    type="radio"
                    name={`${uid}-size`}
                    value={s}
                    checked={size === s}
                    onChange={() => setSize(s)}
                  />
                  <span dir="ltr">{s}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {needsColor && (
          <fieldset className="shop__field">
            <legend className="shop__legend">اللون{color ? `: ${color.name}` : ""}</legend>
            <div className="shop__chips">
              {product.colors.map((c) => (
                <label key={c.name} className="shop__swatch" title={c.name}>
                  <input
                    type="radio"
                    name={`${uid}-color`}
                    value={c.name}
                    checked={colorName === c.name}
                    onChange={() => setColorName(c.name)}
                    aria-label={c.name}
                  />
                  <span className="shop__dot" style={{ backgroundColor: c.hex }} />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <button type="button" className="shop__add" disabled={!ready} onClick={handleAdd}>
          {added ? "تمت الإضافة ✓" : "أضف إلى السلة"}
        </button>
        {!ready && <p className="shop__hint">اختر {missing} لتفعيل زر السلة</p>}
      </div>
    </article>
  );
}
