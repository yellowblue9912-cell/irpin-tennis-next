"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 8) { setMessage("Пароль має містити щонайменше 8 символів."); setPending(false); return; }
    if (password !== confirmation) { setMessage("Паролі не збігаються."); setPending(false); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMessage("Посилання недійсне або застаріло. Запросіть новий лист для відновлення пароля."); setPending(false); return; }
    router.replace("/account?password_updated=1"); router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-5">
      <PasswordField label="Новий пароль" name="password" />
      <PasswordField label="Повторіть пароль" name="confirmation" />
      {message && <p aria-live="polite" className="rounded-2xl bg-[#f6f0e5] p-4 text-sm leading-6 text-[#123f2d]/75">{message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-[#c6f13d] px-5 py-4 font-black text-[#123f2d] transition hover:bg-[#d4fa58] disabled:opacity-60">{pending ? "Зберігаємо…" : "Встановити новий пароль"}</button>
    </form>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-black uppercase tracking-wide">{label}</span><input name={name} type="password" required minLength={8} autoComplete="new-password" className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3.5 outline-none transition focus:border-[#123f2d]" /></label>;
}
