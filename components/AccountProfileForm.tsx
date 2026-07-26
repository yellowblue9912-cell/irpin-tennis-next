"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export type EditablePlayerProfile = {
  id: string;
  slug: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  birth_date: string | null;
  tennis_experience_years: number | null;
  phone_public: boolean;
};

export default function AccountProfileForm({
  player,
}: {
  player: EditablePlayerProfile;
}) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(player.photo_url);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setMessage("Оберіть зображення розміром до 5 МБ.");
      return;
    }

    setPending(true);
    setMessage("Завантажуємо фото…");
    const formData = new FormData();
    formData.set("photo", file);
    const response = await fetch("/api/account/avatar", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as {
      photoUrl?: string;
      error?: string;
    };

    if (!response.ok || !result.photoUrl) {
      setMessage(
        `Не вдалося завантажити фото: ${result.error ?? "невідома помилка"}`,
      );
    } else {
      setPhotoUrl(result.photoUrl);
      setMessage("Фото завантажено. Натисніть «Зберегти профіль».");
    }
    setPending(false);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const publicPayload = {
      name: String(form.get("name") ?? "").trim(),
      bio: nullable(form.get("bio")),
      city: nullable(form.get("city")),
      photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    };
    const privatePayload = {
      player_id: player.id,
      phone: nullable(form.get("phone")),
      birth_date: nullable(form.get("birth_date")),
      tennis_experience_years: nullableNumber(
        form.get("tennis_experience_years"),
      ),
      phone_public: form.get("phone_visibility") === "public",
      updated_at: new Date().toISOString(),
    };

    if (publicPayload.name.length < 2) {
      setMessage("Вкажіть ім’я гравця.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login");
      return;
    }

    const [{ error: publicError }, { error: privateError }] =
      await Promise.all([
        supabase
          .from("players")
          .update(publicPayload)
          .eq("id", player.id)
          .eq("user_id", userData.user.id),
        supabase
          .from("player_private_profiles")
          .upsert(privatePayload, { onConflict: "player_id" }),
      ]);
    const error = publicError ?? privateError;

    setMessage(
      error ? `Не вдалося зберегти: ${error.message}` : "Профіль збережено.",
    );
    setPending(false);
    if (!error) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 sm:space-y-6">
      <section className="rounded-[22px] border border-[#123f2d]/15 bg-white p-4 shadow-[0_8px_28px_rgba(18,63,45,0.10)] sm:rounded-[28px] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={player.name} photoUrl={photoUrl} />
          <div>
            <h2 className="text-xl font-black">Фото профілю</h2>
            <p className="mt-1 text-sm text-[#123f2d]/55">
              JPG, PNG або WebP, до 5 МБ.
            </p>
            <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-[#123f2d] px-4 py-3 text-sm font-black text-white">
              Змінити фото
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadPhoto}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#123f2d]/15 bg-white p-4 shadow-[0_8px_28px_rgba(18,63,45,0.10)] sm:rounded-[28px] sm:p-8">
        <h2 className="text-xl font-black">Основна інформація</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Ім’я та прізвище" name="name" defaultValue={player.name} required />
          <Field label="Місто" name="city" defaultValue={player.city ?? ""} />
          <Field label="Дата народження" name="birth_date" type="date" defaultValue={player.birth_date ?? ""} />
          <ExperienceField defaultValue={player.tennis_experience_years} />
          <Field label="Номер телефону" name="phone" type="tel" defaultValue={player.phone ?? ""} />
        </div>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-black uppercase tracking-wide">Про себе</span>
          <textarea
            name="bio"
            defaultValue={player.bio ?? ""}
            maxLength={600}
            rows={6}
            placeholder="Розкажіть про свій тенісний шлях, стиль гри або цілі."
            className="w-full resize-y rounded-xl border-2 border-[#123f2d]/30 bg-[#f1eadc] px-4 py-3 text-base text-[#123f2d] shadow-inner outline-none placeholder:text-[#123f2d]/45 focus:border-[#123f2d] focus:bg-white sm:rounded-2xl"
          />
        </label>
      </section>

      <section className="rounded-[22px] border border-[#123f2d]/15 bg-white p-4 shadow-[0_8px_28px_rgba(18,63,45,0.10)] sm:rounded-[28px] sm:p-8">
        <h2 className="text-xl font-black">Приватність</h2>
        <p className="mt-2 text-sm leading-6 text-[#123f2d]/55">
          Виберіть, хто зможе бачити ваш номер телефону.
        </p>
        <div className="mt-5">
          <PrivacyChoice isPublic={player.phone_public} />
        </div>
      </section>

      {message && (
        <p role="status" className="rounded-2xl bg-[#e8f1d0] p-4 font-bold">
          {message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-[#c6f13d] px-6 py-4 font-black transition hover:bg-[#d4fa58] disabled:opacity-60"
        >
          {pending ? "Зберігаємо…" : "Зберегти профіль"}
        </button>
        <a
          href={`/players/${player.slug}`}
          className="rounded-2xl border border-[#123f2d]/15 px-6 py-4 text-center font-black"
        >
          Переглянути публічний профіль
        </a>
      </div>
    </form>
  );
}

function nullable(value: FormDataEntryValue | null) {
  const result = String(value ?? "").trim();
  return result || null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const result = Number(String(value ?? "").trim());
  return Number.isInteger(result) && result >= 1 && result <= 50
    ? result
    : null;
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  return photoUrl ? (
    <img
      src={photoUrl}
      alt=""
      className="h-28 w-28 rounded-3xl bg-[#eef3e8] object-contain"
    />
  ) : (
    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#c6f13d] text-4xl font-black">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-wide">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 w-full rounded-xl border-2 border-[#123f2d]/30 bg-[#f1eadc] px-4 py-3 text-base text-[#123f2d] shadow-inner outline-none focus:border-[#123f2d] focus:bg-white sm:rounded-2xl"
      />
    </label>
  );
}

function ExperienceField({
  defaultValue,
}: {
  defaultValue: number | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-wide">
        Досвід у тенісі
      </span>
      <select
        name="tennis_experience_years"
        defaultValue={defaultValue ?? ""}
        className="min-h-12 w-full rounded-xl border-2 border-[#123f2d]/30 bg-[#f1eadc] px-4 py-3 text-base text-[#123f2d] shadow-inner outline-none focus:border-[#123f2d] focus:bg-white sm:rounded-2xl"
      >
        <option value="">Не вказано</option>
        {Array.from({ length: 50 }, (_, index) => index + 1).map((years) => (
          <option key={years} value={years}>
            {years} {yearsWord(years)}
          </option>
        ))}
      </select>
    </label>
  );
}

function yearsWord(years: number) {
  const lastTwo = years % 100;
  const last = years % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "років";
  if (last === 1) return "рік";
  if (last >= 2 && last <= 4) return "роки";
  return "років";
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#123f2d]/20 bg-[#f1eadc] p-4 sm:rounded-2xl">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 accent-[#123f2d]" />
      <span className="font-bold">{label}</span>
    </label>
  );
}

function PrivacyChoice({ isPublic }: { isPublic: boolean }) {
  return (
    <fieldset className="rounded-xl border-2 border-[#123f2d]/20 bg-[#f1eadc] p-4 sm:rounded-2xl">
      <legend className="px-1 text-sm font-black uppercase tracking-wide">
        Хто бачить телефон
      </legend>
      <div className="mt-2 space-y-3">
        <label className="flex cursor-pointer items-center gap-3 font-bold">
          <input
            name="phone_visibility"
            type="radio"
            value="public"
            defaultChecked={isPublic}
            className="h-5 w-5 accent-[#123f2d]"
          />
          <span>Показувати всім</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 font-bold">
          <input
            name="phone_visibility"
            type="radio"
            value="registered"
            defaultChecked={!isPublic}
            className="h-5 w-5 accent-[#123f2d]"
          />
          <span>Лише зареєстрованим користувачам</span>
        </label>
      </div>
    </fieldset>
  );
}
