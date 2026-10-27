// شكل بيانات المنتج — هو نفسه اللي هيرجع من الـ Backend بعدين (JSON).

export type CategorySlug =
  | "wood-doors" // الأبواب الخشبية
  | "armored-doors" // الأبواب المصفحة
  | "interior-doors" // الأبواب الداخلية
  | "windows"; // الشبابيك

export interface ProductColor {
  name: string; // مثال: "بني"
  hex: string; // مثال: "#6b4423"
}

export interface Product {
  id: string;
  name: string;
  category: CategorySlug; // الصفحة اللي المنتج بيظهر فيها
  description?: string;
  image?: string; // رابط صورة (حاليًا ممكن يبقى data URL، وبعد الـ Backend هيبقى رابط مرفوع)
  sizes: string[]; // مثال: ["80×200", "90×200"]
  colors: ProductColor[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// اللي الأدمن بيبعته عند الإضافة/التعديل (الـ id والتواريخ بيتولدوا في الـ API)
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
