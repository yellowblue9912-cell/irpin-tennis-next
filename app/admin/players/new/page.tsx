"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPlayer, type CreatePlayerState } from "./actions";

export default function NewPlayerPage() {
  const initialState: CreatePlayerState = { error: null };
  const [state, formAction, isPending] = useActionState(
    createPlayer,
    initialState,
  );

  return (
    <main>
      <div className="mb-8">
        <Link
          href="/admin/players"
          className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
        >
          ← Повернутися до гравців
        </Link>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Players
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase">
          Додати гравця
        </h1>

        <p className="mt-3 text-[#123f2d]/55">
          Створи новий профіль учасника IRPIN TENNIS.
        </p>
      </div>

      <form
        action={formAction}
        autoComplete="off"
        className="max-w-2xl rounded-[28px] bg-white p-7 shadow-sm md:p-9"
      >
        {state.error ? (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700"
          >
            {state.error}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Ім’я гравця
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Наприклад: Павло Рибальський"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <div className="mt-6">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Email облікового запису
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="player@example.com"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />

          <p className="mt-2 text-sm text-[#123f2d]/45">
            Необов’язково. Користувач має спочатку зареєструватися на сайті з
            цією поштою.
          </p>
        </div>

        <div className="mt-6">
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="Можна залишити порожнім"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />

          <p className="mt-2 text-sm text-[#123f2d]/45">
            Використовується в адресі профілю. Якщо залишити порожнім, створиться автоматично.
          </p>
        </div>

        <div className="mt-6">
          <label
            htmlFor="rating"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Початковий рейтинг
          </label>

          <input
            id="rating"
            name="rating"
            type="text"
            inputMode="decimal"
            required
            pattern="[1-7](?:[.,][0-9]{1,2})?"
            defaultValue="3.0"
            placeholder="Наприклад: 3.01"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />

          <p className="mt-2 text-sm text-[#123f2d]/45">
            Можна вказати точний поточний рейтинг через крапку або кому:
            3.01 чи 3,01.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            {isPending ? "Зберігаємо…" : "Зберегти гравця"}
          </button>

          <Link
            href="/admin/players"
            className="inline-flex items-center justify-center rounded-2xl border border-[#123f2d]/15 px-6 py-3 font-black transition hover:bg-[#f6f0e5]"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </main>
  );
}
