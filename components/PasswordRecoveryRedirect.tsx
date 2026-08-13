"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PasswordRecoveryRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/update-password") return;

    const hash = window.location.hash;
    const query = new URLSearchParams(window.location.search);
    const recoveryInHash = hash.includes("type=recovery");
    const code = query.get("code");

    if (recoveryInHash) {
      window.location.replace(`/update-password${hash}`);
      return;
    }

    if (code) {
      window.location.replace(
        `/auth/callback?code=${encodeURIComponent(code)}&next=/update-password`,
      );
      return;
    }

    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/update-password");
      }
    });

    return () => data.subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
