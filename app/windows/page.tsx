import type { Metadata } from "next";
import CategoryPage from "../../compomemts/CategoryPage";
import { CATEGORY_BY_SLUG } from "../../lib/products/categories";

const meta = CATEGORY_BY_SLUG["windows"];

export const metadata: Metadata = {
  title: `${meta.title} | معرض السلام`,
  description: meta.description,
};

export default function WindowsPage() {
  return <CategoryPage category="windows" />;
}
