"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setMessage(
      error
        ? "Не вдалося надіслати лист. Перевірте email або спробуйте трохи пізніше."
        : "Якщо акаунт із такою поштою існує, ми надіслали посилання для зміни пароля. Перевірте також папку «Спам».",
    );
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-black uppercase tracking-wide">Email</span>
        <input name="email" type="email" required autoComplete="email" className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3.5 outline-none transition focus:border-[#123f2d]" />
      </label>
      {message && <p aria-live="polite" className="rounded-2xl bg-[#f6f0e5] p-4 text-sm leading-6 text-[#123f2d]/75">{message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-[#c6f13d] px-5 py-4 font-black text-[#123f2d] transition hover:bg-[#d4fa58] disabled:opacity-60">
        {pending ? "Надсилаємо…" : "Надіслати посилання"}
      </button>
    </form>
  );
}
