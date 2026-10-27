"use client";

import { useEffect, useState } from "react";
import { getMyProfile } from "../orders/api";
import { getSupabase, SUPABASE_ENABLED } from "../supabase/client";

type Profile = Awaited<ReturnType<typeof getMyProfile>>;

/** بيرجّع بيانات الحساب الحالي (أو null لو مفيش حد مسجّل)، وبيتحدّث لوحده عند الدخول والخروج */
export function useMyProfile(): { profile: Profile; loading: boolean } {
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(SUPABASE_ENABLED);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    let alive = true;
    const refresh = () =>
      getMyProfile().then((p) => {
        if (!alive) return;
        setProfile(p);
        setLoading(false);
      });

    void refresh();
    const { data } = getSupabase().auth.onAuthStateChange(() => {
      setTimeout(() => void refresh(), 0); // مش بنعمل await جوه الـ callback (بيعمل تعليق في supabase-js)
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
