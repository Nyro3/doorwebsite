// أرقام المعرض (نفس أرقام الفوتر) — مكان واحد للتعديل.
export const PHONES = ["01270469567", "01556009567"];

/** 01270469567 → https://wa.me/201270469567 (+ نص جاهز اختياري) */
export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/20${phone.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
