// ============================================================================
// طبقة بيانات المنتجات — النقطة الوحيدة اللي الصفحات بتكلّم بيها البيانات.
//
// لو متغيرات Supabase متظبطة في .env.local  → بتشتغل على Supabase (قاعدة بيانات حقيقية).
// لو مش متظبطة                              → بترجع لـ localStorage (وضع تجريبي محلي).
// ============================================================================

import { getSupabase, SUPABASE_ENABLED } from "../supabase/client";
import { SEED_PRODUCTS } from "./seed";
import type { CategorySlug, Product, ProductInput } from "./types";

export interface ProductsApi {
  list(category?: CategorySlug): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product>;
  remove(id: string): Promise<void>;
  /** بيرفع صورة ويرجّع الرابط اللي هيتخزن في product.image */
  uploadImage(file: File): Promise<string>;
}

/** true = التعديلات بتتحفظ في متصفح الأدمن بس (Supabase مش متظبط) */
export const IS_LOCAL_MODE = !SUPABASE_ENABLED;

// ---------------------------------------------------------------------------
// 1) التنفيذ المحلي (localStorage)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "alsalam:products:v1";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
}

function writeAll(products: Product[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    throw new Error("مساحة التخزين في المتصفح امتلأت أو غير متاحة. صغّر الصور أو احذف منتجات قديمة.");
  }
}

function readAll(): Product[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      writeAll(SEED_PRODUCTS);
      return SEED_PRODUCTS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Product[];
  } catch {
    // التخزين مش متاح أو البيانات بايظة — نرجع للتجريبي
  }
  return SEED_PRODUCTS;
}

// بيصغّر الصورة ويرجّعها Blob (JPEG)
async function resizeToBlob(file: File, maxSize: number, quality: number): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("الملف لازم يكون صورة.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("المتصفح مش بيدعم معالجة الصور.");
  ctx.fillStyle = "#ffffff"; // خلفية بيضا للصور الشفافة
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("فشل معالجة الصورة."))), "image/jpeg", quality),
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("فشل قراءة الصورة."));
    reader.readAsDataURL(blob);
  });
}

const localProductsApi: ProductsApi = {
  async list(category) {
    const all = readAll();
    return category ? all.filter((p) => p.category === category) : all;
  },

  async get(id) {
    return readAll().find((p) => p.id === id) ?? null;
  },

  async create(input) {
    const now = new Date().toISOString();
    const product: Product = { ...input, id: newId(), createdAt: now, updatedAt: now };
    writeAll([product, ...readAll()]);
    return product;
  },

  async update(id, input) {
    const all = readAll();
    const current = all.find((p) => p.id === id);
    if (!current) throw new Error("المنتج مش موجود.");
    const updated: Product = { ...current, ...input, updatedAt: new Date().toISOString() };
    writeAll(all.map((p) => (p.id === id ? updated : p)));
    return updated;
  },

  async remove(id) {
    writeAll(readAll().filter((p) => p.id !== id));
  },

  async uploadImage(file) {
    return blobToDataUrl(await resizeToBlob(file, 900, 0.8));
  },
};

// ---------------------------------------------------------------------------
// 2) التنفيذ على Supabase
// ---------------------------------------------------------------------------

const IMAGES_BUCKET = "products";

interface ProductRow {
  id: number | string;
  name: string;
  category: CategorySlug;
  description: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  product_sizes: { size: string; position: number }[];
  product_colors: { name: string; hex: string; position: number }[];
}

const SELECT =
  "id, name, category, description, image, created_at, updated_at, " +
  "product_sizes(size, position), product_colors(name, hex, position)";

function toProduct(row: ProductRow): Product {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    sizes: [...row.product_sizes].sort((a, b) => a.position - b.position).map((s) => s.size),
    colors: [...row.product_colors]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ name: c.name, hex: c.hex })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fail(error: { code?: string; message?: string }, fallback: string): Error {
  // 42501 = RLS رفضت العملية (مش مسجّل دخول كأدمن)
  if (error.code === "42501") return new Error("مش مسموح لك بالعملية دي — سجّل دخول الأدمن.");
  return new Error(fallback);
}

async function saveVariants(productId: number | string, input: ProductInput): Promise<void> {
  const sb = getSupabase();

  const sizes = Array.from(new Set(input.sizes)).map((size, position) => ({
    product_id: productId,
    size,
    position,
  }));
  const seen = new Set<string>();
  const colors = input.colors
    .filter((c) => (seen.has(c.name) ? false : (seen.add(c.name), true)))
    .map((c, position) => ({ product_id: productId, name: c.name, hex: c.hex, position }));

  if (sizes.length > 0) {
    const { error } = await sb.from("product_sizes").insert(sizes);
    if (error) throw fail(error, "تعذر حفظ المقاسات.");
  }
  if (colors.length > 0) {
    const { error } = await sb.from("product_colors").insert(colors);
    if (error) throw fail(error, "تعذر حفظ الألوان.");
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await getSupabase().from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw fail(error, "تعذر تحميل المنتج.");
  return data ? toProduct(data as unknown as ProductRow) : null;
}

const supabaseProductsApi: ProductsApi = {
  async list(category) {
    let query = getSupabase().from("products").select(SELECT).order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) throw fail(error, "تعذر تحميل المنتجات.");
    return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
  },

  get: getProduct,

  async create(input) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("products")
      .insert({
        name: input.name,
        category: input.category,
        description: input.description ?? null,
        image: input.image ?? null,
      })
      .select("id")
      .single();
    if (error) throw fail(error, "تعذر إضافة المنتج.");

    try {
      await saveVariants(data.id, input);
    } catch (e) {
      await sb.from("products").delete().eq("id", data.id); // تراجع لو المقاسات/الألوان فشلت
      throw e;
    }
    const created = await getProduct(String(data.id));
    if (!created) throw new Error("تعذر قراءة المنتج بعد الإضافة.");
    return created;
  },

  async update(id, input) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("products")
      .update({
        name: input.name,
        category: input.category,
        description: input.description ?? null,
        image: input.image ?? null,
      })
      .eq("id", id)
      .select("id");
    if (error) throw fail(error, "تعذر حفظ التعديل.");
    if (!data || data.length === 0) throw new Error("المنتج مش موجود، أو مش مسموح لك تعدّله.");

    const sizesDel = await sb.from("product_sizes").delete().eq("product_id", id);
    if (sizesDel.error) throw fail(sizesDel.error, "تعذر تحديث المقاسات.");
    const colorsDel = await sb.from("product_colors").delete().eq("product_id", id);
    if (colorsDel.error) throw fail(colorsDel.error, "تعذر تحديث الألوان.");
    await saveVariants(id, input);

    const updated = await getProduct(id);
    if (!updated) throw new Error("تعذر قراءة المنتج بعد التعديل.");
    return updated;
  },

  async remove(id) {
    const { data, error } = await getSupabase().from("products").delete().eq("id", id).select("id");
    if (error) throw fail(error, "فشل الحذف.");
    if (!data || data.length === 0) throw new Error("مش مسموح لك بالحذف — سجّل دخول الأدمن.");
  },

  async uploadImage(file) {
    const sb = getSupabase();
    const blob = await resizeToBlob(file, 1400, 0.85);
    const path = `${newId()}.jpg`;
    const { error } = await sb.storage
      .from(IMAGES_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (error) throw new Error("فشل رفع الصورة — اتأكد إنك مسجّل دخول كأدمن.");
    return sb.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
  },
};

// ---------------------------------------------------------------------------

export const productsApi: ProductsApi = SUPABASE_ENABLED ? supabaseProductsApi : localProductsApi;
