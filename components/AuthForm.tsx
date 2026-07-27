"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (password.length < 8) {
      setMessage("Пароль має містити щонайменше 8 символів.");
      setPending(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Не вдалося увійти. Перевірте email і пароль.");
      } else {
        router.replace("/account");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const rateLimited =
          error.message.toLowerCase().includes("rate limit") ||
          error.status === 429;
        setMessage(
          rateLimited
            ? "Тимчасово перевищено ліміт реєстрацій. Спробуйте ще раз трохи пізніше або напишіть адміністратору."
            : error.message,
        );
      } else if (data.session) {
        router.replace("/account");
        router.refresh();
      } else {
        setMessage(
          "Перевірте пошту та підтвердьте реєстрацію. Після цього адміністратор прив’яже ваш акаунт до профілю гравця.",
        );
      }
    }

    setPending(false);
  }

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-2 rounded-2xl bg-[#f6f0e5] p-1">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setMessage("");
            }}
            className={`rounded-xl px-3 py-3 text-sm font-black transition ${
              mode === item
                ? "bg-[#123f2d] text-white"
                : "text-[#123f2d]/60"
            }`}
          >
            {item === "login" ? "Увійти" : "Реєстрація"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Пароль"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {message && (
          <p className="rounded-2xl bg-[#f6f0e5] p-4 text-sm leading-6 text-[#123f2d]/75">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-[#c6f13d] px-5 py-4 font-black text-[#123f2d] transition hover:bg-[#d4fa58] disabled:opacity-60"
        >
          {pending
            ? "Зачекайте…"
            : mode === "login"
              ? "Увійти в кабінет"
              : "Створити акаунт"}
        </button>

        {mode === "signup" && (
          <p className="text-center text-sm leading-6 text-[#123f2d]/60">
            Створіть кабінет, щоб керувати профілем, грати рейтингові матчі,
            залишати коментарі та бачити закритий Telegram-чат спільноти.
          </p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-wide">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3.5 outline-none transition focus:border-[#123f2d]"
      />
    </label>
  );
}
