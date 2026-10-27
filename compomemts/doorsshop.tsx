"use client";
import { useMemo, useState } from "react";
import "./doorshop.css";

// بيانات تجريبية مؤقتة - استبدل مسارات الصور بصورك
const products = [
  {
    id: 1,
    name: "باب خشب مودرن",
    category: "wood",
    categoryName: "أبواب خشب",
    description: "تصميم عصري مناسب للشقق والفلل.",
    material: "خشب",
    colors: ["بني", "بيج"],
    image: "/images/door-1.jpg",
    badge: "الأكثر طلبًا",
    price: null,
  },
  {
    id: 2,
    name: "باب مصفح تركي",
    category: "armored",
    categoryName: "أبواب مصفحة",
    description: "باب بتصميم أنيق ومناسب للمدخل الرئيسي.",
    material: "مصفح",
    colors: ["بني داكن", "أسود"],
    image: "/images/door-2.jpg",
    badge: "مميز",
    price: null,
  },
  {
    id: 3,
    name: "باب داخلي كلاسيك",
    category: "wood",
    categoryName: "أبواب خشب",
    description: "تفاصيل بسيطة تناسب مختلف الديكورات.",
    material: "خشب",
    colors: ["أوف وايت", "بني"],
    image: "/images/door-3.jpg",
    badge: "",
    price: null,
  },
  {
    id: 4,
    name: "باب مدخل فاخر",
    category: "armored",
    categoryName: "أبواب مصفحة",
    description: "مظهر فاخر مع إمكانية اختيار التشطيب.",
    material: "مصفح",
    colors: ["بني", "رمادي"],
    image: "/images/door-4.jpg",
    badge: "تصميم فاخر",
    price: null,
  },
  {
    id: 5,
    name: "شباك ألوميتال مودرن",
    category: "windows",
    categoryName: "شبابيك",
    description: "تصميم عملي يناسب المساحات الحديثة.",
    material: "ألوميتال",
    colors: ["أبيض", "أسود"],
    image: "/images/window-1.jpg",
    badge: "",
    price: null,
  },
  {
    id: 6,
    name: "باب خشب بتفاصيل هندسية",
    category: "wood",
    categoryName: "أبواب خشب",
    description: "شكل مميز لعشاق التصميمات الحديثة.",
    material: "خشب",
    colors: ["بني فاتح", "بني داكن"],
    image: "/images/door-5.jpg",
    badge: "جديد",
    price: null,
  },
];

const categories = [
  { id: "all", label: "كل المنتجات" },
  { id: "wood", label: "أبواب خشب" },
  { id: "armored", label: "أبواب مصفحة" },
  { id: "windows", label: "شبابيك" },
];

function CategoryTabs({ active, onChange }): import("react").JSX.Element {
  return (
    
    <div className="ds-categories" aria-label="تصنيفات المنتجات">
     
     
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`ds-category ${
            active === category.id ? "active" : ""
          }`}
          onClick={() => onChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product, onDetails, onQuote }): import("react").JSX.Element {
  return (
    <article className="ds-card">
      <div className="ds-card-image">
        {product.badge && (
          <span className="ds-badge">{product.badge}</span>
        )}

        <div className="ds-image-placeholder">
          <span>معرض السلام</span>
        </div>

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <button
          type="button"
          className="ds-quick-view"
          onClick={() => onDetails(product)}
          aria-label={`عرض تفاصيل ${product.name}`}
        >
          عرض التفاصيل
        </button>
      </div>

      <div className="ds-card-content">
        <span className="ds-card-category">
          {product.categoryName}
        </span>

        <h3>{product.name}</h3>

        <p className="ds-card-description">
          {product.description}
        </p>

        <div className="ds-card-meta">
          <span>الخامة: {product.material}</span>
          <span>{product.colors.length} ألوان متاحة</span>
        </div>

        <div className="ds-card-bottom">
          <div className="ds-price">
            {product.price != null
              ? `${product.price.toLocaleString("ar-EG")} ج.م`
              : "السعر عند الطلب"}
          </div>

          <button
            type="button"
            className="ds-quote-button"
            onClick={() => onQuote(product)}
          >
            اطلب عرض سعر
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose, mode }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!product) return null;

  function handleSubmit(event) {
    event.preventDefault();

    // Frontend فقط: لا يتم إرسال البيانات لأي سيرفر
    setSubmitted(true);
  }

  return (
    <div
      className="ds-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ds-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="ds-modal-close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          ×
        </button>

        {mode === "details" ? (
          <>
            <div className="ds-modal-image">
              <img
                src={product.image}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="ds-image-placeholder">
                <span>معرض السلام</span>
              </div>
            </div>

            <div className="ds-modal-content">
              <span className="ds-card-category">
                {product.categoryName}
              </span>

              <h2 id="ds-modal-title">{product.name}</h2>
              <p>{product.description}</p>

              <div className="ds-detail-row">
                <span>الخامة</span>
                <strong>{product.material}</strong>
              </div>

              <div className="ds-detail-row">
                <span>الألوان المتاحة</span>
                <strong>{product.colors.join("، ")}</strong>
              </div>

              <div className="ds-detail-row">
                <span>السعر</span>
                <strong>
                  {product.price != null
                    ? `${product.price.toLocaleString("ar-EG")} ج.م`
                    : "يُحدد حسب المقاس والمواصفات"}
                </strong>
              </div>

              <button
                type="button"
                className="ds-primary-button"
                onClick={() => onClose("quote", product)}
              >
                اطلب عرض سعر
              </button>
            </div>
          </>
        ) : submitted ? (
          <div className="ds-form-success">
            <h2 id="ds-modal-title">تم تسجيل البيانات تجريبيًا</h2>
            <p>
              دي واجهة Frontend فقط. لم يتم إرسال طلب حقيقي
              أو حفظه على سيرفر.
            </p>
            <button
              type="button"
              className="ds-primary-button"
              onClick={onClose}
            >
              إغلاق
            </button>
          </div>
        ) : (
          <form className="ds-quote-form" onSubmit={handleSubmit}>
            <span className="ds-card-category">
              طلب عرض سعر
            </span>

            <h2 id="ds-modal-title">{product.name}</h2>

            <p>
              سجّل بياناتك لتجربة نموذج طلب عرض السعر.
            </p>

            <label htmlFor="ds-customer-name">الاسم</label>
            <input
              id="ds-customer-name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="اكتب اسمك"
              required
            />

            <label htmlFor="ds-customer-phone">رقم الهاتف</label>
            <input
              id="ds-customer-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01xxxxxxxxx"
              pattern="[0-9+\s()-]{8,20}"
              required
            />

            <button type="submit" className="ds-primary-button">
              تجربة إرسال الطلب
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function DoorsShop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState("details");

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" ||
        product.category === activeCategory;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.categoryName.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });

    if (sort === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name, "ar")
      );
    }

    return result;
  }, [activeCategory, search, sort]);

  function openDetails(product) {
    setSelectedProduct(product);
    setModalMode("details");
  }

  function openQuote(product) {
    setSelectedProduct(product);
    setModalMode("quote");
  }

  function closeModal(nextMode, product) {
    if (nextMode === "quote" && product) {
      setSelectedProduct(product);
      setModalMode("quote");
      return;
    }

    setSelectedProduct(null);
  }

  return (
    <main className="doors-shop" dir="rtl">
      <section className="ds-intro">
        <span className="ds-eyebrow">اكتشف مجموعتنا</span>
        <h1>أبواب وشبابيك تناسب ذوقك</h1>
        <p>
          اختار التصميم المناسب لمساحتك، واستكشف مجموعتنا
          من الأبواب الخشبية والمصفحة والشبابيك.
        </p>
      </section>

      <section className="ds-catalog">
        <div className="ds-toolbar">
          <div className="ds-toolbar-title">
            <h2>منتجاتنا</h2>
            <span>{filteredProducts.length} منتجات</span>
          </div>

          <div className="ds-controls">
            <label className="ds-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="ابحث عن باب أو شباك..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="البحث عن المنتجات"
              />
            </label>

            <select
              className="ds-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="ترتيب المنتجات"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="name">الاسم: أ إلى ي</option>
            </select>
          </div>
        </div>

        <CategoryTabs
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {filteredProducts.length > 0 ? (
          <div className="ds-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetails={openDetails}
                onQuote={openQuote}
              />
            ))}
          </div>
        ) : (
          <div className="ds-empty">
            <h3>مفيش منتجات مطابقة</h3>
            <p>جرّب تغيّر كلمة البحث أو تختار تصنيف تاني.</p>
            <button
              type="button"
              className="ds-primary-button"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
            >
              عرض كل المنتجات
            </button>
          </div>
        )}
      </section>

      <ProductModal
        key={`${selectedProduct?.id ?? "none"}-${modalMode}`}
        product={selectedProduct}
        mode={modalMode}
        onClose={closeModal}
      />
    </main>
  );
}