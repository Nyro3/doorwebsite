import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true لما متغيرات البيئة متظبطة (يعني الموقع بيشتغل على Supabase) */
export const SUPABASE_ENABLED = Boolean(url && key);

const client: SupabaseClient | null = SUPABASE_ENABLED ? createClient(url!, key!) : null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error("Supabase مش متظبط: ضيف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local");
  }
  return client;
}
