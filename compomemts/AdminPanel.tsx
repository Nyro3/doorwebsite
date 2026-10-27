"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { IS_LOCAL_MODE, productsApi } from "../lib/products/api";
import { CATEGORIES, CATEGORY_BY_SLUG, COLOR_PRESETS } from "../lib/products/categories";
import { useProducts } from "../lib/products/useProducts";
import type { CategorySlug, Product, ProductColor, ProductInput } from "../lib/products/types";

interface FormState {
  name: string;
  category: CategorySlug;
  description: string;
  image: string;
  sizesText: string;
  colors: ProductColor[];
}

type Message = { type: "ok" | "error"; text: string } | null;

const SEP = "، ";

const emptyForm = (category: CategorySlug): FormState => ({
  name: "",
  category,
  description: "",
  image: "",
  sizesText: CATEGORY_BY_SLUG[category].defaultSizes.join(SEP),
  colors: CATEGORY_BY_SLUG[category].defaultColors.map((c) => ({ ...c })),
});

const parseSizes = (text: string): string[] =>
  Array.from(new Set(text.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean)));

const sameColors = (a: ProductColor[], b: ProductColor[]) =>
  a.length === b.length && a.every((c, i) => c.name === b[i].name && c.hex === b[i].hex);

export default function AdminPanel() {
  const { products, status, reload } = useProducts();
  const [form, setForm] = useState<FormState>(() => emptyForm("wood-doors"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CategorySlug | "all">("all");
  const [message, setMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const visible = filter === "all" ? products : products.filter((p) => p.category === filter);
  const countOf = (slug: CategorySlug) => products.filter((p) => p.category === slug).length;

  // ---------- form helpers ----------
  function patch(changes: Partial<FormState>) {
    setForm((f) => ({ ...f, ...changes }));
  }

  // لما القسم يتغير: لو المقاسات/الألوان لسه على افتراضي القسم القديم نبدّلها بافتراضي الجديد
  function changeCategory(next: CategorySlug) {
    setForm((f) => {
      const prev = CATEGORY_BY_SLUG[f.category];
      const target = CATEGORY_BY_SLUG[next];
      const sizesUntouched =
        f.sizesText.trim() === "" || parseSizes(f.sizesText).join() === prev.defaultSizes.join();
      const colorsUntouched = f.colors.length === 0 || sameColors(f.colors, prev.defaultColors);
      return {
        ...f,
        category: next,
        sizesText: sizesUntouched ? target.defaultSizes.join(SEP) : f.sizesText,
        colors: colorsUntouched ? target.defaultColors.map((c) => ({ ...c })) : f.colors,
      };
    });
  }

  function updateColor(index: number, changes: Partial<ProductColor>) {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) => (i === index ? { ...c, ...changes } : c)),
    }));
  }

  function addColor(color: ProductColor = { name: "", hex: "#c4a14f" }) {
    setForm((f) =>
      color.name && f.colors.some((c) => c.name === color.name)
        ? f
        : { ...f, colors: [...f.colors, { ...color }] },
    );
  }

  function removeColor(index: number) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== index) }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm(form.category));
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description ?? "",
      image: p.image ?? "",
      sizesText: p.sizes.join(SEP),
      colors: p.colors.map((c) => ({ ...c })),
    });
    setMessage(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- actions ----------
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      patch({ image: await productsApi.uploadImage(file) });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "فشل رفع الصورة." });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const sizes = parseSizes(form.sizesText);
    const colors = form.colors
      .map((c) => ({ name: c.name.trim(), hex: c.hex }))
      .filter((c) => c.name !== "");

    if (!form.name.trim()) return setMessage({ type: "error", text: "اكتب اسم المنتج." });
    if (sizes.length === 0) return setMessage({ type: "error", text: "أضف مقاس واحد على الأقل." });
    if (colors.length === 0) return setMessage({ type: "error", text: "أضف لون واحد على الأقل." });

    const input: ProductInput = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || undefined,
      image: form.image || undefined,
      sizes,
      colors,
    };

    const wasEditing = editingId !== null;
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) await productsApi.update(editingId, input);
      else await productsApi.create(input);
      reload();
      resetForm();
      setMessage({ type: "ok", text: wasEditing ? "تم حفظ التعديل." : "تمت إضافة المنتج." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "حصل خطأ، حاول تاني." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!window.confirm(`حذف "${p.name}" نهائيًا؟`)) return;
    try {
      await productsApi.remove(p.id);
      if (editingId === p.id) resetForm();
      reload();
      setMessage({ type: "ok", text: "تم حذف المنتج." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "فشل الحذف." });
    }
  }

  // ---------- UI ----------
  return (
    <div className="adm" dir="rtl">
      <header className="adm__bar">
        <h1 className="adm__title">لوحة التحكم — معرض السلام</h1>
        <nav className="adm__nav" aria-label="معاينة الصفحات">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={c.href}>
              {c.title}
            </Link>
          ))}
        </nav>
      </header>

      <div className="adm__content">
        {IS_LOCAL_MODE && (
          <p className="adm__notice" role="note">
            ⚠️ لسه مفيش Backend: التعديلات بتتحفظ في متصفحك أنت بس ومش هتظهر للزوار. وصفحة الأدمن دي
            من غير حماية (هتتحمى لما الـ Backend يتوصل).
          </p>
        )}

        {message && (
          <p
            className={message.type === "ok" ? "adm__msg adm__msg--ok" : "adm__msg adm__msg--err"}
            role={message.type === "error" ? "alert" : "status"}
          >
            {message.text}
          </p>
        )}

        <div className="adm__grid">
          {/* ===== الفورم ===== */}
          <form ref={formRef} className="adm__form" onSubmit={handleSubmit}>
            <h2 className="adm__h2">{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>

            <label className="adm__label" htmlFor="adm-name">
              اسم المنتج
            </label>
            <input
              id="adm-name"
              className="adm__input"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="مثال: باب خشب زان موديل 5"
            />

            <label className="adm__label" htmlFor="adm-cat">
              القسم (الصفحة اللي هيظهر فيها)
            </label>
            <select
              id="adm-cat"
              className="adm__input"
              value={form.category}
              onChange={(e) => changeCategory(e.target.value as CategorySlug)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>

            <label className="adm__label" htmlFor="adm-desc">
              وصف (اختياري)
            </label>
            <textarea
              id="adm-desc"
              className="adm__input"
              rows={3}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />

            <span className="adm__label">الصورة</span>
            <div className="adm__image">
              {form.image ? (
                <img src={form.image} alt="معاينة" className="adm__preview" />
              ) : (
                <div className="adm__preview adm__preview--empty">لا توجد صورة</div>
              )}
              <div className="adm__image-actions">
                <label className="adm__btn adm__btn--light">
                  {uploading ? "جاري المعالجة..." : "اختر صورة"}
                  <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
                </label>
                {form.image && (
                  <button type="button" className="adm__btn adm__btn--light" onClick={() => patch({ image: "" })}>
                    إزالة
                  </button>
                )}
              </div>
            </div>

            <label className="adm__label" htmlFor="adm-sizes">
              المقاسات بالسنتيمتر (افصل بينهم بفاصلة)
            </label>
            <input
              id="adm-sizes"
              className="adm__input"
              dir="ltr"
              value={form.sizesText}
              onChange={(e) => patch({ sizesText: e.target.value })}
              placeholder="80×200, 90×200, 100×210"
            />

            <span className="adm__label">الألوان</span>
            <ul className="adm__colors">
              {form.colors.map((c, i) => (
                <li key={i} className="adm__color-row">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColor(i, { hex: e.target.value })}
                    aria-label="اختيار اللون"
                  />
                  <input
                    className="adm__input"
                    value={c.name}
                    onChange={(e) => updateColor(i, { name: e.target.value })}
                    placeholder="اسم اللون"
                    aria-label="اسم اللون"
                  />
                  <button type="button" className="adm__icon" onClick={() => removeColor(i)} aria-label="حذف اللون">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="adm__presets">
              <button type="button" className="adm__btn adm__btn--light" onClick={() => addColor()}>
                + لون جديد
              </button>
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="adm__preset"
                  onClick={() => addColor(p)}
                  title={`إضافة ${p.name}`}
                >
                  <span className="adm__dot" style={{ backgroundColor: p.hex }} /> {p.name}
                </button>
              ))}
            </div>

            <div className="adm__actions">
              <button type="submit" className="adm__btn" disabled={saving || uploading}>
                {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة المنتج"}
              </button>
              {editingId && (
                <button type="button" className="adm__btn adm__btn--light" onClick={resetForm}>
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          {/* ===== قايمة المنتجات ===== */}
          <section className="adm__list-box">
            <h2 className="adm__h2">المنتجات ({products.length})</h2>

            <div className="adm__filters" role="tablist" aria-label="فلترة بالقسم">
              <button
                type="button"
                className={filter === "all" ? "adm__tab adm__tab--on" : "adm__tab"}
                onClick={() => setFilter("all")}
              >
                الكل ({products.length})
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className={filter === c.slug ? "adm__tab adm__tab--on" : "adm__tab"}
                  onClick={() => setFilter(c.slug)}
                >
                  {c.title} ({countOf(c.slug)})
                </button>
              ))}
            </div>

            {status === "loading" && <p>جاري التحميل...</p>}
            {status === "error" && <p className="adm__msg adm__msg--err">فشل تحميل المنتجات.</p>}
            {status === "ready" && visible.length === 0 && <p>لا توجد منتجات هنا.</p>}

            <ul className="adm__list">
              {visible.map((p) => (
                <li key={p.id} className={p.id === editingId ? "adm__item adm__item--editing" : "adm__item"}>
                  {p.image ? (
                    <img src={p.image} alt="" className="adm__thumb" />
                  ) : (
                    <div className="adm__thumb adm__thumb--empty" aria-hidden />
                  )}

                  <div className="adm__item-info">
                    <strong>{p.name}</strong>
                    <span className="adm__badge">{CATEGORY_BY_SLUG[p.category].title}</span>
                    <span className="adm__small" dir="ltr">
                      {p.sizes.join(" · ")}
                    </span>
                    <span className="adm__dots">
                      {p.colors.map((c) => (
                        <span key={c.name} className="adm__dot" style={{ backgroundColor: c.hex }} title={c.name} />
                      ))}
                    </span>
                  </div>

                  <div className="adm__item-actions">
                    <button type="button" className="adm__btn adm__btn--light" onClick={() => startEdit(p)}>
                      تعديل
                    </button>
                    <button type="button" className="adm__btn adm__btn--danger" onClick={() => handleDelete(p)}>
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
