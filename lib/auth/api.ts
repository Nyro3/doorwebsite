// تسجيل الدخول للعملاء: زائر بالرقم فقط / عميل بالإيميل والباسورد
// (الأدمن بيتعمل من قاعدة البيانات بس — مفيش تسجيل أدمن من الموقع)

import { getSupabase } from "../supabase/client";

/** بيحوّل الأرقام العربي لإنجليزي، وبيشيل المسافات والشرطات. بيرجّع null لو الرقم مش منطقي. */
export function normalizePhone(input: string): string | null {
  const latin = input
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s\-()]/g, "");
  return /^\+?\d{8,15}$/.test(latin) ? latin : null;
}

/** دخول كزائر: رقم التليفون بس (والاسم اختياري) — من غير إيميل ولا باسورد */
export async function signInGuest(phone: string, fullName?: string): Promise<void> {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error("اكتب رقم تليفون صحيح (أرقام فقط، من 8 لـ 15 رقم).");

  const { error } = await getSupabase().auth.signInAnonymously({
    options: { data: { full_name: fullName?.trim() ?? "", phone: normalized } },
  });
  if (error) {
    throw new Error(
      /anonymous/i.test(error.message)
        ? "دخول الزائر مش متفعّل لسه (فعّل Allow anonymous sign-ins في Supabase)."
        : "تعذر الدخول كزائر، حاول تاني.",
    );
  }
}

/** إنشاء حساب عميل: الاسم + الرقم + الإيميل + الباسورد */
export async function signUpCustomer(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}): Promise<{ needsConfirmation: boolean }> {
  const phone = normalizePhone(input.phone);
  if (!input.fullName.trim()) throw new Error("اكتب اسمك.");
  if (!phone) throw new Error("اكتب رقم تليفون صحيح (أرقام فقط، من 8 لـ 15 رقم).");
  if (input.password.length < 8) throw new Error("الباسورد لازم يكون 8 حروف على الأقل.");

  const { data, error } = await getSupabase().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { full_name: input.fullName.trim(), phone } },
  });
  if (error) {
    throw new Error(
      /registered|already/i.test(error.message)
        ? "الإيميل ده مسجّل قبل كده، سجّل دخول."
        : "تعذر إنشاء الحساب. راجع البيانات وحاول تاني.",
    );
  }
  return { needsConfirmation: !data.session };
}

/** دخول عميل بالإيميل والباسورد */
export async function signInCustomer(email: string, password: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error("الإيميل أو الباسورد غلط (أو الإيميل لسه متأكدش).");
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}
