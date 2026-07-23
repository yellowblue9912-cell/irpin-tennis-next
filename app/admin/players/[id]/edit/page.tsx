import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../../lib/supabase/server";

type EditPlayerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPlayerPage({
  params,
}: EditPlayerPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !player) {
    notFound();
  }

  async function updatePlayer(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const rating = Number(formData.get("rating"));
    const city = String(formData.get("city") ?? "").trim();
    const isActive = formData.get("is_active") === "on";

    if (!name) {
      throw new Error("Вкажіть ім’я гравця");
    }

    if (!slug) {
      throw new Error("Вкажіть slug");
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 7) {
      throw new Error("Рейтинг повинен бути від 1.00 до 7.00");
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("players")
      .update({
        name,
        slug,
        rating,
        city: city || null,
        is_active: isActive,
      })
      .eq("id", id);

    if (error) {
      console.error("Update player error:", error);
      throw new Error(`Не вдалося оновити гравця: ${error.message}`);
    }

    revalidatePath("/admin/players");
    redirect("/admin/players");
  }

  return (
    <main>
      <Link
        href="/admin/players"
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до гравців
      </Link>

      <div className="mt-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Players
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Редагувати гравця
        </h1>

        <p className="mt-3 text-[#123f2d]/55">
          Зміни інформацію про учасника IRPIN TENNIS.
        </p>
      </div>

      <form
        action={updatePlayer}
        className="mt-8 max-w-2xl rounded-[28px] bg-white p-7 shadow-sm md:p-9"
      >
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
            defaultValue={player.name}
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
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
            required
            defaultValue={player.slug}
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <div className="mt-6">
          <label
            htmlFor="rating"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Рейтинг
          </label>

          <input
            id="rating"
            name="rating"
            type="number"
            required
            min="1"
            max="7"
            step="0.25"
            defaultValue={player.rating}
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <div className="mt-6">
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Місто
          </label>

          <input
            id="city"
            name="city"
            type="text"
            defaultValue={player.city ?? ""}
            placeholder="Наприклад: Ірпінь"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl bg-[#f6f0e5] p-4">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={player.is_active}
            className="h-5 w-5 accent-[#123f2d]"
          />

          <span>
            <strong className="block">Активний гравець</strong>

            <span className="text-sm text-[#123f2d]/50">
              Гравець відображатиметься в актуальному рейтингу.
            </span>
          </span>
        </label>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            Зберегти зміни
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