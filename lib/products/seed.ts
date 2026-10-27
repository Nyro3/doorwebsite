import { CATEGORIES } from "./categories";
import type { Product } from "./types";

// بيانات تجريبية بتظهر أول مرة بس (لحد ما الأدمن يعدّلها أو يحذفها).
// تاريخ ثابت عمدًا (مش new Date()) عشان الـ module ده يتحمّل بأمان وقت الـ prerender.
const STAMP = "2026-01-01T00:00:00.000Z";

const LABEL = {
  "wood-doors": "باب خشب",
  "armored-doors": "باب مصفح",
  "interior-doors": "باب داخلي",
  windows: "شباك",
} as const;

export const SEED_PRODUCTS: Product[] = CATEGORIES.flatMap((cat) =>
  [1, 2, 3].map((n) => ({
    id: `seed-${cat.slug}-${n}`,
    name: `${LABEL[cat.slug]} موديل ${n}`,
    category: cat.slug,
    description: "منتج تجريبي — عدّله أو احذفه من لوحة الأدمن.",
    sizes: cat.defaultSizes,
    colors: cat.defaultColors,
    createdAt: STAMP,
    updatedAt: STAMP,
  })),
);
