"use client";

import { useCallback, useEffect, useState } from "react";
import { productsApi } from "./api";
import type { CategorySlug, Product } from "./types";

export type LoadStatus = "loading" | "ready" | "error";

/** بيجيب المنتجات (لقسم معيّن أو كلها لو category مش متحددة) */
export function useProducts(category?: CategorySlug) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    productsApi.list(category).then(
      (list) => {
        if (cancelled) return;
        setProducts(list);
        setStatus("ready");
      },
      () => {
        if (!cancelled) setStatus("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [category, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { products, status, reload };
}
