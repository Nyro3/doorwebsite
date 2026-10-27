import type { CategorySlug, ProductColor } from "./types";

export interface CategoryMeta {
  slug: CategorySlug;
  title: string;
  description: string;
  href: string; // مسار الصفحة
  defaultSizes: string[]; // بالسنتيمتر (عرض×ارتفاع)
  defaultColors: ProductColor[];
}

export const COLOR_PRESETS: ProductColor[] = [
  { name: "بني", hex: "#6b4423" },
  { name: "جوزي", hex: "#5a3825" },
  { name: "بيج", hex: "#d9c3a0" },
  { name: "أبيض", hex: "#f5f5f0" },
  { name: "رمادي", hex: "#8a8d91" },
  { name: "أسود", hex: "#222222" },
  { name: "ألومنيوم طبيعي", hex: "#c0c4c8" },
];

const preset = (...names: string[]): ProductColor[] =>
  COLOR_PRESETS.filter((c) => names.includes(c.name));

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "wood-doors",
    title: "الأبواب الخشبية",
    description: "تشكيلة من الأبواب الخشب بتصميمات وألوان متنوعة.",
    href: "/doors/wood",
    defaultSizes: ["80×200", "90×200", "100×210"],
    defaultColors: preset("بني", "جوزي", "بيج"),
  },
  {
    slug: "armored-doors",
    title: "الأبواب المصفحة",
    description: "أبواب أمان مصفحة للمداخل بأعلى درجات الحماية.",
    href: "/doors/armored",
    defaultSizes: ["90×200", "100×210"],
    defaultColors: preset("بني", "جوزي", "رمادي", "أسود"),
  },
  {
    slug: "interior-doors",
    title: "الأبواب الداخلية",
    description: "أبواب للغرف والحمامات بأشكال عصرية.",
    href: "/doors/interior",
    defaultSizes: ["70×200", "80×200", "90×200"],
    defaultColors: preset("أبيض", "بيج", "بني"),
  },
  {
    slug: "windows",
    title: "الشبابيك",
    description: "شبابيك بمقاسات وخامات متعددة، وتفصيل حسب الطلب.",
    href: "/windows",
    defaultSizes: ["100×100", "120×120", "150×120"],
    defaultColors: preset("أبيض", "ألومنيوم طبيعي", "بني", "أسود"),
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, CategoryMeta>;
